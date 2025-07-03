import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService;
  bool _isAuthenticated = false;

  AuthProvider(this._apiService) {
    _isAuthenticated = false;
  }

  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login(String username, String password) async {
    final success = await _apiService.login(username, password);
    if (success) {
      _isAuthenticated = true;
      notifyListeners();
    } else {
      _isAuthenticated = false;
      notifyListeners();
    }
    return success;
  }

  Future<Map<String, dynamic>> register(String username, String firstName, String lastName, String email, String phone, String password) async {
    try {
      final success = await _apiService.register(username, firstName, lastName, email, phone, password);
      return {'success': success, 'errors': null};
    } catch (e) {
      return {'success': false, 'errors': e.toString()};
    }
  }

  Future<void> forgotPassword(String email) async {
    await _apiService.forgotPassword(email);
  }

  Future<bool> resetPassword(String uid, String token, String newPassword) async {
    return await _apiService.resetPassword(uid, token, newPassword);
  }

  Future<void> checkAuthStatus() async {
    try {
      final profile = await _apiService.getProfile();
      _isAuthenticated = profile != null;
      notifyListeners();
    } catch (e) {
      _isAuthenticated = false;
      notifyListeners();
    }
  }

  void logout() {
    _apiService.logout();
    _isAuthenticated = false;
    notifyListeners();
  }
} 