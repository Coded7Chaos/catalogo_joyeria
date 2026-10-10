<?php

namespace App\Models;

use App\Models\Concerns\TieneSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class Categoria extends Model
{
    use HasFactory, TieneSlug;

    protected $fillable = [
        'categoria',
        'parent_id',
        'slug',
        'descripcion',
        'imagen',
        'orden',
        'meta_titulo',
        'meta_descripcion',
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'orden' => 'integer',
    ];

    protected static function booted(): void
    {
        // The store menu is cached; any change to the categories rebuilds it.
        static::saved(fn () => Cache::deleteMultiple(['categorias_menu', 'sitemap']));
        static::deleted(fn () => Cache::deleteMultiple(['categorias_menu', 'sitemap']));
    }

    protected function slugDesde(): string
    {
        return 'categoria';
    }

    public function productos(){
        return $this -> hasMany(Producto::class, 'id_categoria', 'id');
    }

    public function padre()
    {
        return $this->belongsTo(Categoria::class, 'parent_id');
    }

    public function hijas()
    {
        return $this->hasMany(Categoria::class, 'parent_id')->orderBy('orden')->orderBy('categoria');
    }

    public function getUrlAttribute(): string
    {
        return url('/categoria/'.$this->slug);
    }

    /** This category plus every subcategory below it, at any depth. */
    public static function idsConDescendientes(int $id): array
    {
        $porPadre = static::query()->get(['id', 'parent_id'])->groupBy('parent_id');
        $ids = [$id];
        for ($i = 0; $i < count($ids); $i++) {
            foreach ($porPadre->get($ids[$i], collect()) as $hija) {
                if (! in_array($hija->id, $ids, true)) {
                    $ids[] = $hija->id;
                }
            }
        }

        return $ids;
    }

    /** Ancestors from the root down to this category (for breadcrumbs). */
    public function ruta(): array
    {
        $ruta = [];
        $actual = $this;
        while ($actual && count($ruta) < 10) {
            array_unshift($ruta, $actual);
            $actual = $actual->parent_id ? static::find($actual->parent_id) : null;
        }

        return $ruta;
    }

    /** Category tree for the store menus and filter tabs: roots with their subcategories. */
    public static function menu(): array
    {
        return Cache::remember('categorias_menu', 3600, function () {
            $todas = static::query()->orderBy('orden')->orderBy('categoria')
                ->get(['id', 'parent_id', 'categoria', 'slug', 'imagen', 'descripcion']);
            $porPadre = $todas->groupBy(fn ($c) => $c->parent_id ?? 0);

            $armar = function ($padreId) use (&$armar, $porPadre) {
                return $porPadre->get($padreId, collect())->map(fn ($c) => [
                    'id' => $c->id,
                    'parent_id' => $c->parent_id,
                    'categoria' => $c->categoria,
                    'slug' => $c->slug,
                    'imagen' => $c->imagen,
                    'hijas' => $armar($c->id),
                ])->values()->all();
            };

            return $armar(0);
        });
    }
}
