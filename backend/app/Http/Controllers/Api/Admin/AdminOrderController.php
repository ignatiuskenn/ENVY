<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderStatusService;
use Illuminate\Http\JsonResponse;

class AdminOrderController extends Controller
{
    public function __construct(private readonly OrderStatusService $orderStatusService)
    {
    }

    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json(['data' => $order->load('items')]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        try {
            $next = OrderStatus::from($request->validated('status'));
            $updated = $this->orderStatusService->transitionStatus($order, $next);

            return response()->json(['data' => $updated]);
        } catch (InvalidOrderTransitionException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
