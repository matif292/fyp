import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../models/booking_models.dart';
import '../../services/hostel_service.dart';
import '../../services/booking_service.dart';
import '../../widgets/state_widgets.dart';

class OwnerDashboardScreen extends StatefulWidget {
  const OwnerDashboardScreen({super.key});
  @override
  State<OwnerDashboardScreen> createState() => _OwnerDashboardScreenState();
}

class _OwnerDashboardScreenState extends State<OwnerDashboardScreen> {
  final _hostelService = HostelService();
  final _bookingService = BookingService();
  late Future<_DashboardData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_DashboardData> _load() async {
    final hostels = await _hostelService.ownerHostels();
    final Map<String, int> bookingsByHostel = {};
    int totalBookings = 0;
    double totalRevenue = 0;
    for (final h in hostels) {
      try {
        final bookings = await _bookingService.hostelBookings(h.id);
        bookingsByHostel[h.name] = bookings.length;
        totalBookings += bookings.length;
        totalRevenue += bookings
            .where((b) => b.paymentStatus == 'paid')
            .fold(0.0, (sum, b) => sum + b.totalPrice);
      } catch (_) {
        bookingsByHostel[h.name] = 0;
      }
    }
    return _DashboardData(
        hostels: hostels, bookingsByHostel: bookingsByHostel, totalBookings: totalBookings, totalRevenue: totalRevenue);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _future = _load()),
        child: FutureBuilder<_DashboardData>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
            if (snapshot.hasError) {
              return ErrorState(
                  message: apiErrorMessage(snapshot.error!), onRetry: () => setState(() => _future = _load()));
            }
            final data = snapshot.data!;
            if (data.hostels.isEmpty) {
              return const EmptyState(
                  icon: LucideIcons.building2,
                  title: 'No hostels yet',
                  subtitle: 'Add your first property from the Hostels tab to see stats here.');
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(children: [
                  Expanded(child: _statCard('Hostels', data.hostels.length.toString(), LucideIcons.building2)),
                  const SizedBox(width: 12),
                  Expanded(child: _statCard('Bookings', data.totalBookings.toString(), LucideIcons.calendarCheck)),
                ]),
                const SizedBox(height: 12),
                _statCard('Total revenue (paid)', 'Rs ${data.totalRevenue.toStringAsFixed(0)}', LucideIcons.wallet,
                    wide: true),
                const SizedBox(height: 20),
                const Text('Bookings by property', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                const SizedBox(height: 12),
                SizedBox(
                  height: 220,
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: data.totalBookings == 0
                          ? const Center(child: Text('No bookings yet', style: TextStyle(color: AppColors.gray400)))
                          : BarChart(
                              BarChartData(
                                barGroups: [
                                  for (int i = 0; i < data.bookingsByHostel.length; i++)
                                    BarChartGroupData(x: i, barRods: [
                                      BarChartRodData(
                                        toY: data.bookingsByHostel.values.elementAt(i).toDouble(),
                                        color: AppColors.primary,
                                        width: 18,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                    ]),
                                ],
                                titlesData: FlTitlesData(
                                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                                  bottomTitles: AxisTitles(
                                    sideTitles: SideTitles(
                                      showTitles: true,
                                      getTitlesWidget: (value, meta) {
                                        final keys = data.bookingsByHostel.keys.toList();
                                        final idx = value.toInt();
                                        if (idx < 0 || idx >= keys.length) return const SizedBox.shrink();
                                        return Padding(
                                          padding: const EdgeInsets.only(top: 6),
                                          child: Text(
                                            keys[idx].length > 8 ? '${keys[idx].substring(0, 8)}…' : keys[idx],
                                            style: const TextStyle(fontSize: 10, color: AppColors.gray500),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                  leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 28)),
                                ),
                                gridData: const FlGridData(show: false),
                                borderData: FlBorderData(show: false),
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon, {bool wide = false}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                Text(label, style: const TextStyle(color: AppColors.gray500, fontSize: 12)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardData {
  final List<Hostel> hostels;
  final Map<String, int> bookingsByHostel;
  final int totalBookings;
  final double totalRevenue;
  _DashboardData({
    required this.hostels,
    required this.bookingsByHostel,
    required this.totalBookings,
    required this.totalRevenue,
  });
}
