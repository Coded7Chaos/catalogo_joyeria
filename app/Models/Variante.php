<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Variante extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'id_producto',
        'id_talla',
        'precio',
        'stock',
        'url_foto'
    ];

    public function producto(){
        return $this->belongsTo(Producto::class, 'id_producto');
    }

    public function talla(){
        return $this->belongsTo(Talla::class, 'id_talla');
    }

    public function colores(){
        return $this->belongsToMany(Color::class, 'variante_color', 'id_variante', 'id_color');
    }
}
