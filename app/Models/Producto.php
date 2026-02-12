<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Producto extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nombre',
        'id_categoria'
    ];

    public function categoria(){
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id');
    }

    public function variantes(){
        return $this->hasMany(Variante::class, 'id_producto', 'id');
    }

    public function tags(){
        return $this->belongsToMany(Tag::class, 'tags_productos', 'id_producto', 'id_tag');
    }
}
