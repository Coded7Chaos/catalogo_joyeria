<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compra extends Model
{
    protected $fillable = [
        'id_proveedor',
        'total_compra',
        'nro_pagina'
    ];

    public function proveedor(){
        return $this->belongsTo(Proveedor::class, 'id_proveedor');
    }

    public function detallesCompras(){
        return $this->hasMany(DetalleCompra::class, 'id_compra');
    }
}
