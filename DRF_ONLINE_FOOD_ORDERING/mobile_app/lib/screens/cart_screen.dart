import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/cart_provider.dart';
import '../models/cart_item.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/api_service.dart';
import 'package:intl/intl.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String _deliveryOption = 'pickup';
  DateTime _selectedTime = DateTime.now().add(const Duration(hours: 1));
  final _addressController = TextEditingController();
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    context.read<CartProvider>().loadCart();
  }

  @override
  void dispose() {
    _addressController.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _selectedTime,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );
    if (date != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(_selectedTime),
      );
      if (time != null) {
        setState(() {
          _selectedTime = DateTime(
            date.year,
            date.month,
            date.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _processOrder() async {
    setState(() {
      _isProcessing = true;
    });
    try {
      final cartProvider = context.read<CartProvider>();
      final apiService = context.read<ApiService>();
      final amount = cartProvider.total;
      final deliveryOption = _deliveryOption;
      final deliveryTime = deliveryOption == 'delivery' ? _selectedTime.toIso8601String() : null;
      final pickupTime = deliveryOption == 'pickup' ? _selectedTime.toIso8601String() : null;
      final deliveryAddress = deliveryOption == 'delivery' ? _addressController.text.trim() : null;

      final checkoutUrl = await apiService.initiatePayment(
        amount: amount,
        deliveryOption: deliveryOption,
        deliveryTime: deliveryTime,
        pickupTime: pickupTime,
        deliveryAddress: deliveryAddress,
      );
      if (checkoutUrl != null && mounted) {
        final uri = Uri.parse(checkoutUrl);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Could not launch payment page'), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to process order'), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  Widget _sectionHeader(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 12, top: 8),
    child: Text(
      text,
      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFB91C1C)),
    ),
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Cart', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          TextButton.icon(
            onPressed: () {
              context.read<CartProvider>().clearCart();
            },
            icon: const Icon(Icons.delete_outline, color: Colors.red),
            label: const Text('Clear', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
      backgroundColor: const Color(0xFFF6F6F6),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, _) {
          if (cartProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (cartProvider.error != null) {
            return Center(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(cartProvider.error!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
              ),
            );
          }
          if (cartProvider.items.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  const Text('Your cart is empty', style: TextStyle(fontSize: 20, color: Colors.grey, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                    ),
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Browse Menu', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Cart Items List
                  Card(
                    margin: const EdgeInsets.only(bottom: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 3,
                    child: Padding(
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sectionHeader('Cart Items'),
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: cartProvider.items.length,
                            separatorBuilder: (_, __) => const Divider(height: 1),
                            itemBuilder: (context, index) {
                              return _CartItemTile(
                                item: cartProvider.items[index],
                                onUpdateQuantity: cartProvider.updateQuantity,
                                onRemove: cartProvider.removeItem,
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  // Delivery Options
                  Card(
                    margin: const EdgeInsets.only(bottom: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 3,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sectionHeader('Delivery Options'),
                          Row(
                            children: [
                              Radio<String>(
                                value: 'pickup',
                                groupValue: _deliveryOption,
                                activeColor: Colors.red,
                                onChanged: (value) {
                                  setState(() {
                                    _deliveryOption = value!;
                                  });
                                },
                              ),
                              const Text('Pickup from Restaurant', style: TextStyle(fontSize: 16)),
                              const SizedBox(width: 16),
                              Radio<String>(
                                value: 'delivery',
                                groupValue: _deliveryOption,
                                activeColor: Colors.red,
                                onChanged: (value) {
                                  setState(() {
                                    _deliveryOption = value!;
                                  });
                                },
                              ),
                              const Text('Delivery to Address', style: TextStyle(fontSize: 16)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if (_deliveryOption == 'pickup') ...[
                            const Text('Pickup Time', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 8),
                            InkWell(
                              onTap: _pickDateTime,
                              child: InputDecorator(
                                decoration: InputDecoration(
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  fillColor: Colors.grey.shade50,
                                  filled: true,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(DateFormat('yyyy-MM-dd HH:mm').format(_selectedTime)),
                                    const Icon(Icons.calendar_today, size: 18, color: Colors.red),
                                  ],
                                ),
                              ),
                            ),
                          ],
                          if (_deliveryOption == 'delivery') ...[
                            const Text('Delivery Time', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 8),
                            InkWell(
                              onTap: _pickDateTime,
                              child: InputDecorator(
                                decoration: InputDecoration(
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                  fillColor: Colors.grey.shade50,
                                  filled: true,
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(DateFormat('yyyy-MM-dd HH:mm').format(_selectedTime)),
                                    const Icon(Icons.calendar_today, size: 18, color: Colors.red),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text('Delivery Address', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500)),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _addressController,
                              decoration: InputDecoration(
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                hintText: 'Enter your full address',
                                fillColor: Colors.grey.shade50,
                                filled: true,
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  borderSide: const BorderSide(color: Colors.red, width: 2),
                                ),
                              ),
                              maxLines: 2,
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                  // Order Summary
                  Card(
                    margin: const EdgeInsets.only(bottom: 20),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 3,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _sectionHeader('Order Summary'),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Subtotal', style: TextStyle(fontSize: 16)),
                              Text('ETB ${cartProvider.total.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16)),
                            ],
                          ),
                          if (_deliveryOption == 'delivery')
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: const [
                                Text('Delivery Fee', style: TextStyle(fontSize: 16)),
                                Text('ETB 29.99', style: TextStyle(fontSize: 16)),
                              ],
                            ),
                          const Divider(height: 32),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              Text(
                                'ETB ${(_deliveryOption == 'delivery' ? cartProvider.total + 29.99 : cartProvider.total).toStringAsFixed(2)}',
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.red),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                padding: EdgeInsets.zero,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 2,
                                backgroundColor: Colors.transparent,
                                shadowColor: Colors.red.shade100,
                              ).copyWith(
                                backgroundColor: MaterialStateProperty.resolveWith<Color?>((states) => null),
                                foregroundColor: MaterialStateProperty.all(Colors.white),
                              ),
                              onPressed: _isProcessing ? null : _processOrder,
                              child: Ink(
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFFDC2626), Color(0xFFB91C1C)],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Center(
                                  child: _isProcessing
                                      ? const SizedBox(
                                          height: 24,
                                          width: 24,
                                          child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                                        )
                                      : const Text('Place Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _CartItemTile extends StatelessWidget {
  final CartItem item;
  final Function(int, int) onUpdateQuantity;
  final Function(int) onRemove;

  const _CartItemTile({
    required this.item,
    required this.onUpdateQuantity,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 56,
              height: 56,
              child: item.item.image != null
                  ? CachedNetworkImage(
                      imageUrl: item.item.image!,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(child: CircularProgressIndicator()),
                      errorWidget: (context, url, error) => const Center(child: Icon(Icons.restaurant)),
                    )
                  : const Center(child: Icon(Icons.restaurant)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 2),
                Text('ETB ${item.item.price.toStringAsFixed(2)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                onPressed: () {
                  if (item.quantity > 1) {
                    onUpdateQuantity(item.id, item.quantity - 1);
                  }
                },
                icon: const Icon(Icons.remove, size: 20),
                splashRadius: 20,
              ),
              Text(item.quantity.toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              IconButton(
                onPressed: () {
                  onUpdateQuantity(item.id, item.quantity + 1);
                },
                icon: const Icon(Icons.add, size: 20),
                splashRadius: 20,
              ),
              IconButton(
                onPressed: () => onRemove(item.id),
                icon: const Icon(Icons.delete_outline, color: Colors.red, size: 22),
                splashRadius: 20,
              ),
            ],
          ),
        ],
      ),
    );
  }
} 