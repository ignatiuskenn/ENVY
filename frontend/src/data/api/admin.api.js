import { apiRequest } from './client';

export function adminLogin(credentials) {
  return apiRequest('/admin/login', {
    method: 'POST',
    body: credentials,
  });
}

export function fetchAdminMe() {
  return apiRequest('/admin/me', { auth: true });
}

export function adminLogout() {
  return apiRequest('/admin/logout', { method: 'POST', auth: true });
}

export function fetchAdminOverview() {
  return apiRequest('/admin/overview', { auth: true });
}

export function fetchAdminCustomers() {
  return apiRequest('/admin/customers', { auth: true });
}

export function fetchAdminProducts({ q = '', categoryId = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (categoryId) params.set('category_id', String(categoryId));
  if (status) params.set('status', status);

  const query = params.toString();
  return apiRequest(`/admin/products${query ? `?${query}` : ''}`, { auth: true });
}

export function createAdminProduct(payload) {
  return apiRequest('/admin/products', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateAdminProduct(id, payload) {
  return apiRequest(`/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export function deleteAdminProduct(id) {
  return apiRequest(`/admin/products/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function fetchAdminCategories() {
  return apiRequest('/admin/categories', { auth: true });
}

export function createAdminCategory(payload) {
  return apiRequest('/admin/categories', {
    method: 'POST',
    body: payload,
    auth: true,
  });
}

export function updateAdminCategory(id, payload) {
  return apiRequest(`/admin/categories/${id}`, {
    method: 'PUT',
    body: payload,
    auth: true,
  });
}

export function deleteAdminCategory(id) {
  return apiRequest(`/admin/categories/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

export function fetchAdminOrders() {
  return apiRequest('/admin/orders', { auth: true });
}

export function fetchAdminOrderDetail(id) {
  return apiRequest(`/admin/orders/${id}`, { auth: true });
}

export function updateAdminOrderStatus(id, status) {
  return apiRequest(`/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
