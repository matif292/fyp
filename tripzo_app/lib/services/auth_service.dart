import 'dart:convert';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../models/user.dart';

class AuthService {
  final Dio _dio = ApiClient.instance.dio;

  Future<void> registerTraveler({
    required String fullName,
    required String email,
    required String phone,
    required String password,
    required String dateOfBirth,
    String preferredLanguage = 'en',
  }) async {
    await _dio.post('/auth/register', data: {
      'full_name': fullName,
      'email': email,
      'phone': phone,
      'password': password,
      'date_of_birth': dateOfBirth,
      'preferred_language': preferredLanguage,
    });
  }

  /// Owner signup is multipart/form-data with required CNIC photos and
  /// optional business license / bank letter.
  Future<void> registerOwner({
    required Map<String, String> fields,
    required String cnicFrontPath,
    required String cnicBackPath,
    String? businessLicensePath,
    String? bankLetterPath,
  }) async {
    final formMap = <String, dynamic>{...fields};
    formMap['cnic_front'] = await MultipartFile.fromFile(cnicFrontPath);
    formMap['cnic_back'] = await MultipartFile.fromFile(cnicBackPath);
    if (businessLicensePath != null) {
      formMap['business_license'] = await MultipartFile.fromFile(businessLicensePath);
    }
    if (bankLetterPath != null) {
      formMap['bank_letter'] = await MultipartFile.fromFile(bankLetterPath);
    }
    final formData = FormData.fromMap(formMap);
    await _dio.post('/auth/register-owner', data: formData);
  }

  /// Returns (token, user) for travelers. Owners get only a success
  /// message back (still pending admin approval), so token/user may be null.
  Future<(String?, AppUser?)> verifyOtp({required String email, required String otp}) async {
    final res = await _dio.post('/auth/verify-otp', data: {'email': email, 'otp': otp});
    final data = res.data as Map<String, dynamic>;
    if (data['token'] != null && data['user'] != null) {
      final token = data['token'] as String;
      final user = AppUser.fromJson(data['user']);
      await SecureAuthStorage.saveSession(token: token, userJson: jsonEncode(user.toJson()));
      return (token, user);
    }
    return (null, null);
  }

  Future<void> resendOtp({required String email}) async {
    await _dio.post('/auth/resend-otp', data: {'email': email});
  }

  Future<AppUser> login({required String email, required String password}) async {
    final res = await _dio.post('/auth/login', data: {'email': email, 'password': password});
    final data = res.data as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = AppUser.fromJson(data['user']);
    await SecureAuthStorage.saveSession(token: token, userJson: jsonEncode(user.toJson()));
    return user;
  }

  Future<AppUser> me() async {
    final res = await _dio.get('/auth/me');
    final data = res.data is Map && res.data['user'] != null ? res.data['user'] : res.data;
    return AppUser.fromJson(data);
  }

  Future<void> logout() async {
    await SecureAuthStorage.clear();
  }
}
