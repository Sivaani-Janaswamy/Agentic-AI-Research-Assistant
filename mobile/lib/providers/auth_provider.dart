import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/paper.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _loadUser();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userId = prefs.getString('user_id');
    final email = prefs.getString('user_email');
    final fullName = prefs.getString('user_name');

    if (userId != null && email != null && fullName != null) {
      _user = User(id: userId, email: email, fullName: fullName);
      notifyListeners();
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      _user = response.user;
      await _saveTokens(response);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signup(String email, String password, String fullName) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.signup(email, password, fullName);
      _user = response.user;
      await _saveTokens(response);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> _saveTokens(AuthResponse response) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('access_token', response.accessToken);
    await prefs.setString('refresh_token', response.refreshToken);
    await prefs.setString('user_id', response.user.id);
    await prefs.setString('user_email', response.user.email);
    await prefs.setString('user_name', response.user.fullName);
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _user = null;
    notifyListeners();
  }
}
