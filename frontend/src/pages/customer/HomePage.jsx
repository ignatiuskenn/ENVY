import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/shared/ProductCard';
import { SpatialGarmentRack } from '../../components/shared/SpatialGarmentRack';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/StateFeedback';
import { fetchCategories, fetchProducts } from '../../data/api/storefront.api';
import { useCart } from '../../data/context/useCart';
import { useAsyncData } from '../../hooks/useAsyncData';

export function HomePage() {
  const { addItem } = useCart();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data, loading, error, retry } = useAsyncData(
    () => Promise.all([fetchCategories(), fetchProducts()]),
    []
  );

  const categories = data?.[0]?.data || [];
  const allProducts = data?.[1]?.data || [];
  const featured = allProducts.slice(0, 4);

  const handleAdd = (product) => {
    const res = addItem(product, 1);
    setFeedback(res.message);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="space-y-12 pb-16">
      {loading ? (
        <div className="kalle-studio-grid flex h-[560px] items-center justify-center border-b border-[#262E36] sm:h-[640px]">
          <LoadingState label="Initializing 3D spatial rack..." />
        </div>
      ) : error ? (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={retry} />
        </div>
      ) : allProducts.length > 0 ? (
        <SpatialGarmentRack
          products={allProducts}
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={setActiveCategoryId}
          onAddToCart={handleAdd}
        />
      ) : null}

      <div id="catalog-grid" className="mx-auto max-w-7xl space-y-12 px-4 sm:px-6 lg:px-8">
        {feedback && (
          <div className="rounded-md border border-[#24FF6A]/50 bg-[#24FF6A]/10 px-4 py-3 font-mono text-xs font-semibold text-[#24FF6A]">
            {feedback}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-lg font-black uppercase tracking-wider text-[#F3F6F8]">
              Shop by Category
            </h2>
            <Link
              to="/products"
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD] hover:text-[#24FF6A]"
            >
              View all →
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="flex items-center justify-between rounded-md border border-[#262E36] bg-[#171C21] px-5 py-4 font-mono text-xs font-bold uppercase tracking-wider text-[#F3F6F8] transition hover:border-[#24FF6A] hover:text-[#24FF6A]"
              >
                <span>{cat.name}</span>
                <ArrowRight className="h-4 w-4 text-[#24FF6A]" />
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-lg font-black uppercase tracking-wider text-[#F3F6F8]">
              Featured Gear
            </h2>
            <Link
              to="/products"
              className="font-mono text-xs font-bold uppercase tracking-wider text-[#8A99AD] hover:text-[#24FF6A]"
            >
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
