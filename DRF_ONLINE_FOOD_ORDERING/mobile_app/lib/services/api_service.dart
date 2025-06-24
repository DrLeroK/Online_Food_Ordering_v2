import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/item.dart';
import '../models/cart_item.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000';
  final SharedPreferences _prefs;

  ApiService(this._prefs);

  String? get token => _prefs.getString('token');

  Future<Map<String, String>> get _headers async {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Token $token',
    };
  }

  Future<bool> login(String username, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/token/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await _prefs.setString('token', data['access']);
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    }
  }

  Future<bool> register(String username, String firstName, String lastName, String email, String phone, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/user_management/register/'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'first_name': firstName,
          'last_name': lastName,
          'email': email,
          'phone_number': phone,
          'password': password,
          'password2': password,
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Registration error: $e');
      return false;
    }
  }

  Future<List<Item>> getItems() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/menu/items/'),
        headers: await _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Item.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get items error: $e');
      return [];
    }
  }

  Future<List<CartItem>> getCartItems() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/cart/'),
        headers: await _headers,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => CartItem.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Get cart items error: $e');
      return [];
    }
  }

  Future<bool> addToCart(int itemId, int quantity) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/cart/add/'),
        headers: await _headers,
        body: jsonEncode({
          'item_id': itemId,
          'quantity': quantity,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Add to cart error: $e');
      return false;
    }
  }

  Future<bool> updateCartItem(int cartItemId, int quantity) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/cart/items/$cartItemId/'),
        headers: await _headers,
        body: jsonEncode({
          'quantity': quantity,
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Update cart item error: $e');
      return false;
    }
  }

  Future<bool> removeFromCart(int cartItemId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/cart/items/$cartItemId/remove/'),
        headers: await _headers,
      );

      return response.statusCode == 204;
    } catch (e) {
      print('Remove from cart error: $e');
      return false;
    }
  }

  Future<bool> clearCart() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/cart/clear/'),
        headers: await _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Clear cart error: $e');
      return false;
    }
  }

  Future<String?> initiatePayment({
    required double amount,
    required String deliveryOption,
    String? deliveryTime,
    String? pickupTime,
    String? deliveryAddress,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/payments/initiate/'),
        headers: await _headers,
        body: jsonEncode({
          'amount': amount,
          'delivery_option': deliveryOption,
          'delivery_time': deliveryTime,
          'pickup_time': pickupTime,
          'delivery_address': deliveryAddress,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['checkout_url'];
      }
      return null;
    } catch (e) {
      print('Initiate payment error: $e');
      return null;
    }
  }

  void logout() {
    _prefs.remove('token');
  }
} 