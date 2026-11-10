<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Escribe tu correo electrónico.',
            'email.email' => 'El correo electrónico no es válido.',
        ]);

        try {
            Password::sendResetLink($request->only('email'));
        } catch (\Throwable $e) {
            // Normalmente es un problema de configuración del correo (MAIL_* en el .env).
            Log::error('No se pudo enviar el correo de recuperación de contraseña', [
                'email' => $request->input('email'),
                'error' => $e->getMessage(),
            ]);

            throw ValidationException::withMessages([
                'email' => 'No pudimos enviar el correo en este momento. Inténtalo de nuevo más tarde.',
            ]);
        }

        // Siempre se responde lo mismo, exista o no la cuenta, para no revelar
        // qué correos están registrados.
        return back()->with('status', 'Si existe una cuenta con ese correo, te enviamos un enlace para cambiar tu contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).');
    }
}
