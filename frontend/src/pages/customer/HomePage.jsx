import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/shared/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchCategories, fetchProducts } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useAsyncData } from '../../hooks/useAsyncData';

export function HomePage() {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState('');

  const { data, loading, error, retry } = useAsyncData(
    () => Promise.all([fetchCategories(), fetchProducts()]),
    []
  );

  const categories = data?.[0]?.data || [];
  const featured = (data?.[1]?.data || []).slice(0, 4);

  const handleAdd = (product) => {
    const res = addItem(product, 1);
    setFeedback(res.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="space-y-12 pb-16">
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <span className="inline-block rounded-full bg-lime-400 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-neutral-950">
              New Season Drop
            </span>
            <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              ENGINEERED TO MOVE WITH ENVY.
            </h1>
            <p className="mt-4 max-w-lg text-base text-neutral-300">
              Technical fleece, breathable compression tops, and road-ready footwear built for everyday training and street utility.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-lime-400 px-6 py-3 text-sm font-bold text-neutral-950 transition hover:bg-lime-300"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                View Cart
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1000&q=80"
              alt="ENVY Athletics Training Collection"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            {feedback}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-neutral-950">
              Shop by Category
            </h2>
            <Link to="/products" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
              View all →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm font-bold text-neutral-900 transition hover:border-neutral-950 hover:bg-white"
              >
                <span>{cat.name}</span>
                <ArrowRight className="h-4 w-4 text-neutral-500" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-neutral-950">
              Featured Gear
            </h2>
            <Link to="/products" className="text-sm font-semibold text-neutral-700 hover:text-neutral-950">
              Browse catalog →
            </Link>
          </div>

          <div className="mt-5">
            {loading ? (
              <LoadingState label="Loading featured ENVY gear..." />
            ) : error ? (
              <ErrorState message={error} onRetry={retry} />
            ) : featured.length === 0 ? (
              <EmptyState title="No products available" description="Check back soon for new ENVY drops." />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAdd} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
