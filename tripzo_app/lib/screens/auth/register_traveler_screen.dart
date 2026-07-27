import 'package:flutter/material.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/state_widgets.dart';
import 'otp_verify_screen.dart';

class RegisterTravelerScreen extends StatefulWidget {
  const RegisterTravelerScreen({super.key});
  @override
  State<RegisterTravelerScreen> createState() => _RegisterTravelerScreenState();
}

class _RegisterTravelerScreenState extends State<RegisterTravelerScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  DateTime? _dob;
  bool _loading = false;
  String? _error;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_dob == null) {
      setState(() => _error = 'Please select your date of birth');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _authService.registerTraveler(
        fullName: _fullName.text.trim(),
        email: _email.text.trim(),
        phone: _phone.text.trim(),
        password: _password.text,
        dateOfBirth: _dob!.toIso8601String().split('T').first,
      );
      if (!mounted) return;
      Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => OtpVerifyScreen(email: _email.text.trim())));
    } catch (e) {
      setState(() => _error = apiErrorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create your account')),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextFormField(
                  controller: _fullName,
                  decoration: const InputDecoration(labelText: 'Full name'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone'),
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                PasswordField(
                  controller: _password,
                  validator: (v) => (v == null || v.length < 6) ? 'At least 6 characters' : null,
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime(2000, 1, 1),
                      firstDate: DateTime(1930),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null) setState(() => _dob = picked);
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Date of birth'),
                    child: Text(
                      _dob == null ? 'Select date' : _dob!.toIso8601String().split('T').first,
                      style: TextStyle(color: _dob == null ? AppColors.gray400 : AppColors.gray900),
                    ),
                  ),
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
                      : const Text('Create account'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
