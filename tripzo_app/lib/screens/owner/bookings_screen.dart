import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../models/booking_models.dart';
import '../../services/hostel_service.dart';
import '../../services/booking_service.dart';
import '../../widgets/state_widgets.dart';

class OwnerBookingsScreen extends StatefulWidget {
  const OwnerBookingsScreen({super.key});
  @override
  State<OwnerBookingsScreen> createState() => _OwnerBookingsScreenState();
}

class _OwnerBookingsScreenState extends State<OwnerBookingsScreen> {
  final _hostelService = HostelService();
  final _bookingService = BookingService();
  late Future<List<Hostel>> _hostelsFuture;
  Hostel? _selected;
  Future<List<Booking>>? _bookingsFuture;

  @override
  void initState() {
    super.initState();
    _hostelsFuture = _hostelService.ownerHostels();
  }

  void _select(Hostel h) {
    setState(() {
      _selected = h;
      _bookingsFuture = _bookingService.hostelBookings(h.id);
    });
  }

  final _statuses = const ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'];

  @override
  Widget build(BuildContext context) {
    final df = DateFormat('MMM d');
    return Scaffold(
      appBar: AppBar(title: const Text('Bookings')),
      body: FutureBuilder<List<Hostel>>(
        future: _hostelsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
          if (snapshot.hasError) return ErrorState(message: apiErrorMessage(snapshot.error!));
          final hostels = snapshot.data ?? [];
          if (hostels.isEmpty) {
            return const EmptyState(
                icon: LucideIcons.building2, title: 'No hostels yet', subtitle: 'Add a hostel to start tracking bookings.');
          }
          _selected ??= hostels.first;
          _bookingsFuture ??= _bookingService.hostelBookings(_selected!.id);

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: DropdownButtonFormField<Hostel>(
                  value: hostels.contains(_selected) ? _selected : hostels.first,
                  items: hostels.map((h) => DropdownMenuItem(value: h, child: Text(h.name))).toList(),
                  onChanged: (h) {
                    if (h != null) _select(h);
                  },
                  decoration: const InputDecoration(labelText: 'Property'),
                ),
              ),
              Expanded(
                child: RefreshIndicator(
                  onRefresh: () async => _select(_selected!),
                  child: FutureBuilder<List<Booking>>(
                    future: _bookingsFuture,
                    builder: (context, bSnap) {
                      if (bSnap.connectionState == ConnectionState.waiting) return const LoadingState();
                      if (bSnap.hasError) {
                        return ErrorState(message: apiErrorMessage(bSnap.error!), onRetry: () => _select(_selected!));
                      }
                      final bookings = bSnap.data ?? [];
                      if (bookings.isEmpty) {
                        return const EmptyState(
                            icon: LucideIcons.calendarCheck,
                            title: 'No bookings yet',
                            subtitle: 'Bookings for this property will show up here.');
                      }
                      return ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: bookings.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, i) {
                          final b = bookings[i];
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(children: [
                                    Text('Booking #${b.id}', style: const TextStyle(fontWeight: FontWeight.w700)),
                                    const Spacer(),
                                    StatusBadge.fromStatus(b.status),
                                  ]),
                                  const SizedBox(height: 6),
                                  Text(
                                    b.checkIn != null && b.checkOut != null
                                        ? '${df.format(b.checkIn!)} – ${df.format(b.checkOut!)} • ${b.guests} guest(s)'
                                        : '${b.guests} guest(s)',
                                    style: const TextStyle(color: AppColors.gray500, fontSize: 13),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(children: [
                                    Text('Rs ${b.totalPrice.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                                    const SizedBox(width: 8),
                                    StatusBadge.fromStatus(b.paymentStatus),
                                  ]),
                                  const SizedBox(height: 10),
                                  DropdownButtonFormField<String>(
                                    value: _statuses.contains(b.status) ? b.status : null,
                                    hint: const Text('Update status'),
                                    items: _statuses
                                        .map((s) => DropdownMenuItem(value: s, child: Text(s.replaceAll('_', ' '))))
                                        .toList(),
                                    onChanged: (s) async {
                                      if (s == null) return;
                                      try {
                                        await _bookingService.updateStatus(b.id, s);
                                        _select(_selected!);
                                      } catch (e) {
                                        if (mounted) {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
                                        }
                                      }
                                    },
                                    decoration: const InputDecoration(isDense: true),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
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
