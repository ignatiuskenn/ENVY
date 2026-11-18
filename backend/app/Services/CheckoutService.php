<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\CheckoutConflictException;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService
{
    /**
     * Atomically verify live prices/stock, create order + snapshots, and deduct stock.
     *
     * @param  array<string, mixed>  $payload
     */
    public function placeOrder(array $payload, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($payload, $userId): Order {
            $requestedItems = collect($payload['items']);
            $productIds = $requestedItems->pluck('product_id')->all();

            $products = Product::query()
                ->whereIn('id', $productIds)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $changes = [];
            $linePlans = [];
            $subtotalCents = 0;

            foreach ($requestedItems as $item) {
                $product = $products->get($item['product_id']);
                $qty = (int) $item['quantity'];

                if (! $product || ! $product->is_active) {
                    $changes[] = [
                        'product_id' => $item['product_id'],
                        'reason' => 'unavailable',
                        'message' => ($product?->name ?? 'Product') . ' is no longer available.',
                    ];
                    continue;
                }

                $liveCents = (int) round(((float) $product->price) * 100);
                $expectedCents = (int) round(((float) $item['expected_unit_price']) * 100);

                if ($liveCents !== $expectedCents) {
                    $changes[] = [
                        'product_id' => $product->id,
                        'reason' => 'price_changed',
                        'live_price' => number_format($liveCents / 100, 2, '.', ''),
                        'message' => "{$product->name} price updated to PHP " . number_format($liveCents / 100, 2) . '.',
                    ];
                }

                if ($product->stock_quantity < $qty) {
                    $changes[] = [
                        'product_id' => $product->id,
                        'reason' => 'insufficient_stock',
                        'available_stock' => $product->stock_quantity,
                        'message' => $product->stock_quantity === 0
                            ? "{$product->name} is now out of stock."
                            : "{$product->name} only has {$product->stock_quantity} left in stock.",
                    ];
                }

                $lineCents = $liveCents * $qty;
                $subtotalCents += $lineCents;

                $linePlans[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => number_format($liveCents / 100, 2, '.', ''),
                    'line_total' => number_format($lineCents / 100, 2, '.', ''),
                ];
            }

            if ($changes !== []) {
                throw new CheckoutConflictException(
                    'Some items in your cart changed in price or availability. Please review before placing your order.',
                    $changes
                );
            }

            $formattedTotal = number_format($subtotalCents / 100, 2, '.', '');

            $order = Order::create([
                'user_id' => $userId,
                'order_number' => $this->generateOrderNumber(),
                'customer_name' => $payload['customer_name'],
                'customer_email' => strtolower(trim($payload['customer_email'])),
                'customer_contact' => $payload['customer_contact'],
                'delivery_address' => $payload['delivery_address'],
                'payment_method' => $payload['payment_method'],
                'order_notes' => $payload['order_notes'] ?? null,
                'status' => OrderStatus::Pending,
                'subtotal' => $formattedTotal,
                'total' => $formattedTotal,
                'stock_restored' => false,
            ]);

            foreach ($linePlans as $plan) {
                /** @var Product $product */
                $product = $plan['product'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name_snapshot' => $product->name,
                    'unit_price_snapshot' => $plan['unit_price'],
                    'quantity' => $plan['quantity'],
                    'line_total' => $plan['line_total'],
                ]);

                $product->decrement('stock_quantity', $plan['quantity']);
            }

            return $order->load('items');
        });
    }

    private function generateOrderNumber(): string
    {
        return 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }
}
