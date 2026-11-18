import { apiRequest } from './client';

export function fetchCategories() {
  return apiRequest('/categories');
}

export function fetchProducts({ q = '', categoryId = '', sort = '' } = {}) {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (categoryId) params.set('category_id', String(categoryId));
  if (sort) params.set('sort', sort);

  const query = params.toString();
  return apiRequest(`/products${query ? `?${query}` : ''}`);
}

export function fetchProductById(id) {
  return apiRequest(`/products/${id}`);
}

export function submitCheckout(payload) {
  return apiRequest('/checkout', {
    method: 'POST',
    body: payload,
    customerAuth: true,
  });
}

export function fetchMyOrders() {
  return apiRequest('/my-orders', {
    customerAuth: true,
  });
}
