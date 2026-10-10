<?php

namespace Database\Seeders;

use App\Models\Atributo;
use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Producto;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Datos reales para producción (sin datos de prueba). Se puede correr varias
 * veces: no duplica lo que ya existe.
 *
 *   php artisan db:seed --class=ProduccionSeeder --force
 *
 * - Admin: toma ADMIN_NOMBRE, ADMIN_EMAIL y ADMIN_PASSWORD del .env.
 * - Productos: lee database/seeders/data/productos.json (ver productos.example.json).
 *   Cada foto es un archivo dentro de public/images/productos/.
 */
class ProduccionSeeder extends Seeder
{
    public function run(): void
    {
        $this->crearAdmin();

        foreach (['Collares', 'Anillos', 'Pulseras', 'Pendientes', 'Conjuntos'] as $orden => $nombre) {
            Categoria::firstOrCreate(['categoria' => $nombre, 'parent_id' => null], ['orden' => $orden]);
        }

        $color = $this->atributo('Color', 'color', 1);
        foreach ([['Dorado', '#C9A46A'], ['Plateado', '#C0C0C0'], ['Oro rosa', '#B76E79']] as $orden => [$valor, $hex]) {
            $color->valores()->firstOrCreate(['valor' => $valor], ['cod_hex' => $hex, 'orden' => $orden]);
        }
        $talla = $this->atributo('Talla', 'texto', 2);
        foreach (['Única', '14', '15', '16', '17', '18'] as $orden => $valor) {
            $talla->valores()->firstOrCreate(['valor' => $valor], ['orden' => $orden]);
        }

        $this->crearProductos();
    }

    private function crearAdmin(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password) {
            $this->command->warn('Sin ADMIN_EMAIL / ADMIN_PASSWORD en el .env: no se creó el admin.');
            return;
        }

        Cliente::updateOrCreate(['email' => $email], [
            'nombre' => env('ADMIN_NOMBRE', 'Admin'),
            'telefono' => env('ADMIN_TELEFONO', ''),
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);
        $this->command->info("Admin listo: {$email}");
    }

    private function atributo(string $nombre, string $tipo, int $orden): Atributo
    {
        return Atributo::firstOrCreate(['nombre' => $nombre], ['tipo' => $tipo, 'orden' => $orden, 'filtrable' => true]);
    }

    private function crearProductos(): void
    {
        $archivo = database_path('seeders/data/productos.json');
        if (! file_exists($archivo)) {
            $this->command->warn('No existe database/seeders/data/productos.json: no se crearon productos.');
            return;
        }

        $productos = json_decode(file_get_contents($archivo), true, flags: JSON_THROW_ON_ERROR);

        foreach ($productos as $p) {
            $categoria = Categoria::firstOrCreate(['categoria' => $p['categoria'], 'parent_id' => null]);
            if (! empty($p['subcategoria'])) {
                $categoria = Categoria::firstOrCreate(['categoria' => $p['subcategoria'], 'parent_id' => $categoria->id]);
            }

            $producto = Producto::firstOrCreate(['nombre' => $p['nombre']], [
                'id_categoria' => $categoria->id,
                'descripcion' => $p['descripcion'] ?? null,
                'meta_titulo' => $p['meta_titulo'] ?? null,
                'meta_descripcion' => $p['meta_descripcion'] ?? null,
            ]);

            // Ya existía: se deja como está para no duplicar variantes.
            if (! $producto->wasRecentlyCreated) {
                continue;
            }

            DB::transaction(function () use ($producto, $p) {
                $tagIds = collect($p['tags'] ?? [])
                    ->map(fn ($t) => Tag::firstOrCreate(['descripcion' => $t])->id);
                $producto->tags()->sync($tagIds);

                foreach ($p['variantes'] as $v) {
                    $variante = $producto->variantes()->create([
                        'sku' => $v['sku'] ?? null,
                        'precio' => $v['precio'],
                        'stock' => $v['stock'] ?? 0,
                    ]);

                    $variante->valores()->sync($this->valores($v));

                    $fotos = $v['fotos'] ?? (isset($v['foto']) ? [$v['foto']] : []);
                    $variante->guardarImagenes(collect($fotos)->map(fn ($foto) => [
                        'url' => str_starts_with($foto, 'http') || str_starts_with($foto, '/') ? $foto : '/images/productos/'.$foto,
                        'alt' => $producto->nombre,
                    ])->all());
                }
            });

            $this->command->info("Producto creado: {$p['nombre']}");
        }
    }

    /**
     * Attribute values of a variant. New format: "atributos": {"Color": "Dorado", "Talla": "16"}
     * (a color can be {"valor": "Oro rosa", "hex": "#B76E79"}). Old format: "talla", "color", "hex".
     */
    private function valores(array $v): array
    {
        $atributos = $v['atributos'] ?? array_filter([
            'Talla' => $v['talla'] ?? null,
            'Color' => isset($v['color']) ? ['valor' => $v['color'], 'hex' => $v['hex'] ?? null] : null,
        ]);

        $ids = [];
        foreach ($atributos as $nombre => $valor) {
            $hex = is_array($valor) ? ($valor['hex'] ?? null) : null;
            $texto = trim((string) (is_array($valor) ? $valor['valor'] : $valor));
            if ($texto === '') {
                continue;
            }

            $atributo = $this->atributo($nombre, $hex || strcasecmp($nombre, 'Color') === 0 ? 'color' : 'texto', 0);
            $ids[] = $atributo->valores()->firstOrCreate(['valor' => $texto], ['cod_hex' => $hex ?? ($atributo->tipo === 'color' ? '#C9A46A' : null)])->id;
        }

        return $ids;
    }
}
