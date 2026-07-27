import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/booking_models.dart';
import '../../services/booking_service.dart';
import '../../widgets/state_widgets.dart';

class MyTripsScreen extends StatefulWidget {
  const MyTripsScreen({super.key});
  @override
  State<MyTripsScreen> createState() => _MyTripsScreenState();
}

class _MyTripsScreenState extends State<MyTripsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _bookingService = BookingService();
  final _negotiationService = NegotiationService();

  late Future<List<Booking>> _bookingsFuture;
  late Future<List<Negotiation>> _offersFuture;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _bookingsFuture = _bookingService.myBookings();
    _offersFuture = _negotiationService.myOffers();
  }

  Future<void> _cancelBooking(Booking b) async {
    final confirmed = await confirmAction(context,
        title: 'Cancel booking', message: 'Are you sure you want to cancel this booking?');
    if (!confirmed) return;
    try {
      await _bookingService.cancel(b.id);
      setState(() => _bookingsFuture = _bookingService.myBookings());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    final df = DateFormat('MMM d');
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Trips'),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.gray500,
          indicatorColor: AppColors.primary,
          tabs: const [Tab(text: 'Bookings'), Tab(text: 'Offers')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          RefreshIndicator(
            onRefresh: () async => setState(() => _bookingsFuture = _bookingService.myBookings()),
            child: FutureBuilder<List<Booking>>(
              future: _bookingsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
                if (snapshot.hasError) {
                  return ErrorState(
                      message: apiErrorMessage(snapshot.error!),
                      onRetry: () => setState(() => _bookingsFuture = _bookingService.myBookings()));
                }
                final bookings = snapshot.data ?? [];
                if (bookings.isEmpty) {
                  return const EmptyState(
                      icon: LucideIcons.calendar,
                      title: 'No bookings yet',
                      subtitle: 'Once you book a stay, it will show up here.');
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
                              Expanded(
                                  child: Text(b.hostelName ?? 'Hostel #${b.hostelId}',
                                      style: const TextStyle(fontWeight: FontWeight.w700))),
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
                              Text('Rs ${b.totalPrice.toStringAsFixed(0)}',
                                  style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(width: 8),
                              StatusBadge.fromStatus(b.paymentStatus),
                            ]),
                            if (b.status == 'pending' || b.status == 'confirmed') ...[
                              const SizedBox(height: 10),
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () => _cancelBooking(b),
                                  style: TextButton.styleFrom(foregroundColor: AppColors.danger),
                                  child: const Text('Cancel booking'),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          RefreshIndicator(
            onRefresh: () async => setState(() => _offersFuture = _negotiationService.myOffers()),
            child: FutureBuilder<List<Negotiation>>(
              future: _offersFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
                if (snapshot.hasError) {
                  return ErrorState(
                      message: apiErrorMessage(snapshot.error!),
                      onRetry: () => setState(() => _offersFuture = _negotiationService.myOffers()));
                }
                final offers = snapshot.data ?? [];
                if (offers.isEmpty) {
                  return const EmptyState(
                      icon: LucideIcons.handshake,
                      title: 'No offers yet',
                      subtitle: 'Negotiate a price on any hostel to see it here.');
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: offers.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final o = offers[i];
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              Expanded(
                                  child: Text(o.hostelName ?? 'Hostel #${o.hostelId}',
                                      style: const TextStyle(fontWeight: FontWeight.w700))),
                              StatusBadge.fromStatus(o.status),
                            ]),
                            const SizedBox(height: 6),
                            Text('Your offer: Rs ${o.offerPrice.toStringAsFixed(0)}',
                                style: const TextStyle(color: AppColors.gray600)),
                            if (o.counterOffer != null) ...[
                              const SizedBox(height: 2),
                              Text('Owner countered: Rs ${o.counterOffer!.toStringAsFixed(0)}',
                                  style: const TextStyle(color: AppColors.warning, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 10),
                              Align(
                                alignment: Alignment.centerRight,
                                child: ElevatedButton(
                                  onPressed: () async {
                                    try {
                                      await _negotiationService.acceptCounter(o.id);
                                      setState(() => _offersFuture = _negotiationService.myOffers());
                                    } catch (e) {
                                      if (mounted) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
                                      }
                                    }
                                  },
                                  child: const Text('Accept counter-offer'),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
