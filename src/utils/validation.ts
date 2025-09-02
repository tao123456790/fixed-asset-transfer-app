import { useState } from 'react';

// Common validation patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[0-9]{10}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Validation rule interface
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
  custom?: (value: any) => boolean;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string;
}

// Common validation rules
export const commonRules = {
  required: (message = 'This field is required') => ({
    required: true,
    message,
  }),
  email: (message = 'Please enter a valid email address') => ({
    required: true,
    pattern: PATTERNS.EMAIL,
    message,
  }),
  password: (message = 'Password must be at least 8 characters') => ({
    required: true,
    minLength: 8,
    message,
  }),
  phone: (message = 'Please enter a valid phone number') => ({
    required: true,
    pattern: PATTERNS.PHONE,
    message,
  }),
};

// Custom hook for form validation
export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (fieldName: string, value: any): boolean => {
    const rule = rules[fieldName];
    if (!rule) return true;

    // Check required
    if (rule.required && (!value || value.toString().trim() === '')) {
      setErrors(prev => ({ ...prev, [fieldName]: rule.message || 'This field is required' }));
      return false;
    }

    // Check minLength
    if (rule.minLength && value && value.toString().length < rule.minLength) {
      setErrors(prev => ({ ...prev, [fieldName]: rule.message || `Minimum length is ${rule.minLength}` }));
      return false;
    }

    // Check maxLength
    if (rule.maxLength && value && value.toString().length > rule.maxLength) {
      setErrors(prev => ({ ...prev, [fieldName]: rule.message || `Maximum length is ${rule.maxLength}` }));
      return false;
    }

    // Check pattern
    if (rule.pattern && value && !rule.pattern.test(value.toString())) {
      setErrors(prev => ({ ...prev, [fieldName]: rule.message || 'Invalid format' }));
      return false;
    }

    // Check custom validation
    if (rule.custom && value && !rule.custom(value)) {
      setErrors(prev => ({ ...prev, [fieldName]: rule.message || 'Invalid value' }));
      return false;
    }

    // Clear error if validation passes
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    return true;
  };

  const validateForm = (formData: any): boolean => {
    let isValid = true;
    const newErrors: ValidationErrors = {};

    Object.keys(rules).forEach(fieldName => {
      if (!validateField(fieldName, formData[fieldName])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const validateSingleField = (fieldName: string, value: any): boolean => {
    return validateField(fieldName, value);
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const hasFieldError = (fieldName: string): boolean => {
    return !!errors[fieldName];
  };

  const setFieldError = (fieldName: string, message: string) => {
    setErrors(prev => ({ ...prev, [fieldName]: message }));
  };

  return {
    errors,
    validateForm,
    validateSingleField,
    clearFieldError,
    clearAllErrors,
    hasFieldError,
    setFieldError,
  };
};