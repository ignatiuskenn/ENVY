import { Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  updateAdminProduct,
  uploadAdminProductImage,
} from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

const EMPTY_FORM = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  stock_quantity: '0',
  image_url: '',
  is_active: true,
};

export function AdminProductsPage() {
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [categories, setCategories] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteConflict, setDeleteConflict] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const { data, loading, error, retry } = useAsyncData(
    () => fetchAdminProducts({ q, categoryId, status }),
    [q, categoryId, status]
  );
  const products = data?.data || [];

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM, category_id: categories[0]?.id ? String(categories[0].id) : '' });
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setForm({
      category_id: String(p.category_id),
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      stock_quantity: String(p.stock_quantity),
      image_url: p.image_url || '',
      is_active: Boolean(p.is_active),
    });
    setImageFile(null);
    setImagePreview(p.image_url || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be 5MB or smaller.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm({ ...form, image_url: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const price = Number(form.price);
    const stock = Number(form.stock_quantity);
    if (!form.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Price must be greater than zero.');
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError('Stock quantity must be a whole number of 0 or more.');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.image_url.trim() || null;
      if (imageFile) {
        const uploaded = await uploadAdminProductImage(imageFile);
        imageUrl = uploaded.url;
      }

      const payload = {
        category_id: Number(form.category_id),
        name: form.name.trim(),
        description: form.description.trim() || null,
        price,
        stock_quantity: stock,
        image_url: imageUrl,
        is_active: Boolean(form.is_active),
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        setFeedback({ type: 'success', text: `"${payload.name}" updated.` });
      } else {
        await createAdminProduct(payload);
        setFeedback({ type: 'success', text: `"${payload.name}" created.` });
      }
      setModalOpen(false);
      retry();
    } catch (err) {
      setFormError(err.message || 'Unable to save product.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteAdminProduct(deleteTarget.id);
      setFeedback({ type: 'success', text: `"${deleteTarget.name}" deleted.` });
      setDeleteTarget(null);
      setDeleteConflict(false);
      retry();
    } catch (err) {
      if (err.status === 409) {
        setDeleteConflict(true);
      } else {
        setFeedback({ type: 'error', text: err.message || 'Delete failed.' });
        setDeleteTarget(null);
      }
    } finally {
      setSaving(false);
    }
  };

  const markInactiveInstead = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await updateAdminProduct(deleteTarget.id, {
        category_id: deleteTarget.category_id,
        name: deleteTarget.name,
        description: deleteTarget.description,
        price: Number(deleteTarget.price),
        stock_quantity: deleteTarget.stock_quantity,
        image_url: deleteTarget.image_url,
        is_active: false,
      });
      setFeedback({ type: 'success', text: `"${deleteTarget.name}" marked inactive. Order history preserved.` });
      setDeleteTarget(null);
      setDeleteConflict(false);
      retry();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to mark inactive.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage ENVY catalog, stock, and active visibility.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {feedback.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-950 focus:outline-none"
          />
        </div>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock (Active)</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Loading products..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Adjust filters or add a new product." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <span className="font-bold text-slate-950">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category?.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {formatPeso(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">
                    {p.stock_quantity}
                  </td>
                  <td className="px-4 py-3">
                    {!p.is_active ? (
                      <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        Inactive
                      </span>
                    ) : p.stock_quantity <= 0 ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-slate-950"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(p);
                          setDeleteConflict(false);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600">Category *</label>
                  <select
                    required
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600">Status</label>
                  <select
                    value={form.is_active ? '1' : '0'}
                    onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                  >
                    <option value="1">Active (Visible)</option>
                    <option value="0">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600">Price (PHP) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600">Stock Quantity *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">
                  Product Image
                </label>
                <div className="mt-1 space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
                  {imagePreview && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-12 w-12 shrink-0 rounded-lg bg-slate-100 object-cover"
                        />
                        <span className="truncate text-xs font-medium text-slate-700">
                          {imageFile ? imageFile.name : 'Current product image'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="shrink-0 cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                    <Upload className="h-4 w-4" />
                    <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="text-center text-[11px] text-slate-500">
                    PNG, JPG, WEBP, GIF, or SVG (max 5MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-xl bg-slate-950 px-5 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation / Order Reference Guard Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-black text-slate-950">
              {deleteConflict ? 'Cannot Hard-Delete Product' : 'Confirm Deletion'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {deleteConflict
                ? `"${deleteTarget.name}" is referenced by existing orders and cannot be deleted. You can mark it inactive instead to hide it from customers while preserving order history.`
                : `Are you sure you want to delete "${deleteTarget.name}"?`}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              {deleteConflict ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={markInactiveInstead}
                  className="cursor-pointer rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400"
                >
                  Mark Inactive Instead
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={confirmDelete}
                  className="cursor-pointer rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
                >
                  Delete Product
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
