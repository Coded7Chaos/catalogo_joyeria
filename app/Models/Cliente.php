<?php

namespace App\Models;


use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\RestablecerContrasena;

class Cliente extends Authenticatable
{
    use HasFactory, SoftDeletes, Notifiable;

    /** Teléfono: dígitos con +, espacios, guiones o paréntesis opcionales; mínimo 7 dígitos. */
    public const REGEX_TELEFONO = '/^(?=(?:\D*\d){7})\+?[0-9\s\-()]{7,20}$/';

    /** Mensajes en español para las validaciones de cuentas (registro, panel admin, contraseña). */
    public const MENSAJES_VALIDACION = [
        'nombre.required' => 'Escribe tu nombre.',
        'email.required' => 'Escribe tu correo electrónico.',
        'email.email' => 'El correo electrónico no es válido.',
        'email.lowercase' => 'El correo electrónico debe estar en minúsculas.',
        'email.unique' => 'Ya existe una cuenta con este correo electrónico.',
        'telefono.required' => 'Escribe un número de teléfono de contacto.',
        'telefono.regex' => 'El teléfono solo puede tener números, espacios, +, guiones o paréntesis (mínimo 7 dígitos).',
        'telefono.max' => 'El teléfono es demasiado largo.',
        'password.required' => 'Escribe una contraseña.',
        'password.confirmed' => 'Las contraseñas no coinciden.',
        'password.min' => 'La contraseña debe tener al menos :min caracteres.',
        'role.in' => 'El rol no es válido.',
    ];
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

    /** Envía el correo de recuperación de contraseña (en español). */
    public function sendPasswordResetNotification(#[\SensitiveParameter] $token): void
    {
        $this->notify((new RestablecerContrasena($token))->locale('es'));
    }

    public function ventas(){
        return $this->hasMany(Venta::class, 'id_cliente');
    }
}
