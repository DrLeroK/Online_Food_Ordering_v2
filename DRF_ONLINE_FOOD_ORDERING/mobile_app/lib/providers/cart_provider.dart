import 'package:flutter/foundation.dart';
import '../models/cart_item.dart';
import '../services/api_service.dart';

class CartProvider with ChangeNotifier {
  final ApiService _apiService;
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _error;

  CartProvider(this._apiService);

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;

  double get total => _items.fold(0, (sum, item) => sum + item.total);

  Future<void> loadCart() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _items = await _apiService.getCartItems();
    } catch (e) {
      _error = 'Failed to load cart items';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addToCart(int itemId, int quantity) async {
    try {
      final success = await _apiService.addToCart(itemId, quantity);
      if (success) {
        await loadCart();
      }
      return success;
    } catch (e) {
      _error = 'Failed to add item to cart';
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateQuantity(int cartItemId, int quantity) async {
    try {
      final success = await _apiService.updateCartItem(cartItemId, quantity);
      if (success) {
        await loadCart();
      }
      return success;
    } catch (e) {
      _error = 'Failed to update quantity';
      notifyListeners();
      return false;
    }
  }

  Future<bool> removeItem(int cartItemId) async {
    try {
      final success = await _apiService.removeFromCart(cartItemId);
      if (success) {
        await loadCart();
      }
      return success;
    } catch (e) {
      _error = 'Failed to remove item';
      notifyListeners();
      return false;
    }
  }

  Future<bool> clearCart() async {
    try {
      final success = await _apiService.clearCart();
      if (success) {
        _items = [];
        notifyListeners();
      }
      return success;
    } catch (e) {
      _error = 'Failed to clear cart';
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
} 