import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPeso } from '../../utils/money';

export function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-md">
      <Link to={`/products/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-neutral-400">
            No Image
          </div>
        )}

        {isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {product.category?.name || 'Apparel'}
          </span>
          <span
            className={`text-xs font-medium ${
              isOutOfStock ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-1.5 text-base font-bold text-neutral-950 hover:underline"
        >
          {product.name}
        </Link>

        <p className="mt-1 text-base font-extrabold text-neutral-900">
          {formatPeso(product.price)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-center text-xs font-semibold text-neutral-800 transition hover:border-neutral-950"
          >
            View Details
          </Link>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-neutral-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
