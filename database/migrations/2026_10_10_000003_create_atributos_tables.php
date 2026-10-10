<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Atributos libres para las variantes (Talla, Color, Material, Capacidad…), cada
 * uno con sus valores. Reemplaza a las tablas fijas de tallas y colores: sus datos
 * se copian a los atributos "Talla" y "Color" y luego esas tablas se eliminan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('atributos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80)->unique();
            $table->string('slug', 100)->unique();
            $table->string('tipo', 20)->default('texto'); // texto | color
            $table->boolean('filtrable')->default(true);
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('atributo_valores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_atributo')->constrained('atributos')->cascadeOnDelete();
            $table->string('valor', 80);
            $table->string('cod_hex', 20)->nullable();
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
            $table->unique(['id_atributo', 'valor']);
        });

        Schema::create('variante_atributo_valor', function (Blueprint $table) {
            $table->foreignId('id_variante')->constrained('variantes')->cascadeOnDelete();
            $table->foreignId('id_valor')->constrained('atributo_valores')->cascadeOnDelete();
            $table->primary(['id_variante', 'id_valor']);
        });

        $this->copiarTallas();
        $this->copiarColores();

        Schema::dropIfExists('variante_color');
        Schema::table('variantes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_talla');
        });
        Schema::dropIfExists('tallas');
        Schema::dropIfExists('colors');
    }

    public function down(): void
    {
        Schema::create('tallas', function (Blueprint $table) {
            $table->id();
            $table->string('talla', 50);
            $table->timestamps();
        });
        Schema::create('colors', function (Blueprint $table) {
            $table->id();
            $table->string('color', 50);
            $table->string('cod_hex', 50)->nullable();
            $table->string('tipo', 50);
            $table->timestamps();
        });
        Schema::table('variantes', function (Blueprint $table) {
            $table->foreignId('id_talla')->nullable()->constrained('tallas')->nullOnDelete();
        });
        Schema::create('variante_color', function (Blueprint $table) {
            $table->foreignId('id_variante')->constrained('variantes')->onDelete('cascade');
            $table->foreignId('id_color')->constrained('colors')->onDelete('cascade');
            $table->primary(['id_variante', 'id_color']);
        });

        $talla = DB::table('atributos')->where('slug', 'talla')->value('id');
        $color = DB::table('atributos')->where('slug', 'color')->value('id');
        $now = now();

        foreach (DB::table('atributo_valores')->whereIn('id_atributo', array_filter([$talla, $color]))->get() as $valor) {
            $variantes = DB::table('variante_atributo_valor')->where('id_valor', $valor->id)->pluck('id_variante');
            if ((int) $valor->id_atributo === (int) $talla) {
                $id = DB::table('tallas')->insertGetId(['talla' => $valor->valor, 'created_at' => $now, 'updated_at' => $now]);
                DB::table('variantes')->whereIn('id', $variantes)->update(['id_talla' => $id]);
            } else {
                $id = DB::table('colors')->insertGetId(['color' => $valor->valor, 'cod_hex' => $valor->cod_hex, 'tipo' => 'Base', 'created_at' => $now, 'updated_at' => $now]);
                DB::table('variante_color')->insertOrIgnore($variantes->map(fn ($v) => ['id_variante' => $v, 'id_color' => $id])->all());
            }
        }

        Schema::dropIfExists('variante_atributo_valor');
        Schema::dropIfExists('atributo_valores');
        Schema::dropIfExists('atributos');
    }

    private function copiarTallas(): void
    {
        $tallas = DB::table('tallas')->orderBy('id')->get();
        if ($tallas->isEmpty()) {
            return;
        }

        $atributo = $this->crearAtributo('Talla', 'talla', 'texto', 2);
        $mapa = [];
        foreach ($tallas as $i => $talla) {
            $mapa[$talla->id] = $this->valor($atributo, $talla->talla, null, $i);
        }

        $filas = DB::table('variantes')->whereNotNull('id_talla')->get(['id', 'id_talla'])
            ->filter(fn ($v) => isset($mapa[$v->id_talla]))
            ->map(fn ($v) => ['id_variante' => $v->id, 'id_valor' => $mapa[$v->id_talla]]);
        foreach ($filas->chunk(500) as $chunk) {
            DB::table('variante_atributo_valor')->insertOrIgnore($chunk->values()->all());
        }
    }

    private function copiarColores(): void
    {
        $colores = DB::table('colors')->orderBy('id')->get();
        if ($colores->isEmpty()) {
            return;
        }

        $atributo = $this->crearAtributo('Color', 'color', 'color', 1);
        $mapa = [];
        foreach ($colores as $i => $color) {
            $mapa[$color->id] = $this->valor($atributo, $color->color, $color->cod_hex, $i);
        }

        $filas = DB::table('variante_color')->get()
            ->filter(fn ($vc) => isset($mapa[$vc->id_color]))
            ->map(fn ($vc) => ['id_variante' => $vc->id_variante, 'id_valor' => $mapa[$vc->id_color]]);
        foreach ($filas->chunk(500) as $chunk) {
            DB::table('variante_atributo_valor')->insertOrIgnore($chunk->values()->all());
        }
    }

    private function crearAtributo(string $nombre, string $slug, string $tipo, int $orden): int
    {
        $now = now();

        return DB::table('atributos')->insertGetId([
            'nombre' => $nombre, 'slug' => $slug, 'tipo' => $tipo, 'filtrable' => true, 'orden' => $orden,
            'created_at' => $now, 'updated_at' => $now,
        ]);
    }

    /** Values with the same name collapse into one (the old tables allowed duplicates). */
    private function valor(int $atributo, string $valor, ?string $hex, int $orden): int
    {
        $valor = trim($valor) ?: '—';
        $existente = DB::table('atributo_valores')->where('id_atributo', $atributo)->where('valor', $valor)->value('id');
        if ($existente) {
            return $existente;
        }
        $now = now();

        return DB::table('atributo_valores')->insertGetId([
            'id_atributo' => $atributo, 'valor' => $valor, 'cod_hex' => $hex, 'orden' => $orden,
            'created_at' => $now, 'updated_at' => $now,
        ]);
    }
};
