<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Variante extends Model
{
    use HasFactory, SoftDeletes;

    /** `url_foto` is the cover: always the first photo of the gallery (see guardarImagenes). */
    protected $fillable = [
        'sku',
        'id_producto',
        'precio',
        'stock',
        'url_foto'
    ];

    public function producto(){
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    /** One value per attribute, e.g. Color: Dorado, Talla: 16. */
    public function valores()
    {
        return $this->belongsToMany(AtributoValor::class, 'variante_atributo_valor', 'id_variante', 'id_valor');
    }

    public function imagenes()
    {
        return $this->hasMany(VarianteImagen::class, 'id_variante')->orderBy('orden')->orderBy('id');
    }

    /** Replaces the gallery with the given photos ([url, alt]) in order and syncs the cover. */
    public function guardarImagenes(array $imagenes): void
    {
        $imagenes = array_values(array_filter($imagenes, fn ($img) => filled($img['url'] ?? null)));

        $this->imagenes()->delete();
        foreach ($imagenes as $orden => $img) {
            $this->imagenes()->create(['url' => $img['url'], 'alt' => $img['alt'] ?? null, 'orden' => $orden]);
        }
        $this->update(['url_foto' => $imagenes[0]['url'] ?? null]);
    }
}
