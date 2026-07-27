import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../models/hostel.dart';
import '../../services/hostel_service.dart';
import '../../widgets/state_widgets.dart';
import 'hostel_detail_screen.dart';

class ExploreScreen extends StatefulWidget {
  const ExploreScreen({super.key});
  @override
  State<ExploreScreen> createState() => _ExploreScreenState();
}

class _ExploreScreenState extends State<ExploreScreen> {
  final _service = HostelService();
  final _cityController = TextEditingController();
  late Future<List<Hostel>> _future;
  String? _propertyType;

  @override
  void initState() {
    super.initState();
    _future = _service.search();
  }

  void _search() {
    setState(() {
      _future = _service.search(
        city: _cityController.text.trim().isEmpty ? null : _cityController.text.trim(),
        propertyType: _propertyType,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Explore')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              children: [
                TextField(
                  controller: _cityController,
                  onSubmitted: (_) => _search(),
                  decoration: InputDecoration(
                    hintText: 'Search by city — Hunza, Nankana Sahib...',
                    prefixIcon: const Icon(LucideIcons.search, size: 20),
                    suffixIcon: IconButton(icon: const Icon(LucideIcons.arrowRight), onPressed: _search),
                  ),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 36,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _filterChip('All', null),
                      _filterChip('Hostel', 'hostel'),
                      _filterChip('Guesthouse', 'guesthouse'),
                      _filterChip('Hotel', 'hotel'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => _search(),
              child: FutureBuilder<List<Hostel>>(
                future: _future,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const LoadingState();
                  }
                  if (snapshot.hasError) {
                    return ErrorState(message: apiErrorMessage(snapshot.error!), onRetry: _search);
                  }
                  final hostels = snapshot.data ?? [];
                  if (hostels.isEmpty) {
                    return EmptyState(
                      icon: LucideIcons.mapPin,
                      title: 'No stays found',
                      subtitle: 'Try a different city or clear your filters.',
                      actionLabel: 'Clear filters',
                      onAction: () {
                        _cityController.clear();
                        _propertyType = null;
                        _search();
                      },
                    );
                  }
                  return ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                    itemCount: hostels.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, i) => _HostelCard(hostel: hostels[i]),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, String? value) {
    final selected = _propertyType == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) {
          setState(() => _propertyType = value);
          _search();
        },
        selectedColor: AppColors.primary.withOpacity(0.12),
        labelStyle: TextStyle(color: selected ? AppColors.primary : AppColors.gray600),
        side: BorderSide(color: selected ? AppColors.primary : AppColors.gray200),
      ),
    );
  }
}

class _HostelCard extends StatelessWidget {
  final Hostel hostel;
  const _HostelCard({required this.hostel});

  @override
  Widget build(BuildContext context) {
    final photoUrl = hostel.photos.isNotEmpty
        ? (hostel.photos.first.startsWith('http')
            ? hostel.photos.first
            : '${ApiClient.instance.uploadsBaseUrl}/${hostel.photos.first}')
        : null;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.push(
            context, MaterialPageRoute(builder: (_) => HostelDetailScreen(hostelId: hostel.id))),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: photoUrl != null
                  ? CachedNetworkImage(
                      imageUrl: photoUrl,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.gray100),
                      errorWidget: (_, __, ___) => Container(
                          color: AppColors.gray100, child: const Icon(LucideIcons.image, color: AppColors.gray300)),
                    )
                  : Container(
                      color: AppColors.gray100,
                      child: const Icon(LucideIcons.mountainSnow, color: AppColors.gray300, size: 40),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(hostel.name,
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                            maxLines: 1, overflow: TextOverflow.ellipsis),
                      ),
                      if (hostel.rating != null) ...[
                        const Icon(Icons.star, size: 16, color: AppColors.warning),
                        const SizedBox(width: 2),
                        Text(hostel.rating!.toStringAsFixed(1),
                            style: const TextStyle(fontWeight: FontWeight.w600)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(LucideIcons.mapPin, size: 14, color: AppColors.gray400),
                      const SizedBox(width: 4),
                      Text(hostel.city, style: const TextStyle(color: AppColors.gray500, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (hostel.minPrice != null)
                    Text('From Rs ${hostel.minPrice!.toStringAsFixed(0)} / night',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
