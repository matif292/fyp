import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:provider/provider.dart';
import '../core/theme.dart';
import '../providers/auth_provider.dart';
import 'auth/login_screen.dart';
import 'traveler/traveler_home.dart';
import 'owner/owner_home.dart';
import 'admin/admin_home.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});
  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final auth = context.read<AuthProvider>();
    await auth.restoreSession();
    if (!mounted) return;
    _route(auth);
  }

  void _route(AuthProvider auth) {
    Widget target;
    if (auth.status != AuthStatus.authenticated || auth.user == null) {
      target = const LoginScreen();
    } else {
      switch (auth.user!.role) {
        case 'owner':
          target = const OwnerHome();
          break;
        case 'admin':
          target = const AdminHome();
          break;
        default:
          target = const TravelerHome();
      }
    }
    Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => target));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.primaryGradient),
        child: const Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.mountainSnow, color: Colors.white, size: 56),
              SizedBox(height: 16),
              Text('Tripzo',
                  style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800)),
              SizedBox(height: 4),
              Text('Plan the trail. Book the stay.',
                  style: TextStyle(color: Colors.white70, fontSize: 14)),
              SizedBox(height: 32),
              CircularProgressIndicator(color: Colors.white),
            ],
          ),
        ),
      ),
    );
  }
}
