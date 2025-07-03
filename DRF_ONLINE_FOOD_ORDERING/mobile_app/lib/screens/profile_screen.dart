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

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final api = Provider.of<ApiService>(context, listen: false);
    final profile = await api.getProfile();
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: _isLoading
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
        ),
      ),
    );
  }
} 