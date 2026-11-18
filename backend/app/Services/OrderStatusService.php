<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderStatusService
{
    public function transitionStatus(Order $order, OrderStatus $nextStatus): Order
    {
        return DB::transaction(function () use ($order, $nextStatus): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->with('items')
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $lockedOrder->status->canTransitionTo($nextStatus)) {
                throw new InvalidOrderTransitionException(
                    "Cannot transition order from {$lockedOrder->status->value} to {$nextStatus->value}."
                );
            }

            if ($nextStatus === OrderStatus::Cancelled && ! $lockedOrder->stock_restored) {
                $productIds = $lockedOrder->items->pluck('product_id')->unique()->all();
                $products = Product::query()
                    ->whereIn('id', $productIds)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get()
                    ->keyBy('id');

                foreach ($lockedOrder->items as $item) {
                    if ($product = $products->get($item->product_id)) {
                        $product->increment('stock_quantity', $item->quantity);
                    }
                }

                $lockedOrder->stock_restored = true;
            }

            $lockedOrder->status = $nextStatus;
            $lockedOrder->save();

            return $lockedOrder->fresh(['items']);
        });
    }
}
