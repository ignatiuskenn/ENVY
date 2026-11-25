import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../../components/shared/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchProductById } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatPeso } from '../../utils/money';

gsap.registerPlugin(useGSAP);

export function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const detailContainerRef = useRef(null);

  const [qtyState, setQtyState] = useState({ id, value: 1 });
  const [feedback, setFeedback] = useState('');

  const quantity = qtyState.id === id ? qtyState.value : 1;
  const setQuantity = (updater) => {
    setQtyState((prev) => {
      const current = prev.id === id ? prev.value : 1;
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { id, value: next };
    });
  };

  const { data, loading, error, status, retry } = useAsyncData(
    () => fetchProductById(id),
    [id]
  );

  const product = data?.data || null;
  const related = data?.related || [];

  useGSAP(
    () => {
      if (!product) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      gsap.from('[data-detail-garment]', {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.55,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
      gsap.from('[data-detail-info]', {
        opacity: 0,
        x: 18,
        duration: 0.5,
        delay: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    },
    { scope: detailContainerRef, dependencies: [product?.id] }
  );

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
              className="rounded-sm bg-[#24FF6A] px-5 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] hover:bg-[#4dff88]"
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
    <div ref={detailContainerRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD] hover:text-[#24FF6A]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div
          data-detail-garment
          className="kalle-studio-grid relative overflow-hidden rounded-lg border border-[#262E36] p-8"
        >
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square w-full object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.72)]"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center font-mono text-sm text-[#8A99AD]">
              No Image
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-xs border border-[#24FF6A]/40 bg-[#0B0E11]/90 px-2.5 py-1 font-mono text-xs font-black text-[#24FF6A]">
            EV-{String(product.id).padStart(2, '0')}
          </span>
        </div>

        <div data-detail-info className="flex flex-col">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD]">
            {product.category?.name || 'Apparel'}
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#F3F6F8]">
            {product.name}
          </h1>
          <p className="mt-3 font-mono text-2xl font-extrabold text-[#24FF6A]">
            {formatPeso(product.price)}
          </p>

          <div className="mt-3">
            {isOutOfStock ? (
              <span className="inline-block rounded-xs bg-red-600 px-3 py-1 font-mono text-xs font-bold uppercase text-white">
                Out of Stock
              </span>
            ) : (
              <span className="inline-block rounded-xs border border-[#24FF6A]/40 bg-[#24FF6A]/10 px-3 py-1 font-mono text-xs font-bold text-[#24FF6A]">
                {product.stock_quantity} available in stock
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[#8A99AD]">
            {product.description || 'No description provided.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-sm border border-[#262E36] bg-[#171C21]">
              <button
                type="button"
                disabled={isOutOfStock || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="cursor-pointer px-3 py-2.5 text-sm font-bold text-[#F3F6F8] disabled:opacity-40"
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
                className="w-14 border-x border-[#262E36] bg-[#111518] py-2.5 text-center font-mono text-sm font-semibold text-[#F3F6F8] focus:outline-none"
              />
              <button
                type="button"
                disabled={isOutOfStock || quantity >= product.stock_quantity}
                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                className="cursor-pointer px-3 py-2.5 text-sm font-bold text-[#F3F6F8] disabled:opacity-40"
              >
                +
              </button>
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => handleAdd(product, quantity)}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-sm bg-[#24FF6A] px-6 py-3 font-mono text-xs font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] active:scale-95 disabled:cursor-not-allowed disabled:bg-[#262E36] disabled:text-[#8A99AD]"
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {feedback && (
            <div className="mt-4 rounded-md border border-[#24FF6A]/50 bg-[#24FF6A]/10 px-4 py-3 font-mono text-xs font-semibold text-[#24FF6A]">
              {feedback}
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-[#262E36] pt-10">
          <h2 className="font-mono text-lg font-black uppercase tracking-wider text-[#F3F6F8]">
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
