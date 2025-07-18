// Validation utils for Notelo AI
// Used to validate email and password of user.
// Used to sanitize user input.

import { z } from 'zod';

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')
  .trim()
  .toLowerCase();

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d@$!%*?&#_\-+=[\]{}|\\:;"'<>,.~`^()]+$/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') 
    .slice(0, 255); 
};

// Validation result interface
interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Validate email
export const validateEmail = (email: string): ValidationResult<string> => {
  try {
    return { 
      success: true, 
      data: emailSchema.parse(email)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      };
    }
    return {
      success: false,
      error: 'Invalid email format'
    };
  }
};

// Validate password
export const validatePassword = (password: string): ValidationResult<string> => {
  try {
    return {
      success: true,
      data: passwordSchema.parse(password)
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message
      };
    }
    return {
      success: false,
      error: 'Invalid password format'
    };
  }
}; 