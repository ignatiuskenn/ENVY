<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Product;

class OverviewService
{
    /**
     * Compute the 5 CubeTech dashboard summary KPIs.
     *
     * @return array<string, mixed>
     */
    public function getSummary(): array
    {
        $totalProducts = Product::query()->count();
        $totalOrders = Order::query()->count();
        $pendingOrders = Order::query()->where('status', OrderStatus::Pending->value)->count();
        $completedOrders = Order::query()->where('status', OrderStatus::Completed->value)->count();

        $totalCustomers = Order::query()
            ->selectRaw('LOWER(TRIM(customer_email)) as normalized_email')
            ->distinct()
            ->get()
            ->count();

        $totalSalesCents = (int) round(
            ((float) Order::query()
                ->where('status', OrderStatus::Completed->value)
                ->sum('total')) * 100
        );

        return [
            'total_products' => $totalProducts,
            'total_orders' => $totalOrders,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders,
            'total_customers' => $totalCustomers,
            'total_sales' => number_format($totalSalesCents / 100, 2, '.', ''),
        ];
    }

    /**
     * Derive read-only customer summaries from saved orders.
     *
     * @return list<array<string, mixed>>
     */
    public function getCustomerSummaries(): array
    {
        $orders = Order::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get(['customer_name', 'customer_email', 'customer_contact', 'status', 'total', 'created_at']);

        $grouped = [];

        foreach ($orders as $order) {
            $email = strtolower(trim($order->customer_email));

            if (! isset($grouped[$email])) {
                $grouped[$email] = [
                    'email' => $email,
                    'name' => $order->customer_name,
                    'contact' => $order->customer_contact,
                    'order_count' => 0,
                    'completed_cents' => 0,
                    'last_order_at' => $order->created_at?->toISOString(),
                ];
            }

            $grouped[$email]['order_count'] += 1;

            if ($order->status === OrderStatus::Completed) {
                $grouped[$email]['completed_cents'] += (int) round(((float) $order->total) * 100);
            }
        }

        return array_values(array_map(function (array $entry): array {
            return [
                'email' => $entry['email'],
                'name' => $entry['name'],
                'contact' => $entry['contact'],
                'order_count' => $entry['order_count'],
                'completed_total' => number_format($entry['completed_cents'] / 100, 2, '.', ''),
                'last_order_at' => $entry['last_order_at'],
            ];
        }, $grouped));
    }
}
