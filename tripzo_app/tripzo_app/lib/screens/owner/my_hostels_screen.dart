import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../services/hostel_service.dart';
import '../../widgets/state_widgets.dart';
import 'add_edit_hostel_screen.dart';

class MyHostelsScreen extends StatefulWidget {
  const MyHostelsScreen({super.key});
  @override
  State<MyHostelsScreen> createState() => _MyHostelsScreenState();
}

class _MyHostelsScreenState extends State<MyHostelsScreen> {
  final _service = HostelService();
  late Future<List<Hostel>> _future;

  @override
  void initState() {
    super.initState();
    _future = _service.ownerHostels();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Hostels'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.plus),
            onPressed: () async {
              await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditHostelScreen()));
              setState(() => _future = _service.ownerHostels());
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => setState(() => _future = _service.ownerHostels()),
        child: FutureBuilder<List<Hostel>>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
            if (snapshot.hasError) {
              return ErrorState(
                  message: apiErrorMessage(snapshot.error!), onRetry: () => setState(() => _future = _service.ownerHostels()));
            }
            final hostels = snapshot.data ?? [];
            if (hostels.isEmpty) {
              return EmptyState(
                icon: LucideIcons.building2,
                title: 'No hostels yet',
                subtitle: 'Add your first property to start receiving bookings.',
                actionLabel: 'Add hostel',
                onAction: () async {
                  await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditHostelScreen()));
                  setState(() => _future = _service.ownerHostels());
                },
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: hostels.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) {
                final h = hostels[i];
                final photoUrl = h.photos.isNotEmpty
                    ? (h.photos.first.startsWith('http')
                        ? h.photos.first
                        : '${ApiClient.instance.uploadsBaseUrl}/${h.photos.first}')
                    : null;
                return Card(
                  child: ListTile(
                    contentPadding: const EdgeInsets.all(10),
                    leading: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: SizedBox(
                        width: 56,
                        height: 56,
                        child: photoUrl != null
                            ? CachedNetworkImage(imageUrl: photoUrl, fit: BoxFit.cover)
                            : Container(color: AppColors.gray100, child: const Icon(LucideIcons.building2, color: AppColors.gray400)),
                      ),
                    ),
                    title: Text(h.name, style: const TextStyle(fontWeight: FontWeight.w700)),
                    subtitle: Text(h.city),
                    trailing: StatusBadge.fromStatus(h.status),
                    onTap: () async {
                      await Navigator.push(
                          context, MaterialPageRoute(builder: (_) => AddEditHostelScreen(existing: h)));
                      setState(() => _future = _service.ownerHostels());
                    },
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
