<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Hash;
use App\Models\Categoria;
use App\Models\Color;
use App\Models\Talla;
use App\Models\Tag;
use App\Models\Producto;
use App\Models\Variante;
use App\Models\Cliente;
use App\Models\Proveedor;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $categorias = Categoria::factory(4)->create();
        $tallas = Talla::factory(5)->create();
        $colores = Color::factory(7)->create();
        $tags = Tag::factory(5)->create();
        
        Cliente::factory(20)->create();
        Cliente::create([
            'nombre' => 'Admin',
            'telefono' => '70128493',
            'email' => 'admin@tujoyeria.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        Proveedor::factory(5)->create();
        Producto::factory(35)
            ->recycle($categorias)
            ->create()
            ->each(function ($producto) use ($tallas, $colores, $tags){
                $producto->tags()->attach($tags->random(rand(1,3)));

                Variante::factory(rand(2,3))
                    ->create([
                        'id_producto' => $producto->id,
                        'id_talla' => $tallas->random()->id
                    ])
                    ->each( function ($variante) use ($colores){
                        $variante->colores()->attach($colores->random()->id);
                    });
                });
    }
}
