import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../../components/shared/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchProductById } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');

  const { data, loading, error, status, retry } = useAsyncData(
    () => fetchProductById(id),
    [id]
  );

  const product = data?.data || null;
  const related = data?.related || [];

  const handleAdd = (item, qty = 1) => {
    const res = addItem(item, qty);
    setFeedback(res.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Loading product details..." />
      </div>
    );
  }

  if (status === 404) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="Product unavailable"
          description="This item does not exist or is no longer active."
          action={
            <Link
              to="/products"
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Back to Shop
            </Link>
          }
        />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState message={error} onRetry={retry} />
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-neutral-400">
              No Image
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {product.category?.name || 'Apparel'}
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-extrabold text-neutral-900">
            {formatPeso(product.price)}
          </p>

          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Out of Stock
              </span>
            ) : (
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                {product.stock_quantity} available in stock
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-neutral-700">
            {product.description || 'No description provided.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-neutral-300">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-sm font-bold text-neutral-700 disabled:opacity-40"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock_quantity)}
                disabled={isOutOfStock}
                value={quantity}
                onChange={(e) => {
                  const val = Math.trunc(Number(e.target.value));
                  if (Number.isFinite(val) && val >= 1) {
                    setQuantity(Math.min(val, product.stock_quantity));
                  }
                }}
                aria-label="Quantity"
                className="w-14 border-x border-neutral-300 py-2 text-center text-sm font-semibold focus:outline-none"
              />
              <button
                type="button"
                disabled={isOutOfStock || quantity >= product.stock_quantity}
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                className="px-3 py-2 text-sm font-bold text-neutral-700 disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => handleAdd(product, quantity)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {feedback && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              {feedback}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-neutral-200 pt-10">
          <h2 className="text-xl font-black tracking-tight text-neutral-950">
            Related in {product.category?.name}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onAddToCart={(p) => handleAdd(p, 1)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
