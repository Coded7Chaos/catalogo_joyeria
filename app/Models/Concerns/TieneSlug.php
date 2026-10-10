<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Gives the model a unique, URL-friendly `slug` (e.g. "collar-luna-dorada").
 * Empty: built from the column returned by slugDesde(). Edited by hand: kept
 * (made unique). Renaming the record keeps the slug so published links still work.
 */
trait TieneSlug
{
    abstract protected function slugDesde(): string;

    protected static function bootTieneSlug(): void
    {
        static::saving(function (Model $model) {
            if ($model->isDirty('slug') && filled($model->slug)) {
                $model->slug = static::slugUnico($model->slug, $model->getKey());
            } elseif (blank($model->slug)) {
                $model->slug = static::slugUnico((string) $model->{$model->slugDesde()}, $model->getKey());
            }
        });
    }

    public static function slugUnico(string $texto, $ignorarId = null): string
    {
        $base = Str::limit(Str::slug($texto), 160, '') ?: 'item';
        $slug = $base;
        $conBorrados = in_array(SoftDeletes::class, class_uses_recursive(static::class), true);

        for ($i = 2; static::query()
            ->when($conBorrados, fn ($q) => $q->withTrashed())
            ->where('slug', $slug)
            ->when($ignorarId, fn ($q) => $q->whereKeyNot($ignorarId))
            ->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
