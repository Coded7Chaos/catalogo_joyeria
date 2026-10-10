<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Hash;
use App\Models\Categoria;
use App\Models\Atributo;
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
        // Two subcategories under each category (the same name can repeat under different parents).
        $subcategorias = $categorias->flatMap(fn ($c) => collect(['Clásicos', 'Minimalistas'])->map(
            fn ($nombre, $i) => Categoria::create(['categoria' => $nombre, 'parent_id' => $c->id, 'orden' => $i])
        ));
        $tags = Tag::factory(5)->create();

        $color = Atributo::create(['nombre' => 'Color', 'tipo' => 'color', 'orden' => 1]);
        $colores = collect([['Dorado', '#C9A46A'], ['Plateado', '#C0C0C0'], ['Oro rosa', '#B76E79'], ['Negro', '#1B1214'], ['Perla', '#F3EEE6']])
            ->map(fn ($c, $i) => $color->valores()->create(['valor' => $c[0], 'cod_hex' => $c[1], 'orden' => $i]));
        $talla = Atributo::create(['nombre' => 'Talla', 'tipo' => 'texto', 'orden' => 2]);
        $tallas = collect(['14', '15', '16', '17', '18'])->map(fn ($t, $i) => $talla->valores()->create(['valor' => $t, 'orden' => $i]));
        $material = Atributo::create(['nombre' => 'Material', 'tipo' => 'texto', 'orden' => 3]);
        $materiales = collect(['Plata 925', 'Oro laminado 18k', 'Acero quirúrgico'])->map(fn ($m, $i) => $material->valores()->create(['valor' => $m, 'orden' => $i]));

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
            ->recycle($categorias->merge($subcategorias))
            ->create()
            ->each(function ($producto) use ($tags, $colores, $tallas, $materiales) {
                $producto->tags()->attach($tags->random(rand(1, 3)));

                Variante::factory(rand(2, 3))
                    ->create(['id_producto' => $producto->id])
                    ->each(function ($variante) use ($colores, $tallas, $materiales) {
                        $variante->valores()->attach([$colores->random()->id, $tallas->random()->id, $materiales->random()->id]);
                        $variante->guardarImagenes(collect(range(1, rand(1, 3)))->map(fn ($n) => [
                            'url' => "https://via.placeholder.com/600x750.png/efd2cb/53131e?text=Foto+{$n}",
                        ])->all());
                    });
            });
    }
}
