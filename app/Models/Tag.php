<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Tag extends Model
{
    use HasFactory;
    protected $fillable = [
        'descripcion'
    ];

    public function productos(){
        return $this->belongsToMany(Producto::class, 'tags_productos', 'id_tag', 'id_producto');
    }
}
