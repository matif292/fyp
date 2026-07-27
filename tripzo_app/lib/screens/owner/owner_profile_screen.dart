import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/misc_services.dart';
import '../../widgets/state_widgets.dart';
import '../auth/login_screen.dart';

class OwnerProfileScreen extends StatelessWidget {
  const OwnerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
    final notificationService = NotificationService();

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const CircleAvatar(
                    radius: 28,
                    backgroundColor: AppColors.gray100,
                    child: Icon(LucideIcons.building2, color: AppColors.primary, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.fullName ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 2),
                        Text(user?.email ?? '', style: const TextStyle(color: AppColors.gray500)),
                        const SizedBox(height: 4),
                        const StatusBadge(label: 'Owner', color: AppColors.primary),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FutureBuilder<int>(
            future: notificationService.unreadCount(),
            builder: (context, snapshot) {
              final count = snapshot.data ?? 0;
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const Icon(LucideIcons.bell, color: AppColors.gray600),
                  title: const Text('Notifications'),
                  trailing: count > 0
                      ? CircleAvatar(
                          radius: 10,
                          backgroundColor: AppColors.danger,
                          child: Text('$count', style: const TextStyle(color: Colors.white, fontSize: 11)),
                        )
                      : const Icon(LucideIcons.chevronRight, color: AppColors.gray300),
                  onTap: () {},
                ),
              );
            },
          ),
          _tile(LucideIcons.slidersHorizontal, 'Auto-accept / counter rules', () {}),
          _tile(LucideIcons.settings, 'Settings', () {}),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: () async {
              final confirmed = await confirmAction(context, title: 'Log out', message: 'Are you sure you want to log out?', confirmLabel: 'Log out');
              if (!confirmed) return;
              await auth.logout();
              if (context.mounted) {
                Navigator.of(context)
                    .pushAndRemoveUntil(MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false);
              }
            },
            icon: const Icon(LucideIcons.logOut, color: AppColors.danger),
            label: const Text('Log out', style: TextStyle(color: AppColors.danger)),
            style: OutlinedButton.styleFrom(side: const BorderSide(color: AppColors.danger)),
          ),
        ],
      ),
    );
  }

  Widget _tile(IconData icon, String label, VoidCallback onTap) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.gray600),
        title: Text(label),
        trailing: const Icon(LucideIcons.chevronRight, color: AppColors.gray300),
        onTap: onTap,
      ),
    );
  }
}
