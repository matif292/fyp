import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../services/hostel_service.dart';
import '../../widgets/state_widgets.dart';

class RoomManagementScreen extends StatefulWidget {
  final int hostelId;
  const RoomManagementScreen({super.key, required this.hostelId});

  @override
  State<RoomManagementScreen> createState() => _RoomManagementScreenState();
}

class _RoomManagementScreenState extends State<RoomManagementScreen> {
  final _service = HostelService();
  late Future<List<RoomType>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.getRooms(widget.hostelId);
  }

  Future<void> _addRoomDialog() async {
    final nameController = TextEditingController();
    final priceController = TextEditingController();
    final capacityController = TextEditingController();
    final availableController = TextEditingController();

    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx).viewInsets.bottom + 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Add room type', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
            const SizedBox(height: 12),
            TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Room type name')),
            const SizedBox(height: 12),
            TextField(controller: priceController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Price per night')),
            const SizedBox(height: 12),
            TextField(controller: capacityController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Capacity')),
            const SizedBox(height: 12),
            TextField(controller: availableController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Available rooms')),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Add')),
          ],
        ),
      ),
    );
    if (confirmed != true) return;
    try {
      await _service.addRoom(widget.hostelId, {
        'room_type': nameController.text.trim(),
        'price_per_night': double.tryParse(priceController.text) ?? 0,
        'capacity': int.tryParse(capacityController.text) ?? 1,
        'available_rooms': int.tryParse(availableController.text) ?? 0,
      });
      setState(() => _future = _service.getRooms(widget.hostelId));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Rooms'),
        actions: [IconButton(icon: const Icon(LucideIcons.plus), onPressed: _addRoomDialog)],
      ),
      body: FutureBuilder<List<RoomType>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
          if (snapshot.hasError) {
            return ErrorState(
                message: apiErrorMessage(snapshot.error!),
                onRetry: () => setState(() => _future = _service.getRooms(widget.hostelId)));
          }
          final rooms = snapshot.data ?? [];
          if (rooms.isEmpty) {
            return EmptyState(
              icon: LucideIcons.doorOpen,
              title: 'No room types yet',
              subtitle: 'Add a room type so travelers can book.',
              actionLabel: 'Add room',
              onAction: _addRoomDialog,
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: rooms.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final r = rooms[i];
              return Card(
                child: ListTile(
                  title: Text(r.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text('Sleeps ${r.capacity} • ${r.availableRooms} available'),
                  trailing: Text('Rs ${r.price.toStringAsFixed(0)}',
                      style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
