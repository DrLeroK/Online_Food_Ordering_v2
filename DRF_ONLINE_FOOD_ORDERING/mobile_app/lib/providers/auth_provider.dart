import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService;
  bool _isAuthenticated = false;

  AuthProvider(this._apiService) {
    _isAuthenticated = _apiService.token != null;
  }

  bool get isAuthenticated => _isAuthenticated;

  Future<bool> login(String username, String password) async {
    final success = await _apiService.login(username, password);
    if (success) {
      _isAuthenticated = true;
      notifyListeners();
    }
    return success;
  }

  Future<bool> register(String username, String firstName, String lastName, String email, String phone, String password) async {
    return await _apiService.register(username, firstName, lastName, email, phone, password);
  }

  void logout() {
    _apiService.logout();
    _isAuthenticated = false;
    notifyListeners();
  }
} 