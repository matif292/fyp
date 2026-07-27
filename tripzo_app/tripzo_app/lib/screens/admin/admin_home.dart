import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/misc_services.dart';
import '../../widgets/state_widgets.dart';
import '../auth/login_screen.dart';

/// Admin is lower priority on mobile — a simplified single-screen
/// dashboard rather than the full tab set from the web app.
class AdminHome extends StatefulWidget {
  const AdminHome({super.key});
  @override
  State<AdminHome> createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  final _adminService = AdminService();
  int _section = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.logOut),
            onPressed: () async {
              final confirmed = await confirmAction(context, title: 'Log out', message: 'Are you sure you want to log out?', confirmLabel: 'Log out');
              if (!confirmed) return;
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false);
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: SizedBox(
              height: 36,
              child: ListView(scrollDirection: Axis.horizontal, children: [
                _chip('Approvals', 0),
                _chip('Users', 1),
                _chip('Hostels', 2),
                _chip('Stats', 3),
              ]),
            ),
          ),
          Expanded(
            child: switch (_section) {
              0 => _PendingApprovals(service: _adminService),
              1 => _UsersList(service: _adminService),
              2 => _HostelsList(service: _adminService),
              _ => _StatsView(service: _adminService),
            },
          ),
        ],
      ),
    );
  }

  Widget _chip(String label, int index) {
    final selected = _section == index;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => setState(() => _section = index),
        selectedColor: AppColors.primary.withOpacity(0.12),
        labelStyle: TextStyle(color: selected ? AppColors.primary : AppColors.gray600),
      ),
    );
  }
}

class _PendingApprovals extends StatefulWidget {
  final AdminService service;
  const _PendingApprovals({required this.service});
  @override
  State<_PendingApprovals> createState() => _PendingApprovalsState();
}

class _PendingApprovalsState extends State<_PendingApprovals> {
  late Future<List<dynamic>> _future;
  @override
  void initState() {
    super.initState();
    _future = widget.service.pendingApprovals();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
        if (snapshot.hasError) {
          return ErrorState(message: apiErrorMessage(snapshot.error!), onRetry: () => setState(() => _future = widget.service.pendingApprovals()));
        }
        final items = snapshot.data ?? [];
        if (items.isEmpty) {
          return const EmptyState(icon: LucideIcons.badgeCheck, title: 'All caught up', subtitle: 'No pending owner approvals.');
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, i) {
            final u = items[i] as Map;
            final id = u['id'] ?? 0;
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(u['full_name']?.toString() ?? 'Owner', style: const TextStyle(fontWeight: FontWeight.w700)),
                    Text(u['email']?.toString() ?? '', style: const TextStyle(color: AppColors.gray500)),
                    const SizedBox(height: 10),
                    Row(children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () async {
                            await widget.service.rejectOwner(id);
                            setState(() => _future = widget.service.pendingApprovals());
                          },
                          child: const Text('Reject'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () async {
                            await widget.service.approveOwner(id);
                            setState(() => _future = widget.service.pendingApprovals());
                          },
                          child: const Text('Approve'),
                        ),
                      ),
                    ]),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _UsersList extends StatefulWidget {
  final AdminService service;
  const _UsersList({required this.service});
  @override
  State<_UsersList> createState() => _UsersListState();
}

class _UsersListState extends State<_UsersList> {
  late Future<List<dynamic>> _future;
  @override
  void initState() {
    super.initState();
    _future = widget.service.users();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
        if (snapshot.hasError) return ErrorState(message: apiErrorMessage(snapshot.error!));
        final users = snapshot.data ?? [];
        if (users.isEmpty) return const EmptyState(icon: LucideIcons.users, title: 'No users found', subtitle: '');
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: users.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final u = users[i] as Map;
            return Card(
              child: ListTile(
                title: Text(u['full_name']?.toString() ?? ''),
                subtitle: Text('${u['email'] ?? ''} • ${u['role'] ?? ''}'),
                trailing: Switch(
                  value: (u['status'] == 'active' || u['is_active'] == true),
                  onChanged: (_) async {
                    await widget.service.toggleUserStatus(u['id'] ?? 0);
                    setState(() => _future = widget.service.users());
                  },
                  activeColor: AppColors.success,
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _HostelsList extends StatefulWidget {
  final AdminService service;
  const _HostelsList({required this.service});
  @override
  State<_HostelsList> createState() => _HostelsListState();
}

class _HostelsListState extends State<_HostelsList> {
  late Future<List<dynamic>> _future;
  @override
  void initState() {
    super.initState();
    _future = widget.service.hostels();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
        if (snapshot.hasError) return ErrorState(message: apiErrorMessage(snapshot.error!));
        final hostels = snapshot.data ?? [];
        if (hostels.isEmpty) return const EmptyState(icon: LucideIcons.building2, title: 'No hostels found', subtitle: '');
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: hostels.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) {
            final h = hostels[i] as Map;
            return Card(
              child: ListTile(
                title: Text(h['name']?.toString() ?? ''),
                subtitle: Text(h['city']?.toString() ?? ''),
                trailing: Switch(
                  value: (h['status'] == 'approved' || h['is_active'] == true),
                  onChanged: (_) async {
                    await widget.service.toggleHostelStatus(h['id'] ?? 0);
                    setState(() => _future = widget.service.hostels());
                  },
                  activeColor: AppColors.success,
                ),
              ),
            );
          },
        );
      },
    );
  }
}

class _StatsView extends StatefulWidget {
  final AdminService service;
  const _StatsView({required this.service});
  @override
  State<_StatsView> createState() => _StatsViewState();
}

class _StatsViewState extends State<_StatsView> {
  late Future<Map<String, dynamic>> _future;
  @override
  void initState() {
    super.initState();
    _future = widget.service.stats();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) return const LoadingState();
        if (snapshot.hasError) return ErrorState(message: apiErrorMessage(snapshot.error!));
        final stats = snapshot.data ?? {};
        if (stats.isEmpty) return const EmptyState(icon: LucideIcons.barChart3, title: 'No stats available', subtitle: '');
        return GridView.count(
          padding: const EdgeInsets.all(16),
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: stats.entries
              .map((e) => Card(
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(e.value.toString(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text(e.key.toString().replaceAll('_', ' '), style: const TextStyle(color: AppColors.gray500, fontSize: 12)),
                        ],
                      ),
                    ),
                  ))
              .toList(),
        );
      },
    );
  }
}
