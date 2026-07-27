import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../services/misc_services.dart';
import '../../widgets/state_widgets.dart';

class TripPlannerScreen extends StatefulWidget {
  const TripPlannerScreen({super.key});
  @override
  State<TripPlannerScreen> createState() => _TripPlannerScreenState();
}

class _TripPlannerScreenState extends State<TripPlannerScreen> {
  final _tripService = TripService();
  late Future<List<dynamic>> _tripsFuture;

  @override
  void initState() {
    super.initState();
    _tripsFuture = _tripService.list();
  }

  Future<void> _createTripDialog() async {
    final destinationController = TextEditingController();
    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
            left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Start a group trip', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 12),
            TextField(
              controller: destinationController,
              decoration: const InputDecoration(labelText: 'Destination'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx, destinationController.text.trim()),
              child: const Text('Create trip'),
            ),
          ],
        ),
      ),
    );
    if (result == null || result.isEmpty) return;
    try {
      await _tripService.create({'destination': result});
      setState(() => _tripsFuture = _tripService.list());
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trip Planner'),
        actions: [IconButton(icon: const Icon(LucideIcons.plus), onPressed: _createTripDialog)],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _tripsFuture = _tripService.list()),
        child: FutureBuilder<List<dynamic>>(
          future: _tripsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
            if (snapshot.hasError) {
              return ErrorState(
                  message: apiErrorMessage(snapshot.error!),
                  onRetry: () => setState(() => _tripsFuture = _tripService.list()));
            }
            final trips = snapshot.data ?? [];
            if (trips.isEmpty) {
              return EmptyState(
                icon: LucideIcons.users,
                title: 'No group trips yet',
                subtitle: 'Start a trip and invite fellow travelers to join.',
                actionLabel: 'Start a trip',
                onAction: _createTripDialog,
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: trips.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final t = trips[i] as Map;
                return Card(
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: AppColors.gray100,
                      child: Icon(LucideIcons.mountainSnow, color: AppColors.primary),
                    ),
                    title: Text(t['destination']?.toString() ?? t['title']?.toString() ?? 'Trip'),
                    subtitle: Text(t['status']?.toString() ?? 'Planning'),
                    trailing: const Icon(LucideIcons.chevronRight, color: AppColors.gray400),
                    onTap: () {},
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
