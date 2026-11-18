<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo-only admin credentials (unsuitable for production; documented in README)
        User::updateOrCreate(
            ['email' => 'admin@envy-demo.test'],
            [
                'name' => 'ENVY Demo Admin',
                'password' => Hash::make('EnvyDemo2026!'),
            ]
        );

        $tops = Category::firstOrCreate(['name' => 'Tops & Outerwear']);
        $bottoms = Category::firstOrCreate(['name' => 'Bottoms']);
        $gear = Category::firstOrCreate(['name' => 'Footwear & Gear']);

        $products = [
            // Tops & Outerwear
            [
                'category_id' => $tops->id,
                'name' => 'ENVY Tech Fleece Hoodie',
                'description' => 'Midweight double-knit fleece hoodie engineered for cold-weather warmups and everyday street layering.',
                'price' => 2495.00,
                'stock_quantity' => 15,
                'image_url' => 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $tops->id,
                'name' => 'ENVY Aero Compression Tee',
                'description' => 'Breathable four-way stretch compression top with moisture-wicking mesh panels.',
                'price' => 895.50,
                'stock_quantity' => 25,
                'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $tops->id,
                'name' => 'ENVY Storm-Fit Windbreaker',
                'description' => 'Water-repellent ripstop shell with articulated sleeves and zippered utility pockets.',
                'price' => 3190.00,
                'stock_quantity' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $tops->id,
                'name' => 'ENVY Legacy Oversized Tee',
                'description' => 'Heavyweight 260gsm cotton jersey tee with tonal ENVY chest mark. (Out-of-stock demo item.)',
                'price' => 750.00,
                'stock_quantity' => 0,
                'image_url' => 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],

            // Bottoms
            [
                'category_id' => $bottoms->id,
                'name' => 'ENVY Tapered Cargo Joggers',
                'description' => 'Articulated tapered joggers with gusseted cargo pockets and elastic ankle cuffs.',
                'price' => 1850.00,
                'stock_quantity' => 12,
                'image_url' => 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $bottoms->id,
                'name' => 'ENVY 7-Inch Training Shorts',
                'description' => 'Lightweight woven training shorts with side-hem vents and secure zip pocket.',
                'price' => 995.00,
                'stock_quantity' => 20,
                'image_url' => 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $bottoms->id,
                'name' => 'ENVY Track Pant Pro',
                'description' => 'Streamlined warm-up track pants with ankle zips for quick on/off over trainers.',
                'price' => 1650.00,
                'stock_quantity' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],

            // Footwear & Gear
            [
                'category_id' => $gear->id,
                'name' => 'ENVY Stride Runner V2',
                'description' => 'Responsive dual-density foam road runner built for daily tempo sessions.',
                'price' => 4295.00,
                'stock_quantity' => 6,
                'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $gear->id,
                'name' => 'ENVY Utility Duffle Bag',
                'description' => '40L weather-resistant gym duffle with ventilated shoe compartment.',
                'price' => 1450.00,
                'stock_quantity' => 14,
                'image_url' => 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $gear->id,
                'name' => 'ENVY Crew Socks',
                'description' => 'Cushioned athletic crew socks with arch compression band.',
                'price' => 120.00,
                'stock_quantity' => 40,
                'image_url' => 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $gear->id,
                'name' => 'ENVY Performance Wristband',
                'description' => 'Absorbent knit sweatband for high-output court and track training.',
                'price' => 85.50,
                'stock_quantity' => 35,
                'image_url' => 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'category_id' => $gear->id,
                'name' => 'ENVY Prototype Knit Trainer',
                'description' => 'Unreleased knit trainer prototype. (Inactive product demo item.)',
                'price' => 3999.00,
                'stock_quantity' => 10,
                'image_url' => 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
                'is_active' => false,
            ],
        ];

        foreach ($products as $item) {
            Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                $item
            );
        }
    }
}
