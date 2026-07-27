import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps token read/writes in try/catch and falls back gracefully —
/// mirrors the corrupted-storage bug fix carried over from the web app.
class SecureAuthStorage {
  static const _tokenKey = 'tripzo_token';
  static const _userKey = 'tripzo_user';
  static const _storage = FlutterSecureStorage();

  static Future<void> saveSession({required String token, required String userJson}) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
      await _storage.write(key: _userKey, value: userJson);
    } catch (_) {
      // Storage failure shouldn't crash the app — user will just be
      // prompted to log in again.
    }
  }

  static Future<String?> readToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (_) {
      return null;
    }
  }

  static Future<String?> readUserJson() async {
    try {
      return await _storage.read(key: _userKey);
    } catch (_) {
      return null;
    }
  }

  static Future<void> clear() async {
    try {
      await _storage.deleteAll();
    } catch (_) {
      // best-effort
    }
  }
}

typedef UnauthorizedCallback = void Function();

class ApiClient {
  ApiClient._internal() {
    final baseUrl = dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:5000/api';
    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureAuthStorage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.response?.statusCode == 401) {
            await SecureAuthStorage.clear();
            onUnauthorized?.call();
          }
          handler.next(e);
        },
      ),
    );
  }

  static final ApiClient instance = ApiClient._internal();
  late final Dio dio;

  /// Set by the app root once a navigator is available, so a 401
  /// anywhere can redirect back to Login.
  UnauthorizedCallback? onUnauthorized;

  String get uploadsBaseUrl =>
      dotenv.env['UPLOADS_BASE_URL'] ?? 'http://10.0.2.2:5000/uploads';
}

/// Normalizes Dio errors into a readable message for the UI layer.
String apiErrorMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map && data['message'] is String) return data['message'];
    if (data is Map && data['error'] is String) return data['error'];
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'Connection timed out. Please check your network.';
      case DioExceptionType.connectionError:
        return 'Could not reach the server. Please check your connection.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
