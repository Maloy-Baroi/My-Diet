export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Basic phone number validation (international format)
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateWeight = (weight: number): boolean => {
  return weight >= 20 && weight <= 500;
};

export const validateHeight = (height: number): boolean => {
  return height >= 50 && height <= 300;
};

export const validateAge = (birthDate: string): boolean => {
  const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
  return age >= 13 && age <= 120;
};

export const validateCalories = (calories: number): boolean => {
  return calories >= 500 && calories <= 10000;
};

export const validateMacros = (protein: number, carbs: number, fat: number): boolean => {
  return protein >= 0 && protein <= 1000 &&
         carbs >= 0 && carbs <= 1000 &&
         fat >= 0 && fat <= 500;
};

export const getPasswordStrength = (password: string): { score: number; message: string } => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;
  
  const messages = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];
  
  return {
    score,
    message: messages[score] || 'Very Weak'
  };
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};
