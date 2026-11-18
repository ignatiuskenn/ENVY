import { PAYMENT_METHODS } from '../constants/paymentMethods';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s().]{5,50}$/;

export function validateCheckoutForm(values) {
  const errors = {};

  if (!values.customer_name || !values.customer_name.trim()) {
    errors.customer_name = 'Customer name is required.';
  }

  const email = (values.customer_email || '').trim();
  if (!email) {
    errors.customer_email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.customer_email = 'Please enter a valid email address.';
  }

  const contact = (values.customer_contact || '').trim();
  if (!contact) {
    errors.customer_contact = 'Contact number is required.';
  } else if (!PHONE_REGEX.test(contact)) {
    errors.customer_contact = 'Please enter a valid phone number.';
  }

  if (!values.delivery_address || !values.delivery_address.trim()) {
    errors.delivery_address = 'Delivery address is required.';
  }

  if (!PAYMENT_METHODS.includes(values.payment_method)) {
    errors.payment_method = 'Please select a payment method.';
  }

  return errors;
}
