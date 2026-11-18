import { apiRequest } from './client';

export function registerCustomer(payload) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function loginCustomer(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function fetchCustomerMe() {
  return apiRequest('/auth/me', { customerAuth: true });
}

export function logoutCustomer() {
  return apiRequest('/auth/logout', { method: 'POST', customerAuth: true });
}
