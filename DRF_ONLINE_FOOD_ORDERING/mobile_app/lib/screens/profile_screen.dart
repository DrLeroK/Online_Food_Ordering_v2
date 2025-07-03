import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../screens/login_screen.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _isLoading = true;
  String? _error;
  late ApiService _apiService;

  @override
  void initState() {
    super.initState();
    // Use post frame callback to avoid provider issues during build
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadProfile();
      }
    });
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      _apiService = context.read<ApiService>();
      final profile = await _apiService.getProfile();
      if (mounted) {
        if (profile != null) {
          setState(() {
            _profile = profile;
            _isLoading = false;
          });
        } else {
          setState(() {
            _error = 'Failed to load profile.';
            _isLoading = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Failed to load profile: ${e.toString()}';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        backgroundColor: Colors.orange,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _isLoading
                ? const CircularProgressIndicator()
                : _error != null
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(_error!, style: const TextStyle(color: Colors.red)),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadProfile,
                            child: const Text('Retry'),
                          ),
                        ],
                      )
                    : _profile == null
                        ? const Text('No profile data.')
                        : Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircleAvatar(
                                radius: 48,
                                backgroundColor: Colors.red[700],
                                child: const Icon(Icons.person, size: 48, color: Colors.white),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                '${_profile!['first_name']} ${_profile!['last_name']}',
                                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text('@${_profile!['username']}', style: const TextStyle(color: Colors.grey)),
                              const SizedBox(height: 16),
                              Card(
                                margin: const EdgeInsets.symmetric(horizontal: 32, vertical: 8),
                                elevation: 2,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                child: Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.email, color: Colors.red),
                                          const SizedBox(width: 8),
                                          Expanded(child: Text(_profile!['email'] ?? '-', style: const TextStyle(fontSize: 16))),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.phone, color: Colors.red),
                                          const SizedBox(width: 8),
                                          Expanded(child: Text(_profile!['phone_number'] ?? '-', style: const TextStyle(fontSize: 16))),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, color: Colors.amber),
                                          const SizedBox(width: 8),
                                          Text('Score: ${_profile!['score'] ?? 0}', style: const TextStyle(fontSize: 16)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 32),
                              ElevatedButton.icon(
                                onPressed: () async {
                                  final updated = await showDialog<bool>(
                                    context: context,
                                    builder: (context) {
                                      final firstNameController = TextEditingController(text: _profile!['first_name'] ?? '');
                                      final lastNameController = TextEditingController(text: _profile!['last_name'] ?? '');
                                      final emailController = TextEditingController(text: _profile!['email'] ?? '');
                                      final phoneController = TextEditingController(text: _profile!['phone_number'] ?? '');
                                      bool isLoading = false;
                                      String? error;
                                      return StatefulBuilder(
                                        builder: (context, setState) {
                                          return AlertDialog(
                                            title: const Text('Edit Profile'),
                                            content: SingleChildScrollView(
                                              child: Padding(
                                                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                                                child: Column(
                                                  mainAxisSize: MainAxisSize.min,
                                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                                  children: [
                                                    TextField(
                                                      controller: firstNameController,
                                                      decoration: const InputDecoration(labelText: 'First Name'),
                                                    ),
                                                    const SizedBox(height: 16),
                                                    TextField(
                                                      controller: lastNameController,
                                                      decoration: const InputDecoration(labelText: 'Last Name'),
                                                    ),
                                                    const SizedBox(height: 16),
                                                    TextField(
                                                      controller: emailController,
                                                      decoration: const InputDecoration(labelText: 'Email'),
                                                    ),
                                                    const SizedBox(height: 16),
                                                    TextField(
                                                      controller: phoneController,
                                                      decoration: const InputDecoration(labelText: 'Phone Number'),
                                                    ),
                                                    if (error != null) ...[
                                                      const SizedBox(height: 12),
                                                      Text(error!, style: const TextStyle(color: Colors.red)),
                                                    ],
                                                  ],
                                                ),
                                              ),
                                            ),
                                            actions: [
                                              TextButton(
                                                onPressed: isLoading ? null : () => Navigator.of(context).pop(false),
                                                child: const Text('Cancel'),
                                              ),
                                              ElevatedButton(
                                                onPressed: isLoading
                                                    ? null
                                                    : () async {
                                                        setState(() => isLoading = true);
                                                        final success = await _apiService.updateProfile(
                                                          firstName: firstNameController.text.trim(),
                                                          lastName: lastNameController.text.trim(),
                                                          email: emailController.text.trim(),
                                                          phoneNumber: phoneController.text.trim(),
                                                        );
                                                        setState(() => isLoading = false);
                                                        if (success) {
                                                          Navigator.of(context).pop(true);
                                                        } else {
                                                          setState(() => error = 'Failed to update profile.');
                                                        }
                                                      },
                                                child: isLoading
                                                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                                                    : const Text('Save'),
                                              ),
                                            ],
                                          );
                                        },
                                      );
                                    },
                                  );
                                  if (updated == true) {
                                    _loadProfile();
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Profile updated successfully!')),
                                    );
                                  }
                                },
                                icon: const Icon(Icons.edit),
                                label: const Text('Edit Profile'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.blue,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 32),
                              ElevatedButton.icon(
                                onPressed: () {
                                  context.read<AuthProvider>().logout();
                                  Navigator.of(context).pushAndRemoveUntil(
                                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                                    (route) => false,
                                  );
                                },
                                icon: const Icon(Icons.logout),
                                label: const Text('Logout'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red,
                                  foregroundColor: Colors.white,
                                ),
                              ),
                            ],
                          ),
            const SizedBox(height: 30),
            
            // Debug Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Debug Options',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const Text(
                      'Use these options if you experience authentication issues after changing IP or emulator:',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 10),
                    ElevatedButton(
                      onPressed: () async {
                        await _apiService.clearStoredData();
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Stored data cleared. Please log in again.'),
                            backgroundColor: Colors.orange,
                          ),
                        );
                        // Navigate to login screen
                        Navigator.of(context).pushReplacementNamed('/login');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Clear Stored Data & Logout'),
                    ),
                    const SizedBox(height: 5),
                    ElevatedButton(
                      onPressed: () async {
                        final isAuth = await _apiService.isAuthenticated();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Authentication Status: ${isAuth ? "Authenticated" : "Not Authenticated"}'),
                            backgroundColor: isAuth ? Colors.green : Colors.red,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Check Auth Status'),
                    ),
                    const SizedBox(height: 5),
                    ElevatedButton(
                      onPressed: () async {
                        await _apiService.refreshTokenFromStorage();
                        final isAuth = await _apiService.isAuthenticated();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Token refreshed. Auth Status: ${isAuth ? "Authenticated" : "Not Authenticated"}'),
                            backgroundColor: isAuth ? Colors.green : Colors.orange,
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Refresh Token'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
} 