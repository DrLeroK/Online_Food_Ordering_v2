import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/foundation.dart';
import '../models/item.dart';
import '../models/cart_item.dart';
import '../models/review.dart';

class ApiService {
  final Dio _dio;
  String? _token;

  ApiService() : _dio = Dio(BaseOptions(
    baseUrl: kIsWeb ? 'http://localhost:8000' : 'http://10.0.2.2:8000',
    headers: {'User-Agent': 'AtlasBurger-Flutter-Mobile-App'},
  )) {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token == null) {
          final prefs = await SharedPreferences.getInstance();
          _token = prefs.getString('token');
        }
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        return handler.next(options);
      },
    ));
  }

  Future<bool> login(String username, String password) async {
    try {
      print('Attempting login for username: $username');
      print('Making POST request to: ${_dio.options.baseUrl}/token/');
      
      final response = await _dio.post('/token/', data: {
        'username': username,
        'password': password,
      });

      print('Login response status: ${response.statusCode}');
      print('Login response data: ${response.data}');

      if (response.statusCode == 200 && response.data['access'] != null) {
        _token = response.data['access'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', _token!);
        print('Login successful, token saved');
        return true;
      }
      print('Login failed: Invalid response');
      return false;
    } catch (e) {
      print('Login error: $e');
      if (e is DioError) {
        print('DioError type: ${e.type}');
        print('DioError message: ${e.message}');
        print('DioError response: ${e.response?.data}');
        print('DioError status: ${e.response?.statusCode}');
      }
      return false;
    }
  }

  Future<bool> register(String username, String firstName, String lastName, String email, String phone, String password) async {
    try {
      print('Attempting registration for username: $username');
      print('Making POST request to: ${_dio.options.baseUrl}/user_management/register/');
      
      // Clean phone number to match backend validation
      final cleanPhone = phone.replaceAll(RegExp(r'[\s\-\(\)]'), '');
      
      final response = await _dio.post('/user_management/register/', data: {
        'username': username,
        'first_name': firstName,
        'last_name': lastName,
        'email': email,
        'phone_number': cleanPhone, // Cleaned phone number
        'password': password,
        'password2': password, // Added password2 field
      });
      
      print('Registration response status: ${response.statusCode}');
      print('Registration response data: ${response.data}');
      
      return response.statusCode == 201;
    } catch (e) {
      print('Registration error: $e');
      if (e is DioError) {
        print('DioError type: ${e.type}');
        print('DioError message: ${e.message}');
        print('DioError response: ${e.response?.data}');
        print('DioError status: ${e.response?.statusCode}');
      }
      return false;
    }
  }

  Future<void> forgotPassword(String email) async {
    try {
      await _dio.post('/auth/users/reset_password/', data: {'email': email});
    } catch (e) {
      // Djoser returns 204 on success, which Dio might treat as an error.
      // We can ignore the error if it's a 204, or handle specific statuses.
      if (e is DioError && e.response?.statusCode == 204) {
        return;
      }
      print('Forgot password error: $e');
      throw e; // Re-throw to be caught in the UI layer
    }
  }

  Future<bool> resetPassword(String uid, String token, String newPassword) async {
    try {
      await _dio.post('/auth/users/reset_password_confirm/', data: {
        'uid': uid,
        'token': token,
        'new_password': newPassword,
      });
      return true;
    } catch (e) {
      print('Reset password error: $e');
      return false;
    }
  }

  Future<List<Item>> getItems() async {
    try {
      final response = await _dio.get('/menu/items/');
      final List<dynamic> data = response.data;
      return data.map((json) => Item.fromJson(json)).toList();
    } catch (e) {
      print('Get items error: $e');
      return [];
    }
  }

  Future<List<CartItem>> getCartItems() async {
    try {
      final response = await _dio.get('/cart/');
      final List<dynamic> data = response.data;
      return data.map((json) => CartItem.fromJson(json)).toList();
    } catch (e) {
      print('Get cart items error: $e');
      if (e is DioError && e.response?.statusCode == 401) {
        print('Authentication error - user not logged in');
        // Clear token on authentication error
        _token = null;
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('token');
      }
      return [];
    }
  }

  Future<bool> addToCart(String slug, int quantity) async {
    try {
      final response = await _dio.post('/cart/items/add/$slug/', data: {
        'quantity': quantity,
      });
      return response.statusCode == 201;
    } catch (e) {
      print('Add to cart error: $e');
      if (e is DioError && e.response?.statusCode == 401) {
        print('Authentication error - clearing token');
        // Clear token on authentication error
        _token = null;
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('token');
      }
      return false;
    }
  }

  Future<bool> updateCartItem(int cartItemId, int quantity) async {
    try {
      final response = await _dio.patch('/cart/items/$cartItemId/', data: {
        'quantity': quantity,
      });

      return response.statusCode == 200;
    } catch (e) {
      print('Update cart item error: $e');
      return false;
    }
  }

  Future<bool> removeFromCart(int cartItemId) async {
    try {
      final response = await _dio.delete('/cart/items/$cartItemId/remove/');

      return response.statusCode == 204;
    } catch (e) {
      print('Remove from cart error: $e');
      return false;
    }
  }

  Future<bool> clearCart() async {
    try {
      final response = await _dio.post('/cart/clear/');

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
      final headers = _dio.options.headers;
      headers['User-Agent'] = 'AtlasBurger-Flutter-Mobile-App';
      
      final response = await _dio.post('/payments/initiate/', data: {
        'amount': amount,
        'delivery_option': deliveryOption,
        'delivery_time': deliveryTime,
        'pickup_time': pickupTime,
        'delivery_address': deliveryAddress,
      });

      if (response.statusCode == 200) {
        final data = response.data;
        return data['checkout_url'];
      }
      return null;
    } catch (e) {
      print('Initiate payment error: $e');
      if (e is DioError && e.response?.statusCode == 401) {
        print('Authentication error in payment - clearing token');
        // Clear token on authentication error
        _token = null;
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('token');
      }
      return null;
    }
  }

  Future<Map<String, dynamic>?> getProfile() async {
    try {
      final response = await _dio.get('/user_management/users/me/');
      if (response.statusCode == 200) {
        return response.data;
      }
      return null;
    } catch (e) {
      print('Get profile error: $e');
      if (e is DioError && e.response?.statusCode == 401) {
        print('Authentication error - user not logged in');
        // Clear token on authentication error
        _token = null;
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('token');
      }
      return null;
    }
  }

  Future<bool> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? phoneNumber,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['first_name'] = firstName;
      if (lastName != null) data['last_name'] = lastName;
      if (email != null) data['email'] = email;
      if (phoneNumber != null) data['phone_number'] = phoneNumber;
      final response = await _dio.patch('/user_management/update/', data: data);
      return response.statusCode == 200;
    } catch (e) {
      print('Update profile error: $e');
      return false;
    }
  }

  void logout() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  Future<void> clearStoredData() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Clear all stored preferences
    print('All stored data cleared');
  }

  Future<bool> isAuthenticated() async {
    if (_token == null) {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('token');
    }
    return _token != null;
  }

  // Add method to refresh token from storage
  Future<void> refreshTokenFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
    print('Token refreshed from storage: ${_token != null ? "Present" : "Not found"}');
  }

  Future<bool> createOrder({
    required String deliveryOption,
    String? deliveryTime,
    String? pickupTime,
    String? deliveryAddress,
  }) async {
    try {
      final response = await _dio.post('/payments/create-order/', data: {
        'delivery_option': deliveryOption,
        'delivery_time': deliveryTime,
        'pickup_time': pickupTime,
        'delivery_address': deliveryAddress,
      });
      return response.statusCode == 201;
    } catch (e) {
      print('Create order error: $e');
      if (e is DioError && e.response?.statusCode == 401) {
        print('Authentication error in create order - clearing token');
        // Clear token on authentication error
        _token = null;
        final prefs = await SharedPreferences.getInstance();
        await prefs.remove('token');
      }
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getOrderHistory() async {
    try {
      final response = await _dio.get('/orders/history/');
      final List<dynamic> data = response.data;
      return List<Map<String, dynamic>>.from(data);
    } catch (e) {
      print('Get order history error: $e');
      return [];
    }
  }

  Future<List<Review>> fetchReviews(String itemSlug) async {
    try {
      final response = await _dio.get('/menu/items/$itemSlug/reviews/');
      final List<dynamic> data = response.data;
      return data.map((json) => Review.fromJson(json)).toList();
    } catch (e) {
      print('Fetch reviews error: $e');
      return [];
    }
  }

  Future<bool> submitReview(String itemSlug, String reviewText) async {
    try {
      final response = await _dio.post(
        '/menu/items/$itemSlug/reviews/',
        data: {'review': reviewText},
      );
      return response.statusCode == 201;
    } catch (e) {
      print('Submit review error: $e');
      return false;
    }
  }
} 