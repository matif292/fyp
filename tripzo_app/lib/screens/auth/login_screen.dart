import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/state_widgets.dart';
import '../owner/owner_home.dart';
import '../traveler/traveler_home.dart';
import '../admin/admin_home.dart';
import 'register_traveler_screen.dart';
import 'register_owner_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final auth = context.read<AuthProvider>();
      await auth.login(_email.text.trim(), _password.text);
      if (!mounted) return;
      Widget target;
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
      Navigator.of(context).pushAndRemoveUntil(MaterialPageRoute(builder: (_) => target), (r) => false);
    } catch (e) {
      setState(() => _error = apiErrorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 40),
                const Text('Welcome back',
                    style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.gray900)),
                const SizedBox(height: 4),
                const Text('Log in to keep planning the trail.',
                    style: TextStyle(color: AppColors.gray500)),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
                ),
                const SizedBox(height: 16),
                PasswordField(
                  controller: _password,
                  validator: (v) => (v == null || v.isEmpty) ? 'Enter your password' : null,
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!, style: const TextStyle(color: AppColors.danger)),
                ],
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          height: 20, width: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Text('Log in'),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? ", style: TextStyle(color: AppColors.gray500)),
                    GestureDetector(
                      onTap: () => Navigator.push(
                          context, MaterialPageRoute(builder: (_) => const RegisterTravelerScreen())),
                      child: const Text('Sign up', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.push(
                        context, MaterialPageRoute(builder: (_) => const RegisterOwnerScreen())),
                    child: const Text('List your hostel as an owner'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
