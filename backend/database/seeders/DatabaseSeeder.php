<?php

namespace Database\Seeders;

use App\Enums\UserRole;
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
        // Demo-only admin & customer credentials (unsuitable for production; documented in README)
        User::updateOrCreate(
            ['email' => 'admin@envy-demo.test'],
            [
                'name' => 'ENVY Demo Admin',
                'password' => Hash::make('EnvyDemo2026!'),
                'role' => UserRole::Admin,
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@envy-demo.test'],
            [
                'name' => 'ENVY Demo Customer',
                'password' => Hash::make('EnvyCustomer2026!'),
                'role' => UserRole::Customer,
            ]
        );

        $jackets = Category::firstOrCreate(['name' => 'Gorpcore Jackets']);
        $tees = Category::firstOrCreate(['name' => 'Y2K T-Shirts']);
        $pants = Category::firstOrCreate(['name' => 'Streetwear Pants']);

        $products = [
            // Gorpcore Jackets
            [
                'category_id' => $jackets->id,
                'name' => 'ENVY Liquid Chrome Puffer',
                'description' => 'Cropped Y2K metallic-foil gorpcore puffer with high storm collar and waterproof center zip.',
                'price' => 3895.00,
                'stock_quantity' => 10,
                'image_url' => '/garments/gorp-metallic-puffer.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $jackets->id,
                'name' => 'ENVY Arc-3L Technical Shell',
                'description' => 'Three-layer seam-sealed gorpcore hardshell jacket with dual bellow chest pockets and storm hood.',
                'price' => 4295.00,
                'stock_quantity' => 8,
                'image_url' => '/garments/gorp-arc-shell.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $jackets->id,
                'name' => 'ENVY Volt Trail Anorak',
                'description' => 'High-visibility signal-lime and matte-black contrast gorpcore shell built for wet ridge runs.',
                'price' => 3490.00,
                'stock_quantity' => 12,
                'image_url' => '/garments/gorp-volt-anorak.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $jackets->id,
                'name' => 'ENVY Tactical Utility Jacket',
                'description' => 'Modular slate-charcoal gorpcore field shell featuring four bellow cargo pouches and molle webbing.',
                'price' => 3150.00,
                'stock_quantity' => 9,
                'image_url' => '/garments/gorp-tactical-vest.svg',
                'is_active' => true,
            ],

            // Y2K T-Shirts
            [
                'category_id' => $tees->id,
                'name' => 'ENVY Cyber Y2K Raglan Tee',
                'description' => 'Boxy Y2K drop-shoulder raglan tee with contrast sleeves and neon cyber-pixel chest mark.',
                'price' => 895.50,
                'stock_quantity' => 25,
                'image_url' => '/garments/y2k-cyber-raglan.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $tees->id,
                'name' => 'ENVY Acid-Wash Boxy Tee',
                'description' => 'Heavyweight washed-graphite Y2K tee with distressed geometric starburst print.',
                'price' => 120.00,
                'stock_quantity' => 40,
                'image_url' => '/garments/y2k-acid-boxy.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $tees->id,
                'name' => 'ENVY Tribal Mesh Jersey Tee',
                'description' => 'Breathable Y2K v-neck mesh street jersey with signal-green piping and 03 numeral print.',
                'price' => 85.50,
                'stock_quantity' => 35,
                'image_url' => '/garments/y2k-mesh-jersey.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $tees->id,
                'name' => 'ENVY Legacy Y2K Graphic Tee',
                'description' => 'Cropped Y2K ribbed tee with metallic chrome oval emblem. (Out-of-stock demo item.)',
                'price' => 750.00,
                'stock_quantity' => 0,
                'image_url' => '/garments/y2k-legacy-tee.svg',
                'is_active' => true,
            ],

            // Streetwear Pants
            [
                'category_id' => $pants->id,
                'name' => 'ENVY Parachute Cargo Pants',
                'description' => 'Wide-leg crinkle nylon parachute pants with gusseted cargo pockets and neon ankle drawcords.',
                'price' => 1950.00,
                'stock_quantity' => 14,
                'image_url' => '/garments/street-parachute-cargo.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $pants->id,
                'name' => 'ENVY Baggy Carpenter Denim',
                'description' => 'Oversized raw-charcoal streetwear carpenter jeans with double-knee panels and utility loop.',
                'price' => 2250.00,
                'stock_quantity' => 11,
                'image_url' => '/garments/street-carpenter-denim.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $pants->id,
                'name' => 'ENVY Ripstop Tech Track Pants',
                'description' => 'Straight-wide ripstop track pants with articulated knees, neon side piping, and ankle zips.',
                'price' => 1650.00,
                'stock_quantity' => 16,
                'image_url' => '/garments/street-ripstop-track.svg',
                'is_active' => true,
            ],
            [
                'category_id' => $pants->id,
                'name' => 'ENVY Prototype Exo-Shell Pant',
                'description' => 'Unreleased experimental gorpcore cargo pant. (Inactive product demo item.)',
                'price' => 3999.00,
                'stock_quantity' => 10,
                'image_url' => '/garments/street-exo-pant.svg',
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
