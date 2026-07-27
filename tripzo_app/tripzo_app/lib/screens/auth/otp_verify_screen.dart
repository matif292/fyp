import 'dart:async';
import 'package:flutter/material.dart';
import 'package:pin_code_fields/pin_code_fields.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../services/auth_service.dart';
import '../traveler/traveler_home.dart';
import 'login_screen.dart';

/// isOwnerFlow=true means the account still needs admin approval after
/// OTP verification (owners don't get a token back immediately).
class OtpVerifyScreen extends StatefulWidget {
  final String email;
  final bool isOwnerFlow;
  const OtpVerifyScreen({super.key, required this.email, this.isOwnerFlow = false});

  @override
  State<OtpVerifyScreen> createState() => _OtpVerifyScreenState();
}

class _OtpVerifyScreenState extends State<OtpVerifyScreen> {
  final _authService = AuthService();
  final _controller = TextEditingController();
  bool _loading = false;
  String? _error;
  int _secondsLeft = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _secondsLeft = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft == 0) {
        t.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  Future<void> _resend() async {
    try {
      await _authService.resendOtp(email: widget.email);
      _startTimer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Code resent')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(apiErrorMessage(e))));
      }
    }
  }

  Future<void> _verify() async {
    if (_controller.text.length != 6) {
      setState(() => _error = 'Enter the full 6-digit code');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final (token, user) = await _authService.verifyOtp(email: widget.email, otp: _controller.text);
      if (!mounted) return;
      if (token != null && user != null) {
        Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (_) => const TravelerHome()), (r) => false);
      } else {
        // Owner flow: verified but pending admin approval.
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (_) => Scaffold(
              body: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.hourglass_top, size: 48, color: AppColors.warning),
                      const SizedBox(height: 16),
                      const Text('Verified — pending approval',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 8),
                      const Text(
                        "Your email is verified. An admin will review your documents and approve your hostel-owner account shortly.",
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.gray500),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pushAndRemoveUntil(
                            MaterialPageRoute(builder: (_) => const LoginScreen()), (r) => false),
                        child: const Text('Back to login'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          (r) => false,
        );
      }
    } catch (e) {
      setState(() => _error = apiErrorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify your email')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('We sent a 6-digit code to ${widget.email}', style: const TextStyle(color: AppColors.gray600)),
              const SizedBox(height: 24),
              PinCodeTextField(
                appContext: context,
                length: 6,
                controller: _controller,
                keyboardType: TextInputType.number,
                animationType: AnimationType.fade,
                pinTheme: PinTheme(
                  shape: PinCodeFieldShape.box,
                  borderRadius: BorderRadius.circular(12),
                  fieldHeight: 48,
                  fieldWidth: 44,
                  activeColor: AppColors.primary,
                  selectedColor: AppColors.primary,
                  inactiveColor: AppColors.gray200,
                ),
                onChanged: (_) {},
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: AppColors.danger)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _verify,
                child: _loading
                    ? const SizedBox(
                        height: 20, width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Verify'),
              ),
              const SizedBox(height: 16),
              Center(
                child: _secondsLeft > 0
                    ? Text('Resend code in ${_secondsLeft}s', style: const TextStyle(color: AppColors.gray400))
                    : TextButton(onPressed: _resend, child: const Text('Resend code')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
