<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Correo de recuperación de contraseña, en español.
 * Reutiliza la lógica de Laravel (token y enlace) y solo cambia el texto.
 */
class RestablecerContrasena extends ResetPassword
{
    protected function buildMailMessage($url): MailMessage
    {
        $minutos = config('auth.passwords.' . config('auth.defaults.passwords') . '.expire', 60);

        return (new MailMessage)
            ->subject('Restablece tu contraseña · ' . config('app.name'))
            ->greeting('¡Hola!')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta.')
            ->action('Cambiar mi contraseña', $url)
            ->line("Este enlace vence en {$minutos} minutos.")
            ->line('Si no pediste este cambio, puedes ignorar este correo: tu contraseña seguirá siendo la misma.')
            ->salutation('Saludos, ' . config('app.name'));
    }
}
