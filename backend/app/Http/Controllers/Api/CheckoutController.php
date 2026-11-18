<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\CheckoutConflictException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(private readonly CheckoutService $checkoutService)
    {
    }

    public function store(CheckoutRequest $request): JsonResponse
    {
        try {
            $order = $this->checkoutService->placeOrder(
                $request->validated(),
                $request->user()?->id
            );

            return response()->json(['data' => $order], 201);
        } catch (CheckoutConflictException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'changes' => $e->changes,
            ], 409);
        }
    }
}
