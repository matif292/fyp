import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/state_widgets.dart';
import '../auth/login_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
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
                    child: Icon(LucideIcons.user, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.fullName ?? '', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                        const SizedBox(height: 2),
                        Text(user?.email ?? '', style: const TextStyle(color: AppColors.gray500)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _tile(context, LucideIcons.clock, 'Waiting list', () {}),
          _tile(context, LucideIcons.bell, 'Notifications', () {}),
          _tile(context, LucideIcons.wallet, 'Budget estimator', () {}),
          _tile(context, LucideIcons.cloudSun, 'Weather alerts', () {}),
          _tile(context, LucideIcons.star, 'My reviews', () {}),
          _tile(context, LucideIcons.settings, 'Settings', () {}),
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

  Widget _tile(BuildContext context, IconData icon, String label, VoidCallback onTap) {
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
