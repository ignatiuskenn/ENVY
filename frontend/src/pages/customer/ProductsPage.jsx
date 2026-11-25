import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/shared/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchCategories, fetchProducts } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useAsyncData } from '../../hooks/useAsyncData';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [categories, setCategories] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  const { data, loading, error, retry } = useAsyncData(
    () => fetchProducts({ q, categoryId, sort }),
    [q, categoryId, sort]
  );

  const products = data?.data || [];

  const updateFilter = (nextQ, nextCategory, nextSort) => {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextCategory) params.set('category_id', nextCategory);
    if (nextSort) params.set('sort', nextSort);
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setQ('');
    setCategoryId('');
    setSort('');
    setSearchParams({}, { replace: true });
  };

  const handleAdd = (product) => {
    const res = addItem(product, 1);
    setFeedback(res.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-mono text-2xl font-black uppercase tracking-wider text-[#F3F6F8] sm:text-3xl">
            All Products
          </h1>
          <p className="mt-1 text-sm text-[#8A99AD]">
            Search, filter by category, and sort by price.
          </p>
        </div>
        {!loading && !error && (
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#24FF6A]">
            {products.length} item(s)
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-3 rounded-lg border border-[#262E36] bg-[#171C21] p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              updateFilter(e.target.value, categoryId, sort);
            }}
            placeholder="Search products by name..."
            className="w-full rounded-sm border border-[#262E36] bg-[#111518] py-2 pl-9 pr-3 text-sm text-[#F3F6F8] placeholder-[#8A99AD] focus:border-[#24FF6A] focus:outline-none"
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            updateFilter(q, e.target.value, sort);
          }}
          aria-label="Filter by category"
          className="w-full rounded-sm border border-[#262E36] bg-[#111518] px-3 py-2 text-sm text-[#F3F6F8] focus:border-[#24FF6A] focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            updateFilter(q, categoryId, e.target.value);
          }}
          aria-label="Sort by price"
          className="w-full rounded-sm border border-[#262E36] bg-[#111518] px-3 py-2 text-sm text-[#F3F6F8] focus:border-[#24FF6A] focus:outline-none"
        >
          <option value="">Sort: Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {feedback && (
        <div className="mt-4 rounded-md border border-[#24FF6A]/50 bg-[#24FF6A]/10 px-4 py-3 font-mono text-xs font-semibold text-[#24FF6A]">
          {feedback}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <LoadingState label="Loading ENVY catalog..." />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : products.length === 0 ? (
          <EmptyState
            title="No matching products"
            description="Try clearing your search or choosing another category."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="cursor-pointer rounded-sm bg-[#24FF6A] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAdd} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
