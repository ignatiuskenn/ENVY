import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPeso } from '../../utils/money';

export function ProductCard({ product, onAddToCart }) {
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[#262E36] bg-[#171C21] transition hover:border-[#24FF6A]/65">
      <Link
        to={`/products/${product.id}`}
        className="relative aspect-[4/3] overflow-hidden bg-[#111518]"
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs uppercase text-[#8A99AD]">
            No Image
          </div>
        )}

        <span className="absolute left-3 top-3 rounded-xs bg-[#0B0E11]/90 px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider text-[#24FF6A] border border-[#24FF6A]/40">
          EV-{String(product.id).padStart(2, '0')}
        </span>

        {isOutOfStock && (
          <span className="absolute right-3 top-3 rounded-xs bg-red-600 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#8A99AD]">
            {product.category?.name || 'Apparel'}
          </span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              isOutOfStock ? 'text-red-400' : 'text-[#24FF6A]'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : `${product.stock_quantity} in stock`}
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="mt-1.5 text-base font-bold text-[#F3F6F8] hover:text-[#24FF6A]"
        >
          {product.name}
        </Link>

        <p className="mt-1 font-mono text-sm font-extrabold text-[#F3F6F8]">
          {formatPeso(product.price)}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 rounded-sm border border-[#262E36] bg-[#111518] px-3 py-2 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-[#F3F6F8] transition hover:border-[#24FF6A] hover:text-[#24FF6A]"
          >
            View Details
          </Link>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-sm bg-[#24FF6A] px-3 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-[#0B0E11] transition hover:bg-[#4dff88] disabled:cursor-not-allowed disabled:bg-[#262E36] disabled:text-[#8A99AD]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}
