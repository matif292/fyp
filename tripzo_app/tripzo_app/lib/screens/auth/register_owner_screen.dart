import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/api_client.dart';
import '../../core/theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/state_widgets.dart';
import 'otp_verify_screen.dart';

class RegisterOwnerScreen extends StatefulWidget {
  const RegisterOwnerScreen({super.key});
  @override
  State<RegisterOwnerScreen> createState() => _RegisterOwnerScreenState();
}

class _RegisterOwnerScreenState extends State<RegisterOwnerScreen> {
  final _authService = AuthService();
  final _pageController = PageController();
  int _step = 0;
  bool _loading = false;
  String? _error;

  // Section 1: personal
  final _fullName = TextEditingController();
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  DateTime? _dob;

  // Section 2: business & banking
  final _cnicNumber = TextEditingController();
  final _businessRegNumber = TextEditingController();
  final _bankName = TextEditingController();
  final _accountTitle = TextEditingController();
  final _accountNumber = TextEditingController();
  final _iban = TextEditingController();

  // Section 3: verification documents
  File? _cnicFront;
  File? _cnicBack;
  File? _businessLicense;
  File? _bankLetter;

  final _formKeys = [GlobalKey<FormState>(), GlobalKey<FormState>(), GlobalKey<FormState>()];

  Future<void> _pickImage(void Function(File) onPicked) async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Wrap(children: [
          ListTile(
            leading: const Icon(Icons.camera_alt),
            title: const Text('Camera'),
            onTap: () => Navigator.pop(ctx, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library),
            title: const Text('Gallery'),
            onTap: () => Navigator.pop(ctx, ImageSource.gallery),
          ),
        ]),
      ),
    );
    if (source == null) return;
    final picked = await picker.pickImage(source: source, imageQuality: 85);
    if (picked != null) onPicked(File(picked.path));
  }

  void _next() {
    if (_step < 2) {
      if (!_formKeys[_step].currentState!.validate()) return;
      if (_step == 0 && _dob == null) {
        setState(() => _error = 'Please select your date of birth');
        return;
      }
      setState(() => _error = null);
      _step++;
      _pageController.animateToPage(_step, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step == 0) {
      Navigator.pop(context);
    } else {
      _step--;
      _pageController.animateToPage(_step, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
  }

  Future<void> _submit() async {
    if (_cnicFront == null || _cnicBack == null) {
      setState(() => _error = 'Front and back CNIC photos are required');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await _authService.registerOwner(
        fields: {
          'full_name': _fullName.text.trim(),
          'email': _email.text.trim(),
          'phone': _phone.text.trim(),
          'password': _password.text,
          'date_of_birth': _dob!.toIso8601String().split('T').first,
          'preferred_language': 'en',
          'cnic_number': _cnicNumber.text.trim(),
          'business_reg_number': _businessRegNumber.text.trim(),
          'bank_name': _bankName.text.trim(),
          'account_title': _accountTitle.text.trim(),
          'account_number': _accountNumber.text.trim(),
          'iban': _iban.text.trim(),
        },
        cnicFrontPath: _cnicFront!.path,
        cnicBackPath: _cnicBack!.path,
        businessLicensePath: _businessLicense?.path,
        bankLetterPath: _bankLetter?.path,
      );
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => OtpVerifyScreen(email: _email.text.trim(), isOwnerFlow: true)));
    } catch (e) {
      setState(() => _error = apiErrorMessage(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _docPicker(String label, File? file, VoidCallback onTap, {bool required = true}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.cardSmall),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.gray200),
          borderRadius: BorderRadius.circular(AppRadius.cardSmall),
        ),
        child: Row(
          children: [
            Icon(file != null ? Icons.check_circle : Icons.upload_file,
                color: file != null ? AppColors.success : AppColors.gray400),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                '$label${required ? ' *' : ' (optional)'}',
                style: const TextStyle(color: AppColors.gray700, fontWeight: FontWeight.w600),
              ),
            ),
            Text(file != null ? 'Selected' : 'Choose', style: const TextStyle(color: AppColors.primary)),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final titles = ['Personal details', 'Business & banking', 'Verification documents'];
    return Scaffold(
      appBar: AppBar(
        title: Text(titles[_step]),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: _back),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Row(
                children: List.generate(3, (i) {
                  return Expanded(
                    child: Container(
                      margin: EdgeInsets.only(right: i < 2 ? 8 : 0),
                      height: 4,
                      decoration: BoxDecoration(
                        color: i <= _step ? AppColors.primary : AppColors.gray200,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _formKeys[0],
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        TextFormField(
                          controller: _fullName,
                          decoration: const InputDecoration(labelText: 'Full name'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _email,
                          decoration: const InputDecoration(labelText: 'Email'),
                          validator: (v) => (v == null || !v.contains('@')) ? 'Enter a valid email' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _phone,
                          decoration: const InputDecoration(labelText: 'Phone'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        PasswordField(
                            controller: _password,
                            validator: (v) => (v == null || v.length < 6) ? 'At least 6 characters' : null),
                        const SizedBox(height: 16),
                        InkWell(
                          onTap: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: DateTime(1990, 1, 1),
                              firstDate: DateTime(1930),
                              lastDate: DateTime.now(),
                            );
                            if (picked != null) setState(() => _dob = picked);
                          },
                          child: InputDecorator(
                            decoration: const InputDecoration(labelText: 'Date of birth'),
                            child: Text(_dob == null ? 'Select date' : _dob!.toIso8601String().split('T').first),
                          ),
                        ),
                      ]),
                    ),
                  ),
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Form(
                      key: _formKeys[1],
                      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        TextFormField(
                          controller: _cnicNumber,
                          decoration: const InputDecoration(labelText: 'CNIC number'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _businessRegNumber,
                          decoration: const InputDecoration(labelText: 'Business registration number (optional)'),
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _bankName,
                          decoration: const InputDecoration(labelText: 'Bank name'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _accountTitle,
                          decoration: const InputDecoration(labelText: 'Account title'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _accountNumber,
                          decoration: const InputDecoration(labelText: 'Account number'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _iban,
                          decoration: const InputDecoration(labelText: 'IBAN'),
                          validator: (v) => (v == null || v.trim().isEmpty) ? 'Required' : null,
                        ),
                      ]),
                    ),
                  ),
                  SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      const Text('Upload clear photos of your documents.',
                          style: TextStyle(color: AppColors.gray500)),
                      const SizedBox(height: 16),
                      _docPicker('CNIC — front', _cnicFront, () => _pickImage((f) => setState(() => _cnicFront = f))),
                      const SizedBox(height: 12),
                      _docPicker('CNIC — back', _cnicBack, () => _pickImage((f) => setState(() => _cnicBack = f))),
                      const SizedBox(height: 12),
                      _docPicker('Business license', _businessLicense,
                          () => _pickImage((f) => setState(() => _businessLicense = f)),
                          required: false),
                      const SizedBox(height: 12),
                      _docPicker('Bank letter', _bankLetter,
                          () => _pickImage((f) => setState(() => _bankLetter = f)),
                          required: false),
                    ]),
                  ),
                ],
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(_error!, style: const TextStyle(color: AppColors.danger)),
              ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                onPressed: _loading ? null : _next,
                child: _loading
                    ? const SizedBox(
                        height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_step == 2 ? 'Submit for review' : 'Continue'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
