// Validation utility functions
export const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password) => {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return {
    isValid: hasMinLength && hasNumber && hasSpecialChar,
    requirements: {
      length: hasMinLength,
      number: hasNumber,
      specialChar: hasSpecialChar
    }
  };
};

export const formatPhoneNumber = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return value;
  
  const formatted = [
    match[1],
    match[2] ? `-${match[2]}` : '',
    match[3] ? `-${match[3]}` : ''
  ].join('');
  
  return formatted;
};

export const validateUsername = (username) => {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};