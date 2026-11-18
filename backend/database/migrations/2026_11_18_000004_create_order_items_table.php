<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->string('product_name_snapshot');
            $table->decimal('unit_price_snapshot', 10, 2);
            $table->integer('quantity');
            $table->decimal('line_total', 10, 2);
            $table->timestamps();

            $table->index('order_id');
            $table->index('product_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive CHECK (quantity > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
