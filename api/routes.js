// API routes for Reddit conversion tracking

import express from 'express';
import { handlePayPalSubscriptionConfirmation } from './handlers/payments';
import { handleUserRegistrationComplete, handleOnboardingComplete } from './handlers/users';
import { handleContactFormSubmission } from './handlers/contact';

const router = express.Router();

// PayPal subscription tracking
router.post('/payments/paypal/confirm', handlePayPalSubscriptionConfirmation);

// User registration tracking
router.post('/users/registration/complete', handleUserRegistrationComplete);

// Onboarding completion tracking
router.post('/users/onboarding/complete', handleOnboardingComplete);

// Contact form submission tracking
router.post('/contact/submit', handleContactFormSubmission);

export default router; 