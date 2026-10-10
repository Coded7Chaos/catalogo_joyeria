<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Varias fotos por variante, ordenadas y con texto alternativo (SEO y accesibilidad).
 * variantes.url_foto se mantiene como portada: siempre es la primera foto de la galería.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('variante_imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_variante')->constrained('variantes')->cascadeOnDelete();
            $table->text('url');
            $table->string('alt', 180)->nullable();
            $table->unsignedInteger('orden')->default(0);
            $table->timestamps();
        });

        $now = now();
        $filas = DB::table('variantes')->whereNotNull('url_foto')->where('url_foto', '!=', '')->get(['id', 'url_foto'])
            ->map(fn ($v) => ['id_variante' => $v->id, 'url' => $v->url_foto, 'orden' => 0, 'created_at' => $now, 'updated_at' => $now]);
        foreach ($filas->chunk(500) as $chunk) {
            DB::table('variante_imagenes')->insert($chunk->values()->all());
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('variante_imagenes');
    }
};
