import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../core/api_client.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AppUser? user;
  AuthStatus status = AuthStatus.unknown;

  /// Called once at app start to restore a session from secure storage
  /// (wrapped in try/catch — corrupted storage falls back to logged out).
  Future<void> restoreSession() async {
    try {
      final token = await SecureAuthStorage.readToken();
      final userJson = await SecureAuthStorage.readUserJson();
      if (token != null && userJson != null) {
        user = AppUser.fromJson(jsonDecode(userJson));
        status = AuthStatus.authenticated;
      } else {
        status = AuthStatus.unauthenticated;
      }
    } catch (_) {
      status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    user = await _authService.login(email: email, password: password);
    status = AuthStatus.authenticated;
    notifyListeners();
  }

  Future<void> logout() async {
    await _authService.logout();
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void forceLogout() {
    user = null;
    status = AuthStatus.unauthenticated;
    notifyListeners();
  }
}
