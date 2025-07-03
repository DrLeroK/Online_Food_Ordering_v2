import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/item.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'cart_screen.dart';
import 'order_history_screen.dart';
import 'profile_screen.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'item_detail_screen.dart';
import '../providers/cart_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  List<Item> _items = [];
  bool _isLoading = true;
  String? _error;
  String _selectedCategory = 'burger';
  final List<Map<String, String>> _categories = [
    {'value': 'burger', 'label': 'Burger'},
    {'value': 'side', 'label': 'Side'},
    {'value': 'drink', 'label': 'Drink'},
    {'value': 'dessert', 'label': 'Dessert'},
    {'value': 'pizza', 'label': 'Pizza'},
    {'value': 'salad', 'label': 'Salad'},
    {'value': 'sandwich', 'label': 'Sandwich'},
    {'value': 'pasta', 'label': 'Pasta'},
  ];

  // List of featured images (can be from network or assets)
  final List<String> _featuredImages = [
    'assets/images/first.jpg', // Replace with your actual image URLs
    'assets/images/second.jpg',
    'assets/images/thrid.jpg',
  ];

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    if (!mounted) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final items = await context.read<ApiService>().getItems();
      if (mounted) {
        setState(() {
          _items = items;
        });
      }
    } catch (e, stackTrace) {
      print('Error loading items: $e');
      print('Stack trace: $stackTrace');
      if (mounted) {
        setState(() {
          _error = 'Failed to load menu items. Check console for details.';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Widget _buildFeaturedPromos() {
    return SizedBox(
      height: 150, // Adjust height as needed
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        itemCount: _featuredImages.length,
        itemBuilder: (context, index) {
          return Container(
            width: MediaQuery.of(context).size.width * 0.8,
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: CachedNetworkImage(
                imageUrl: _featuredImages[index],
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: Colors.grey[200],
                  child: const Center(child: CircularProgressIndicator()),
                ),
                errorWidget: (context, url, error) => Container(
                  color: Colors.grey[200],
                  child: const Icon(Icons.error),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildCategoryBar() {
    return SizedBox(
      height: 48,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        itemCount: _categories.length,
        separatorBuilder: (context, index) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = _selectedCategory == category['value'];
          return ChoiceChip(
            label: Text(category['label']!,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.black,
                  fontWeight: FontWeight.bold,
                )),
            selected: isSelected,
            selectedColor: Colors.redAccent,
            backgroundColor: Colors.grey[200],
            onSelected: (_) {
              if (mounted) {
                setState(() {
                  _selectedCategory = category['value']!;
                });
              }
            },
          );
        },
      ),
    );
  }

  Widget _buildMenuContent() {
    return RefreshIndicator(
      onRefresh: _loadItems,
      child: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadItems,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    _buildFeaturedPromos(),
                    _buildCategoryBar(),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16.0),
                      child: Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'Our Menu',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 0.75,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: _items
                            .where((item) => item.category.toLowerCase() == _selectedCategory)
                            .length,
                        itemBuilder: (context, index) {
                          final filteredItems = _items
                              .where((item) => item.category.toLowerCase() == _selectedCategory)
                              .toList();
                          final item = filteredItems[index];
                          return _MenuItemCard(item: item);
                        },
                      ),
                    ),
                  ],
                ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      _buildMenuContent(),
      const CartScreen(),
      const OrderHistoryScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      appBar: _selectedIndex == 0
          ? AppBar(
              title: RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'Atlas',
                      style: TextStyle(
                        color: Colors.red[700],
                        fontWeight: FontWeight.bold,
                        fontSize: 22,
                      ),
                    ),
                    TextSpan(
                      text: 'Cafe',
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 22,
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.logout),
                  onPressed: () {
                    context.read<AuthProvider>().logout();
                  },
                ),
              ],
            )
          : null,
      body: screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.restaurant_menu),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.grey,
        onTap: _onItemTapped,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}

class _MenuItemCard extends StatefulWidget {
  final Item item;
  const _MenuItemCard({required this.item});

  @override
  State<_MenuItemCard> createState() => _MenuItemCardState();
}

class _MenuItemCardState extends State<_MenuItemCard> {
  int _quantity = 1;
  bool _isLoading = false;

  void _increment() {
    setState(() {
      _quantity++;
    });
  }

  void _decrement() {
    if (_quantity > 1) {
      setState(() {
        _quantity--;
      });
    }
  }

  Future<void> _addToCart() async {
    setState(() {
      _isLoading = true;
    });
    final cartProvider = Provider.of<CartProvider>(context, listen: false);
    final success = await cartProvider.addToCart(widget.item.slug, _quantity);
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Added to cart!' : 'Failed to add to cart'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ItemDetailScreen(item: widget.item),
          ),
        );
      },
      child: Card(
        clipBehavior: Clip.antiAlias,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: widget.item.image != null
                        ? CachedNetworkImage(
                            imageUrl: widget.item.image!,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Center(
                              child: CircularProgressIndicator(),
                            ),
                            errorWidget: (context, url, error) => const Center(
                              child: Icon(Icons.restaurant, size: 48),
                            ),
                          )
                        : const Center(
                            child: Icon(Icons.restaurant, size: 48),
                          ),
                  ),
                  if (widget.item.labels != null)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: _getLabelColor(widget.item.labelColour),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          widget.item.labels!,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.item.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    widget.item.description,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'ETB ${widget.item.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.red,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _getSizeText(widget.item.size),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove),
                            onPressed: _quantity > 1 ? _decrement : null,
                            iconSize: 18,
                          ),
                          Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          IconButton(
                            icon: const Icon(Icons.add),
                            onPressed: _increment,
                            iconSize: 18,
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      _isLoading
                          ? Center(child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)))
                          : ElevatedButton.icon(
                              icon: const Icon(Icons.add_shopping_cart, size: 16),
                              label: const Text('Add to Cart', style: TextStyle(fontSize: 13)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                                minimumSize: const Size(0, 32),
                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                visualDensity: VisualDensity.compact,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                              ),
                              onPressed: _addToCart,
                            ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getLabelColor(String? labelColour) {
    switch (labelColour) {
      case 'danger':
        return Colors.red;
      case 'success':
        return Colors.green;
      case 'primary':
        return Colors.blue;
      case 'info':
        return Colors.teal;
      default:
        return Colors.grey;
    }
  }

  String _getSizeText(String size) {
    switch (size) {
      case 's':
        return 'Small';
      case 'm':
        return 'Medium';
      case 'l':
        return 'Large';
      default:
        return size.toUpperCase();
    }
  }
}