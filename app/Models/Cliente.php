<?php

namespace App\Models;


use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Cliente extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;
    protected $fillable = [
        'nombre',
        'telefono',
        'email',
        'password',
        'role',
        'url_foto',
    ];

    protected $hidden =[
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function ventas(){
        return $this->hasMany(Venta::class, 'id_cliente');
    }
}
