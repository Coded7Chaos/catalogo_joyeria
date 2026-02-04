<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Proveedor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'proveedores';

    protected $fillable = [
        'nombre',
        'telefono',
        'direccion',
        'notas',
        'url_foto'
    ];
    public function compras(){
        return $this->hasMany(Compra::class, 'id_proveedor');
    }
}
