<?php

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (): JsonResponse {
    DB::connection()->getPdo();

    return response()->json([
        'status' => 'ok',
        'service' => 'ENVY API',
        'database' => DB::connection()->getDatabaseName(),
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
