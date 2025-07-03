import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/cart_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/payment_success_screen.dart';
import 'package:app_links/app_links.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:flutter_dotenv/flutter_dotenv.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print("Warning: Could not load .env file: $e");
    // Continue without .env file for web development
  }
  final prefs = await SharedPreferences.getInstance();
  final apiService = ApiService(prefs);

  runApp(
    MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => apiService),
        ChangeNotifierProvider(create: (_) => AuthProvider(apiService)),
        ChangeNotifierProvider(create: (_) => CartProvider(apiService)),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  StreamSubscription? _linkSubscription;
  final _appLinks = AppLinks();
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();

  @override
  void initState() {
    super.initState();
    _initDeepLinkHandling();
  }

  void _initDeepLinkHandling() {
    // Handle app launch from deep link
    _appLinks.getInitialAppLink().then((uri) {
      if (uri != null) {
        _handleDeepLink(uri);
      }
    });

    // Handle deep links when app is already running
    _linkSubscription = _appLinks.uriLinkStream.listen((uri) {
      if (uri != null) {
        _handleDeepLink(uri);
      }
    }, onError: (err) {
      print('Deep link error: $err');
    });
  }

  void _handleDeepLink(Uri uri) {
    print('Received deep link: $uri');
    
    try {
      // Handle payment success/failure redirects
      if (uri.scheme == 'atlasburger' || 
          uri.host == 'atlasburger.com' ||
          uri.host == 'localhost') {
        
        final status = uri.queryParameters['status'];
        final orderId = uri.queryParameters['order_id'];
        final txRef = uri.queryParameters['tx_ref'];
        
        // Navigate to payment success screen only if widget is mounted and navigator is ready
        if (mounted) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && _navigatorKey.currentState != null) {
              _navigatorKey.currentState!.pushAndRemoveUntil(
                MaterialPageRoute(
                  builder: (context) => PaymentSuccessScreen(
                    orderId: orderId,
                    status: status,
                  ),
                ),
                (route) => false,
              );
            }
          });
        }
      }
    } catch (e) {
      print('Error parsing deep link: $e');
    }
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'Food Ordering App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.red,
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.red,
          primary: Colors.red,
          secondary: Colors.amber,
        ),
        fontFamily: 'Poppins',
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
      home: Consumer<AuthProvider>(
        builder: (context, authProvider, _) {
          return authProvider.isAuthenticated ? const HomeScreen() : const LoginScreen();
        },
      ),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const HomeScreen(),
        '/payment-success': (context) => const PaymentSuccessScreen(),
      },
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _selectedIndex = 0;

  static final List<Widget> _pages = <Widget>[
    HomeScreen(),
    CartScreen(),
    Center(child: Text('Order History (Coming Soon)', style: TextStyle(fontSize: 18))),
    ProfileScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
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
            icon: Icon(Icons.account_circle),
            label: 'Account',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).primaryColor,
        onTap: _onItemTapped,
      ),
    );
  }
}
