<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\OverviewService;
use Illuminate\Http\JsonResponse;

class AdminOverviewController extends Controller
{
    public function __construct(private readonly OverviewService $overviewService)
    {
    }

    public function overview(): JsonResponse
    {
        return response()->json(['data' => $this->overviewService->getSummary()]);
    }

    public function customers(): JsonResponse
    {
        return response()->json(['data' => $this->overviewService->getCustomerSummaries()]);
    }
}
