<?php

namespace App\Models;

use App\Models\Concerns\TieneSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;


class Producto extends Model
{
    use HasFactory, SoftDeletes, TieneSlug;

    protected $fillable = [
        'nombre',
        'id_categoria',
        'slug',
        'descripcion',
        'meta_titulo',
        'meta_descripcion',
    ];

    protected static function booted(): void
    {
        static::saved(fn () => Cache::forget('sitemap'));
        static::deleted(fn () => Cache::forget('sitemap'));
    }

    protected function slugDesde(): string
    {
        return 'nombre';
    }

    public function categoria(){
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id');
    }

    public function variantes(){
        return $this->hasMany(Variante::class, 'id_producto', 'id');
    }

    public function tags(){
        return $this->belongsToMany(Tag::class, 'tags_productos', 'id_producto', 'id_tag');
    }

    public function getUrlAttribute(): string
    {
        return url('/producto/'.$this->slug);
    }
}
