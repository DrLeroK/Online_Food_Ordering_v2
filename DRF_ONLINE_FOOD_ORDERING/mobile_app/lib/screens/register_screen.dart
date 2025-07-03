import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart'; // Make sure to import your login screen

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  
  bool _isLoading = false;
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String? _errorMessage;
  
  // Field validation states
  Map<String, bool> _fieldErrors = {};
  Map<String, String> _fieldErrorMessages = {};

  @override
  void dispose() {
    _usernameController.dispose();
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _clearFieldError(String fieldName) {
    setState(() {
      _fieldErrors[fieldName] = false;
      _fieldErrorMessages.remove(fieldName);
    });
  }

  void _setFieldError(String fieldName, String message) {
    setState(() {
      _fieldErrors[fieldName] = true;
      _fieldErrorMessages[fieldName] = message;
    });
  }

  String? _validateUsername(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('username', 'Please enter a username');
      return 'Please enter a username';
    }
    if (value.length < 3) {
      _setFieldError('username', 'Username must be at least 3 characters');
      return 'Username must be at least 3 characters';
    }
    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
      _setFieldError('username', 'Username can only contain letters, numbers, and underscores');
      return 'Username can only contain letters, numbers, and underscores';
    }
    _clearFieldError('username');
    return null;
  }

  String? _validateFirstName(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('firstName', 'Please enter your first name');
      return 'Please enter your first name';
    }
    if (value.length < 2) {
      _setFieldError('firstName', 'First name must be at least 2 characters');
      return 'First name must be at least 2 characters';
    }
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value)) {
      _setFieldError('firstName', 'First name can only contain letters and spaces');
      return 'First name can only contain letters and spaces';
    }
    _clearFieldError('firstName');
    return null;
  }

  String? _validateLastName(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('lastName', 'Please enter your last name');
      return 'Please enter your last name';
    }
    if (value.length < 2) {
      _setFieldError('lastName', 'Last name must be at least 2 characters');
      return 'Last name must be at least 2 characters';
    }
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(value)) {
      _setFieldError('lastName', 'Last name can only contain letters and spaces');
      return 'Last name can only contain letters and spaces';
    }
    _clearFieldError('lastName');
    return null;
  }

  String? _validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('email', 'Please enter your email');
      return 'Please enter your email';
    }
    if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(value)) {
      _setFieldError('email', 'Please enter a valid email address');
      return 'Please enter a valid email address';
    }
    _clearFieldError('email');
    return null;
  }

  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('phone', 'Please enter your phone number');
      return 'Please enter your phone number';
    }
    // Match the backend validation: ^\+?1?\d{9,15}$
    if (!RegExp(r'^\+?1?\d{9,15}$').hasMatch(value.replaceAll(RegExp(r'[\s\-\(\)]'), ''))) {
      _setFieldError('phone', 'Phone number must be in format: +999999999 (9-15 digits)');
      return 'Phone number must be in format: +999999999 (9-15 digits)';
    }
    _clearFieldError('phone');
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('password', 'Please enter your password');
      return 'Please enter your password';
    }
    if (value.length < 6) {
      _setFieldError('password', 'Password must be at least 6 characters');
      return 'Password must be at least 6 characters';
    }
    if (!RegExp(r'^(?=.*[A-Za-z])(?=.*\d)').hasMatch(value)) {
      _setFieldError('password', 'Password must contain both letters and numbers');
      return 'Password must contain both letters and numbers';
    }
    _clearFieldError('password');
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('confirmPassword', 'Please confirm your password');
      return 'Please confirm your password';
    }
    if (value != _passwordController.text) {
      _setFieldError('confirmPassword', 'Passwords do not match');
      return 'Passwords do not match';
    }
    _clearFieldError('confirmPassword');
    return null;
  }

  void _validateAllFields() {
    _validateUsername(_usernameController.text);
    _validateFirstName(_firstNameController.text);
    _validateLastName(_lastNameController.text);
    _validateEmail(_emailController.text);
    _validatePhone(_phoneController.text);
    _validatePassword(_passwordController.text);
    _validateConfirmPassword(_confirmPasswordController.text);
  }

  Future<void> _submitForm() async {
    // Clear previous errors
    setState(() {
      _errorMessage = null;
      _fieldErrors.clear();
      _fieldErrorMessages.clear();
    });

    // Validate all fields
    _validateAllFields();

    // Check if there are any validation errors
    if (_fieldErrors.values.any((hasError) => hasError)) {
      setState(() {
        _errorMessage = 'Please fix the errors below before submitting';
      });
      return;
    }

    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final result = await authProvider.register(
        _usernameController.text.trim(),
        _firstNameController.text.trim(),
        _lastNameController.text.trim(),
        _emailController.text.trim(),
        _phoneController.text.trim(),
        _passwordController.text,
      );

      if (result['success'] && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Registration successful! Please login.'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      } else if (mounted) {
        setState(() => _errorMessage = 'Registration failed. Please try again.');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _errorMessage = 'An error occurred. Please try again.');
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildHeader() {
    return Column(
      children: [
        const SizedBox(height: 16),
        const Text(
          'Create Account',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Fill in your details to get started',
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildErrorMessage() {
    if (_errorMessage == null && _fieldErrorMessages.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        if (_errorMessage != null)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              _errorMessage!,
              style: TextStyle(color: Colors.red.shade900),
              textAlign: TextAlign.center,
            ),
          ),
        if (_fieldErrorMessages.isNotEmpty) ...[
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.warning_amber, color: Colors.orange.shade700, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Please fix the following errors:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange.shade700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ..._fieldErrorMessages.entries.map((entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('• ', style: TextStyle(color: Colors.orange.shade700)),
                      Expanded(
                        child: Text(
                          '${_getFieldDisplayName(entry.key)}: ${entry.value}',
                          style: TextStyle(color: Colors.orange.shade700),
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
        const SizedBox(height: 16),
      ],
    );
  }

  String _getFieldDisplayName(String fieldName) {
    switch (fieldName) {
      case 'username':
        return 'Username';
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'email':
        return 'Email';
      case 'phone':
        return 'Phone Number';
      case 'password':
        return 'Password';
      case 'confirmPassword':
        return 'Confirm Password';
      default:
        return fieldName;
    }
  }

  Widget _buildUsernameField() {
    return TextFormField(
      controller: _usernameController,
      decoration: InputDecoration(
        labelText: 'Username',
        hintText: 'e.g. johndoe123',
        prefixIcon: const Icon(Icons.person_outline),
        errorText: _fieldErrors['username'] == true ? _fieldErrorMessages['username'] : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: _fieldErrors['username'] == true ? Colors.red : Colors.blue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      onChanged: (value) => _validateUsername(value),
      validator: _validateUsername,
    );
  }

  Widget _buildNameFields() {
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _firstNameController,
            decoration: InputDecoration(
              labelText: 'First Name',
              hintText: 'e.g. John',
              errorText: _fieldErrors['firstName'] == true ? _fieldErrorMessages['firstName'] : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: _fieldErrors['firstName'] == true ? Colors.red : Colors.blue,
                  width: 2,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.red, width: 2),
              ),
            ),
            onChanged: (value) => _validateFirstName(value),
            validator: _validateFirstName,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: TextFormField(
            controller: _lastNameController,
            decoration: InputDecoration(
              labelText: 'Last Name',
              hintText: 'e.g. Doe',
              errorText: _fieldErrors['lastName'] == true ? _fieldErrorMessages['lastName'] : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(
                  color: _fieldErrors['lastName'] == true ? Colors.red : Colors.blue,
                  width: 2,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.red, width: 2),
              ),
            ),
            onChanged: (value) => _validateLastName(value),
            validator: _validateLastName,
          ),
        ),
      ],
    );
  }

  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      decoration: InputDecoration(
        labelText: 'Email',
        hintText: 'e.g. johndoe@email.com',
        prefixIcon: const Icon(Icons.email_outlined),
        errorText: _fieldErrors['email'] == true ? _fieldErrorMessages['email'] : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: _fieldErrors['email'] == true ? Colors.red : Colors.blue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      keyboardType: TextInputType.emailAddress,
      onChanged: (value) => _validateEmail(value),
      validator: _validateEmail,
    );
  }

  Widget _buildPhoneField() {
    return TextFormField(
      controller: _phoneController,
      decoration: InputDecoration(
        labelText: 'Phone Number',
        hintText: 'e.g. +1234567890',
        prefixIcon: const Icon(Icons.phone_outlined),
        errorText: _fieldErrors['phone'] == true ? _fieldErrorMessages['phone'] : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: _fieldErrors['phone'] == true ? Colors.red : Colors.blue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      keyboardType: TextInputType.phone,
      onChanged: (value) => _validatePhone(value),
      validator: _validatePhone,
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      obscureText: _obscurePassword,
      decoration: InputDecoration(
        labelText: 'Password',
        prefixIcon: const Icon(Icons.lock_outline),
        errorText: _fieldErrors['password'] == true ? _fieldErrorMessages['password'] : null,
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off : Icons.visibility,
            color: Colors.grey,
          ),
          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: _fieldErrors['password'] == true ? Colors.red : Colors.blue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      onChanged: (value) => _validatePassword(value),
      validator: _validatePassword,
    );
  }

  Widget _buildConfirmPasswordField() {
    return TextFormField(
      controller: _confirmPasswordController,
      obscureText: _obscureConfirmPassword,
      decoration: InputDecoration(
        labelText: 'Confirm Password',
        prefixIcon: const Icon(Icons.lock_outline),
        errorText: _fieldErrors['confirmPassword'] == true ? _fieldErrorMessages['confirmPassword'] : null,
        suffixIcon: IconButton(
          icon: Icon(
            _obscureConfirmPassword ? Icons.visibility_off : Icons.visibility,
            color: Colors.grey,
          ),
          onPressed: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: _fieldErrors['confirmPassword'] == true ? Colors.red : Colors.blue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      onChanged: (value) => _validateConfirmPassword(value),
      validator: _validateConfirmPassword,
    );
  }

  Widget _buildPasswordRequirements() {
    return Container(
      padding: const EdgeInsets.all(12),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Password Requirements:',
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 4),
          Text('• At least 6 characters'),
          Text('• Include letters and numbers'),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _submitForm,
      style: ElevatedButton.styleFrom(
        minimumSize: const Size.fromHeight(50),
      ),
      child: _isLoading
          ? const SizedBox(
              height: 24,
              width: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            )
          : const Text(
              'Create Account',
              style: TextStyle(fontSize: 16),
            ),
    );
  }

  Widget _buildLoginLink() {
    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Already have an account?'),
          TextButton(
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
            child: const Text('Sign In'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Account'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                _buildErrorMessage(),
                _buildUsernameField(),
                const SizedBox(height: 16),
                _buildNameFields(),
                const SizedBox(height: 16),
                _buildEmailField(),
                const SizedBox(height: 16),
                _buildPhoneField(),
                const SizedBox(height: 16),
                _buildPasswordField(),
                const SizedBox(height: 16),
                _buildConfirmPasswordField(),
                const SizedBox(height: 16),
                _buildPasswordRequirements(),
                const SizedBox(height: 24),
                _buildSubmitButton(),
                _buildLoginLink(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}