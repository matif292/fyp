import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/booking_models.dart';
import '../../services/booking_service.dart';
import '../../widgets/state_widgets.dart';

class OffersScreen extends StatefulWidget {
  const OffersScreen({super.key});
  @override
  State<OffersScreen> createState() => _OffersScreenState();
}

class _OffersScreenState extends State<OffersScreen> {
  final _negotiationService = NegotiationService();
  late Future<List<Negotiation>> _future;

  @override
  void initState() {
    super.initState();
    _future = _negotiationService.ownerOffers();
  }

  Future<void> _counter(Negotiation n) async {
    final controller = TextEditingController();
    final value = await showModalBottomSheet<double>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Counter offer for Rs ${n.offerPrice.toStringAsFixed(0)}',
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Your counter-offer (Rs)'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, double.tryParse(controller.text)),
              child: const Text('Send counter-offer'),
            ),
          ],
        ),
      ),
    );
    if (value == null) return;
    try {
      await _negotiationService.respond(n.id, action: 'counter', counterOffer: value);
      setState(() => _future = _negotiationService.ownerOffers());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
    }
  }

  Future<void> _respond(Negotiation n, String action) async {
    if (action == 'reject') {
      final confirmed = await confirmAction(context,
          title: 'Reject offer', message: 'Are you sure you want to reject this offer?');
      if (!confirmed) return;
    }
    try {
      await _negotiationService.respond(n.id, action: action);
      setState(() => _future = _negotiationService.ownerOffers());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Offers')),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _future = _negotiationService.ownerOffers()),
        child: FutureBuilder<List<Negotiation>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
            if (snapshot.hasError) {
              return ErrorState(
                  message: apiErrorMessage(snapshot.error!),
                  onRetry: () => setState(() => _future = _negotiationService.ownerOffers()));
            }
            final offers = snapshot.data ?? [];
            if (offers.isEmpty) {
              return const EmptyState(
                  icon: LucideIcons.heartHandshake,
                  title: 'No incoming offers',
                  subtitle: "You'll see price offers from travelers here.");
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: offers.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final o = offers[i];
                final pending = o.status == 'pending';
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(children: [
                          Expanded(child: Text(o.hostelName ?? 'Hostel #${o.hostelId}', style: const TextStyle(fontWeight: FontWeight.w700))),
                          StatusBadge.fromStatus(o.status),
                        ]),
                        const SizedBox(height: 6),
                        Text('Offer: Rs ${o.offerPrice.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.gray700)),
                        if (pending) ...[
                          const SizedBox(height: 12),
                          Row(children: [
                            Expanded(
                              child: OutlinedButton(onPressed: () => _respond(o, 'reject'), child: const Text('Reject')),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton(onPressed: () => _counter(o), child: const Text('Counter')),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(onPressed: () => _respond(o, 'accept'), child: const Text('Accept')),
                            ),
                          ]),
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
    );
  }
}
