<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Cliente;
use App\Models\Color;
use App\Models\Producto;
use App\Models\Tag;
use App\Models\Talla;
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
 *   Cada "foto" es un archivo dentro de public/images/productos/.
 */
class ProduccionSeeder extends Seeder
{
    public function run(): void
    {
        $this->crearAdmin();

        foreach (['Collares', 'Anillos', 'Pulseras', 'Pendientes', 'Conjuntos'] as $nombre) {
            Categoria::firstOrCreate(['categoria' => $nombre]);
        }
        foreach (['Única', '14', '15', '16', '17', '18'] as $talla) {
            Talla::firstOrCreate(['talla' => $talla]);
        }
        foreach ([['Dorado', '#C9A46A'], ['Plateado', '#C0C0C0'], ['Oro rosa', '#B76E79']] as [$color, $hex]) {
            Color::firstOrCreate(['color' => $color], ['cod_hex' => $hex, 'tipo' => 'Base']);
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

    private function crearProductos(): void
    {
        $archivo = database_path('seeders/data/productos.json');
        if (! file_exists($archivo)) {
            $this->command->warn('No existe database/seeders/data/productos.json: no se crearon productos.');
            return;
        }

        $productos = json_decode(file_get_contents($archivo), true, flags: JSON_THROW_ON_ERROR);

        foreach ($productos as $p) {
            $categoria = Categoria::firstOrCreate(['categoria' => $p['categoria']]);
            $producto = Producto::firstOrCreate(['nombre' => $p['nombre']], ['id_categoria' => $categoria->id]);

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
                        'id_talla' => Talla::firstOrCreate(['talla' => (string) ($v['talla'] ?? 'Única')])->id,
                        'precio' => $v['precio'],
                        'stock' => $v['stock'] ?? 0,
                        'url_foto' => isset($v['foto']) ? '/images/productos/'.$v['foto'] : null,
                    ]);

                    if (! empty($v['color'])) {
                        $color = Color::firstOrCreate(['color' => $v['color']], ['cod_hex' => $v['hex'] ?? '#C9A46A', 'tipo' => 'Base']);
                        $variante->colores()->sync([$color->id]);
                    }
                }
            });

            $this->command->info("Producto creado: {$p['nombre']}");
        }
    }
}
