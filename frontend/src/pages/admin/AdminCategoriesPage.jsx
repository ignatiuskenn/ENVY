import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from '../../data/api/admin.api';
import { useAsyncData } from '../../hooks/useAsyncData';

export function AdminCategoriesPage() {
  const { data, loading, error, retry } = useAsyncData(() => fetchAdminCategories(), []);
  const categories = data?.data || [];

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  const showMsg = (type, text) => setFeedback({ type, text });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showMsg('error', 'Category name cannot be blank.');
      return;
    }
    setBusy(true);
    try {
      await createAdminCategory({ name: newName.trim() });
      setNewName('');
      showMsg('success', 'Category created.');
      retry();
    } catch (err) {
      showMsg('error', err.data?.errors?.name?.[0] || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) {
      showMsg('error', 'Category name cannot be blank.');
      return;
    }
    setBusy(true);
    try {
      await updateAdminCategory(id, { name: editingName.trim() });
      setEditingId(null);
      showMsg('success', 'Category updated.');
      retry();
    } catch (err) {
      showMsg('error', err.data?.errors?.name?.[0] || err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setBusy(true);
    try {
      await deleteAdminCategory(cat.id);
      showMsg('success', `Category "${cat.name}" deleted.`);
      retry();
    } catch (err) {
      showMsg('error', err.message || 'Unable to delete category.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">
          Case-insensitive unique names. Deletion is blocked while products are assigned.
        </p>
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

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name (e.g., Accessories)"
          className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-slate-950 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </form>

      {loading ? (
        <LoadingState label="Loading categories..." />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Add your first category above." />
      ) : (
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              {editingId === cat.id ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-slate-950 focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleUpdate(cat.id)}
                    className="cursor-pointer rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{cat.name}</p>
                    <p className="text-xs text-slate-500">{cat.products_count ?? 0} assigned product(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-slate-950"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(cat)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
