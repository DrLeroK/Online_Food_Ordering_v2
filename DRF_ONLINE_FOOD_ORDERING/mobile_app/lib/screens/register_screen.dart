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
  bool _isFormValid = false;
  
  // Field validation states
  Map<String, bool> _fieldErrors = {};
  Map<String, String> _fieldErrorMessages = {};
  
  // Password validation state
  Map<String, bool> _passwordRequirements = {
    'length': false,
    'number': false,
    'specialChar': false,
  };

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_validatePasswordRealtime);
    _confirmPasswordController.addListener(_validateFormRealtime);
  }

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

  void _validateFormRealtime() {
    final isUsernameValid = _validateUsername(_usernameController.text) == null;
    final isFirstNameValid = _validateFirstName(_firstNameController.text) == null;
    final isLastNameValid = _validateLastName(_lastNameController.text) == null;
    final isEmailValid = _validateEmail(_emailController.text) == null;
    final isPhoneValid = _validatePhone(_phoneController.text) == null;
    final isPasswordValid = _passwordRequirements.values.every((valid) => valid);
    final doPasswordsMatch = _passwordController.text == _confirmPasswordController.text && 
                           _passwordController.text.isNotEmpty;

    setState(() {
      _isFormValid = isUsernameValid &&
                     isFirstNameValid &&
                     isLastNameValid &&
                     isEmailValid &&
                     isPhoneValid &&
                     isPasswordValid &&
                     doPasswordsMatch;
    });
  }

  void _validatePasswordRealtime() {
    final password = _passwordController.text;
    setState(() {
      _passwordRequirements['length'] = password.length >= 8;
      _passwordRequirements['number'] = RegExp(r'\d').hasMatch(password);
      _passwordRequirements['specialChar'] = RegExp(r'[!@#$%^&*(),.?":{}|<>]').hasMatch(password);
    });
    _validateFormRealtime();
  }

  void _clearFieldError(String fieldName) {
    setState(() {
      _fieldErrors[fieldName] = false;
      _fieldErrorMessages.remove(fieldName);
    });
    _validateFormRealtime();
  }

  void _setFieldError(String fieldName, String message) {
    setState(() {
      _fieldErrors[fieldName] = true;
      _fieldErrorMessages[fieldName] = message;
    });
    _validateFormRealtime();
  }

  String _formatPhoneNumber(String value) {
    if (value.isEmpty) return value;
    
    // Remove all non-digits
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    
    // Format as XXX-XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return '${cleaned.substring(0, 3)}-${cleaned.substring(3)}';
    } else {
      return '${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, cleaned.length > 10 ? 10 : cleaned.length)}';
    }
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
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value)) {
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
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    if (cleaned.length < 10) {
      _setFieldError('phone', 'Phone number must be at least 10 digits');
      return 'Phone number must be at least 10 digits';
    }
    _clearFieldError('phone');
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      _setFieldError('password', 'Please enter your password');
      return 'Please enter your password';
    }
    if (!_passwordRequirements.values.every((valid) => valid)) {
      _setFieldError('password', 'Password does not meet requirements');
      return 'Password does not meet requirements';
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
        _phoneController.text.replaceAll(RegExp(r'\D'), ''), // Remove formatting
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
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Colors.red, Colors.redAccent],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.red.withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: const Icon(
            Icons.person_add,
            size: 40,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 20),
        const Text(
          'Create Your Account',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          'Join our burger community today',
          style: TextStyle(
            fontSize: 16,
            color: Colors.grey,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 30),
      ],
    );
  }

  Widget _buildErrorMessage() {
    if (_errorMessage == null && _fieldErrorMessages.isEmpty) return const SizedBox.shrink();

    return Column(
      children: [
        if (_errorMessage != null)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.red.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.red.shade200),
            ),
            child: Row(
              children: [
                Icon(Icons.error_outline, color: Colors.red.shade700, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(color: Colors.red.shade900, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
        if (_fieldErrorMessages.isNotEmpty) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.orange.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.warning_amber, color: Colors.orange.shade700, size: 20),
                    const SizedBox(width: 12),
                    Text(
                      'Please fix the following errors:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.orange.shade700,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                ..._fieldErrorMessages.entries.map((entry) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('• ', style: TextStyle(color: Colors.orange.shade700, fontSize: 14)),
                      Expanded(
                        child: Text(
                          '${_getFieldDisplayName(entry.key)}: ${entry.value}',
                          style: TextStyle(color: Colors.orange.shade700, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
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

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    required String? Function(String?) validator,
    required void Function(String) onChanged,
    bool isPassword = false,
    bool obscureText = false,
    VoidCallback? onToggleVisibility,
    TextInputType? keyboardType,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextFormField(
              controller: controller,
              obscureText: obscureText,
              keyboardType: keyboardType,
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                prefixIcon: Icon(icon, color: Colors.grey.shade600, size: 20),
                suffixIcon: isPassword
                    ? IconButton(
                        icon: Icon(
                          obscureText ? Icons.visibility_off : Icons.visibility,
                          color: Colors.grey.shade600,
                          size: 20,
                        ),
                        onPressed: onToggleVisibility,
                      )
                    : null,
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.red, width: 2),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Colors.red, width: 2),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              ),
              onChanged: onChanged,
              validator: validator,
            ),
          ),
          if (_fieldErrors[label.toLowerCase().replaceAll(' ', '')] == true)
            Padding(
              padding: const EdgeInsets.only(top: 8, left: 4),
              child: Text(
                _fieldErrorMessages[label.toLowerCase().replaceAll(' ', '')] ?? '',
                style: const TextStyle(color: Colors.red, fontSize: 12),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNameFields() {
    return Row(
      children: [
        Expanded(
          child: _buildInputField(
            controller: _firstNameController,
            label: 'First Name',
            hint: 'e.g. John',
            icon: Icons.person_outline,
            validator: _validateFirstName,
            onChanged: (value) => _validateFirstName(value),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildInputField(
            controller: _lastNameController,
            label: 'Last Name',
            hint: 'e.g. Doe',
            icon: Icons.person_outline,
            validator: _validateLastName,
            onChanged: (value) => _validateLastName(value),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordRequirements() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, color: Colors.blue.shade700, size: 18),
              const SizedBox(width: 8),
              Text(
                'Password Requirements:',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.blue.shade700,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Icon(
                _passwordRequirements['length']! ? Icons.check_circle : Icons.cancel,
                color: _passwordRequirements['length']! ? Colors.green : Colors.red,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'At least 8 characters',
                style: TextStyle(
                  color: _passwordRequirements['length']! ? Colors.green : Colors.red,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(
                _passwordRequirements['number']! ? Icons.check_circle : Icons.cancel,
                color: _passwordRequirements['number']! ? Colors.green : Colors.red,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Contains a number',
                style: TextStyle(
                  color: _passwordRequirements['number']! ? Colors.green : Colors.red,
                  fontSize: 13,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(
                _passwordRequirements['specialChar']! ? Icons.check_circle : Icons.cancel,
                color: _passwordRequirements['specialChar']! ? Colors.green : Colors.red,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Contains a special character',
                style: TextStyle(
                  color: _passwordRequirements['specialChar']! ? Colors.green : Colors.red,
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return Container(
      width: double.infinity,
      height: 56,
      margin: const EdgeInsets.only(top: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: _isFormValid ? Colors.red.withOpacity(0.3) : Colors.grey.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: (_isLoading || !_isFormValid) ? null : _submitForm,
        style: ElevatedButton.styleFrom(
          backgroundColor: _isFormValid ? Colors.red : Colors.grey.shade400,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
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
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Widget _buildLoginLink() {
    return Container(
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          const Text(
            'Already have an account?',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: OutlinedButton(
              onPressed: () {
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.grey.shade300),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                backgroundColor: Colors.white,
              ),
              child: const Text(
                'Sign In',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.black87,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.1),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      _buildErrorMessage(),
                      _buildInputField(
                        controller: _usernameController,
                        label: 'Username',
                        hint: 'e.g. johndoe123',
                        icon: Icons.person_outline,
                        validator: _validateUsername,
                        onChanged: (value) => _validateUsername(value),
                      ),
                      _buildNameFields(),
                      _buildInputField(
                        controller: _emailController,
                        label: 'Email',
                        hint: 'e.g. johndoe@email.com',
                        icon: Icons.email_outlined,
                        validator: _validateEmail,
                        onChanged: (value) => _validateEmail(value),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      _buildInputField(
                        controller: _phoneController,
                        label: 'Phone Number',
                        hint: 'e.g. 091-234-5678',
                        icon: Icons.phone_outlined,
                        validator: _validatePhone,
                        onChanged: (value) {
                          final formatted = _formatPhoneNumber(value);
                          if (formatted != value) {
                            _phoneController.value = TextEditingValue(
                              text: formatted,
                              selection: TextSelection.collapsed(offset: formatted.length),
                            );
                          }
                          _validatePhone(formatted);
                        },
                        keyboardType: TextInputType.phone,
                      ),
                      _buildInputField(
                        controller: _passwordController,
                        label: 'Password',
                        hint: 'Your password',
                        icon: Icons.lock_outline,
                        validator: _validatePassword,
                        onChanged: (value) => _validatePasswordRealtime(),
                        isPassword: true,
                        obscureText: _obscurePassword,
                        onToggleVisibility: () => setState(() => _obscurePassword = !_obscurePassword),
                      ),
                      _buildPasswordRequirements(),
                      _buildInputField(
                        controller: _confirmPasswordController,
                        label: 'Confirm Password',
                        hint: 'Confirm your password',
                        icon: Icons.lock_outline,
                        validator: _validateConfirmPassword,
                        onChanged: (value) => _validateConfirmPassword(value),
                        isPassword: true,
                        obscureText: _obscureConfirmPassword,
                        onToggleVisibility: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
                      ),
                      _buildSubmitButton(),
                    ],
                  ),
                ),
                _buildLoginLink(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}