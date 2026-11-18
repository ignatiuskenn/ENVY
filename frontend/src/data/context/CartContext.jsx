import { useEffect, useMemo, useState } from 'react';
import { CART_STORAGE_KEY } from '../../constants/config';
import { calculateCartTotals } from '../../utils/money';
import { CartContext } from './useCart';

function loadStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota errors
    }
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Math.trunc(Number(quantity) || 1));
    if (!product?.is_active || product.stock_quantity < 1) {
      return { ok: false, message: 'This item is currently unavailable.' };
    }

    let result = { ok: true, message: `${product.name} added to cart.` };

    setItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        const nextQty = existing.quantity + qtyToAdd;
        if (nextQty > product.stock_quantity) {
          result = {
            ok: false,
            message: `Only ${product.stock_quantity} unit(s) of ${product.name} available.`,
          };
          return prev;
        }
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                name: product.name,
                price: Number(product.price),
                stock_quantity: product.stock_quantity,
                image_url: product.image_url,
                quantity: nextQty,
              }
            : item
        );
      }

      if (qtyToAdd > product.stock_quantity) {
        result = {
          ok: false,
          message: `Only ${product.stock_quantity} unit(s) of ${product.name} available.`,
        };
        return prev;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          price: Number(product.price),
          stock_quantity: product.stock_quantity,
          image_url: product.image_url,
          quantity: qtyToAdd,
        },
      ];
    });

    return result;
  };

  const updateQuantity = (productId, nextQty) => {
    const parsed = Math.trunc(Number(nextQty));
    if (!Number.isFinite(parsed) || parsed < 1) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.product_id !== productId) return item;
        const clamped = Math.min(parsed, item.stock_quantity);
        return { ...item, quantity: clamped };
      })
    );
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const syncWithLatestProducts = (latestProducts) => {
    const byId = new Map(latestProducts.map((p) => [p.id, p]));
    setItems((prev) =>
      prev
        .map((item) => {
          const fresh = byId.get(item.product_id);
          if (!fresh || !fresh.is_active || fresh.stock_quantity < 1) {
            return null;
          }
          return {
            ...item,
            name: fresh.name,
            price: Number(fresh.price),
            stock_quantity: fresh.stock_quantity,
            image_url: fresh.image_url,
            quantity: Math.min(item.quantity, fresh.stock_quantity),
          };
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => calculateCartTotals(items), [items]);
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: totals.subtotal,
        total: totals.total,
        addItem,
        updateQuantity,
        removeItem,
        syncWithLatestProducts,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
