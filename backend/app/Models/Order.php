<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'customer_name',
        'customer_email',
        'customer_contact',
        'delivery_address',
        'payment_method',
        'order_notes',
        'status',
        'subtotal',
        'total',
        'stock_restored',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'stock_restored' => 'boolean',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
