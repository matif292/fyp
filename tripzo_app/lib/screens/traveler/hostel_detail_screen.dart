import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../models/booking_models.dart';
import '../../services/hostel_service.dart';
import '../../services/booking_service.dart';
import '../../widgets/state_widgets.dart';

class HostelDetailScreen extends StatefulWidget {
  final int hostelId;
  const HostelDetailScreen({super.key, required this.hostelId});

  @override
  State<HostelDetailScreen> createState() => _HostelDetailScreenState();
}

class _HostelDetailScreenState extends State<HostelDetailScreen> {
  final _hostelService = HostelService();
  final _bookingService = BookingService();
  final _negotiationService = NegotiationService();
  final _reviewService = ReviewService();

  late Future<Hostel> _hostelFuture;
  late Future<List<RoomType>> _roomsFuture;
  late Future<List<Review>> _reviewsFuture;

  @override
  void initState() {
    super.initState();
    _hostelFuture = _hostelService.getById(widget.hostelId);
    _roomsFuture = _hostelService.getRooms(widget.hostelId);
    _reviewsFuture = _reviewService.forHostel(widget.hostelId);
  }

  String _photoUrl(String p) => p.startsWith('http') ? p : '${ApiClient.instance.uploadsBaseUrl}/$p';

  Future<void> _negotiate(RoomType room) async {
    final controller = TextEditingController();
    final offer = await showModalBottomSheet<double>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
            left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Offer a price for ${room.name}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 4),
            Text('Listed price: Rs ${room.price.toStringAsFixed(0)} / night',
                style: const TextStyle(color: AppColors.gray500)),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Your offer (Rs / night)'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                final v = double.tryParse(controller.text);
                Navigator.pop(ctx, v);
              },
              child: const Text('Send offer'),
            ),
          ],
        ),
      ),
    );
    if (offer == null) return;
    try {
      await _negotiationService.makeOffer({
        'hostel_id': widget.hostelId,
        'room_id': room.id,
        'offer_price': offer,
      });
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(const SnackBar(content: Text('Offer sent to the owner')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
      }
    }
  }

  Future<void> _book(RoomType room) async {
    DateTimeRange? range = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (range == null) return;
    final nights = range.duration.inDays.clamp(1, 365);
    final total = room.price * nights;

    final confirmed = await confirmAction(
      context,
      title: 'Confirm booking',
      message:
          '${room.name} for $nights night(s)\nTotal: Rs ${total.toStringAsFixed(0)}',
      confirmLabel: 'Book now',
      destructive: false,
    );
    if (!confirmed) return;

    try {
      await _bookingService.create({
        'hostel_id': widget.hostelId,
        'room_id': room.id,
        'check_in_date': range.start.toIso8601String().split('T').first,
        'check_out_date': range.end.toIso8601String().split('T').first,
        'guests': room.capacity,
        'total_price': total,
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Booking created!')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<Hostel>(
        future: _hostelFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const LoadingState();
          }
          if (snapshot.hasError || !snapshot.hasData) {
            return ErrorState(
                message: apiErrorMessage(snapshot.error ?? 'Not found'),
                onRetry: () => setState(() => _hostelFuture = _hostelService.getById(widget.hostelId)));
          }
          final hostel = snapshot.data!;
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 220,
                backgroundColor: AppColors.gray50,
                foregroundColor: AppColors.gray900,
                flexibleSpace: FlexibleSpaceBar(
                  background: hostel.photos.isNotEmpty
                      ? PageView(
                          children: hostel.photos
                              .map((p) => CachedNetworkImage(
                                    imageUrl: _photoUrl(p),
                                    fit: BoxFit.cover,
                                    errorWidget: (_, __, ___) => Container(color: AppColors.gray100),
                                  ))
                              .toList(),
                        )
                      : Container(
                          color: AppColors.gray100,
                          child: const Icon(LucideIcons.mountainSnow, size: 48, color: AppColors.gray300)),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(hostel.name,
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                          ),
                          if (hostel.rating != null) ...[
                            const Icon(Icons.star, color: AppColors.warning, size: 18),
                            const SizedBox(width: 2),
                            Text('${hostel.rating!.toStringAsFixed(1)} (${hostel.reviewCount ?? 0})'),
                          ],
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(children: [
                        const Icon(LucideIcons.mapPin, size: 15, color: AppColors.gray500),
                        const SizedBox(width: 4),
                        Text(hostel.city, style: const TextStyle(color: AppColors.gray500)),
                      ]),
                      if (hostel.description != null) ...[
                        const SizedBox(height: 12),
                        Text(hostel.description!, style: const TextStyle(color: AppColors.gray700, height: 1.4)),
                      ],
                      if (hostel.amenities.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        const Text('Amenities', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: hostel.amenities
                              .map((a) => Chip(
                                    label: Text(a, style: const TextStyle(fontSize: 12)),
                                    backgroundColor: AppColors.gray100,
                                    side: BorderSide.none,
                                  ))
                              .toList(),
                        ),
                      ],
                      const SizedBox(height: 20),
                      const Text('Rooms', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      const SizedBox(height: 8),
                      FutureBuilder<List<RoomType>>(
                        future: _roomsFuture,
                        builder: (context, roomSnap) {
                          if (roomSnap.connectionState == ConnectionState.waiting) {
                            return const Padding(padding: EdgeInsets.all(16), child: LoadingState());
                          }
                          if (roomSnap.hasError) {
                            return ErrorState(message: apiErrorMessage(roomSnap.error!));
                          }
                          final rooms = roomSnap.data ?? [];
                          if (rooms.isEmpty) {
                            return const EmptyState(
                                title: 'No rooms listed yet', subtitle: 'Check back later for availability.');
                          }
                          return Column(
                            children: rooms.map((room) => _RoomCard(
                              room: room,
                              onNegotiate: () => _negotiate(room),
                              onBook: () => _book(room),
                            )).toList(),
                          );
                        },
                      ),
                      const SizedBox(height: 20),
                      const Text('Reviews', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      const SizedBox(height: 8),
                      FutureBuilder<List<Review>>(
                        future: _reviewsFuture,
                        builder: (context, revSnap) {
                          if (revSnap.connectionState == ConnectionState.waiting) {
                            return const Padding(padding: EdgeInsets.all(16), child: LoadingState());
                          }
                          if (revSnap.hasError) {
                            return ErrorState(message: apiErrorMessage(revSnap.error!));
                          }
                          final reviews = revSnap.data ?? [];
                          if (reviews.isEmpty) {
                            return const EmptyState(
                                icon: LucideIcons.messageSquare,
                                title: 'No reviews yet',
                                subtitle: 'Be the first to review this stay after your trip.');
                          }
                          return Column(
                            children: reviews
                                .map((r) => Padding(
                                      padding: const EdgeInsets.only(bottom: 10),
                                      child: Card(
                                        child: Padding(
                                          padding: const EdgeInsets.all(12),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Row(children: [
                                                Text(r.travelerName ?? 'Traveler',
                                                    style: const TextStyle(fontWeight: FontWeight.w600)),
                                                const Spacer(),
                                                Row(children: List.generate(
                                                    5,
                                                    (i) => Icon(Icons.star,
                                                        size: 14,
                                                        color: i < r.rating ? AppColors.warning : AppColors.gray200))),
                                              ]),
                                              if (r.comment != null) ...[
                                                const SizedBox(height: 6),
                                                Text(r.comment!, style: const TextStyle(color: AppColors.gray600)),
                                              ],
                                            ],
                                          ),
                                        ),
                                      ),
                                    ))
                                .toList(),
                          );
                        },
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _RoomCard extends StatelessWidget {
  final RoomType room;
  final VoidCallback onNegotiate;
  final VoidCallback onBook;
  const _RoomCard({required this.room, required this.onNegotiate, required this.onBook});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                    child: Text(room.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15))),
                Text('Rs ${room.price.toStringAsFixed(0)}/night',
                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
              ],
            ),
            const SizedBox(height: 4),
            Text('Sleeps ${room.capacity} • ${room.availableRooms} available',
                style: const TextStyle(color: AppColors.gray500, fontSize: 13)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(onPressed: onNegotiate, child: const Text('Negotiate')),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(onPressed: onBook, child: const Text('Book')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
