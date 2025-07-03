import 'item.dart';

class CartItem {
  final int id;
  final Item item;
  int quantity;

  CartItem({
    required this.id,
    required this.item,
    required this.quantity,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      item: Item.fromJson(json['item']),
      quantity: json['quantity'],
    );
  }

  double get total => item.price * quantity;
} 