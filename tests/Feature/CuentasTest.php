<?php

namespace Tests\Feature;

use App\Models\Cliente;
use App\Notifications\RestablecerContrasena;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CuentasTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): Cliente
    {
        $admin = Cliente::factory()->create();
        $admin->role = 'admin';
        $admin->save();

        return $admin;
    }

    public function test_registro_exige_telefono(): void
    {
        $this->post('/register', [
            'nombre' => 'Ana',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertSessionHasErrors('telefono');

        $this->assertGuest();
    }

    public function test_registro_guarda_telefono(): void
    {
        $this->post('/register', [
            'nombre' => 'Ana',
            'email' => 'ana@example.com',
            'telefono' => '+591 71234567',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect('/');

        $this->assertAuthenticated();
        $this->assertDatabaseHas('clientes', ['email' => 'ana@example.com', 'telefono' => '+591 71234567', 'role' => 'cliente']);
    }

    public function test_telefono_invalido_es_rechazado(): void
    {
        $this->post('/register', [
            'nombre' => 'Ana',
            'email' => 'ana@example.com',
            'telefono' => '--------',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertSessionHasErrors('telefono');
    }

    public function test_paginas_de_recuperacion_cargan(): void
    {
        $this->get('/forgot-password')->assertOk();
        $this->get('/reset-password/token-de-prueba?email=a@b.com')->assertOk();
    }

    public function test_se_envia_correo_de_recuperacion(): void
    {
        Notification::fake();
        $cliente = Cliente::factory()->create();

        $this->post('/forgot-password', ['email' => $cliente->email])
            ->assertSessionHas('status')
            ->assertSessionHasNoErrors();

        Notification::assertSentTo($cliente, RestablecerContrasena::class);
    }

    public function test_correo_inexistente_no_revela_nada(): void
    {
        Notification::fake();

        $this->post('/forgot-password', ['email' => 'nadie@example.com'])
            ->assertSessionHas('status')
            ->assertSessionHasNoErrors();

        Notification::assertNothingSent();
    }

    public function test_correo_de_recuperacion_en_espanol_con_enlace(): void
    {
        $cliente = Cliente::factory()->create();
        $mail = (new RestablecerContrasena('abc123'))->toMail($cliente);

        $this->assertStringContainsString('Restablece tu contraseña', $mail->subject);
        $this->assertStringContainsString('/reset-password/abc123', $mail->actionUrl);
        $this->assertStringContainsString(urlencode($cliente->email), $mail->actionUrl);
    }

    public function test_se_cambia_la_contrasena_con_el_enlace(): void
    {
        Notification::fake();
        $cliente = Cliente::factory()->create();

        $this->post('/forgot-password', ['email' => $cliente->email]);

        Notification::assertSentTo($cliente, RestablecerContrasena::class, function ($notification) use ($cliente) {
            $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $cliente->email,
                'password' => 'nueva-clave-123',
                'password_confirmation' => 'nueva-clave-123',
            ])->assertSessionHasNoErrors()->assertRedirect('/login');

            return true;
        });

        $this->assertTrue(Hash::check('nueva-clave-123', $cliente->fresh()->password));
    }

    public function test_token_invalido_muestra_error(): void
    {
        $cliente = Cliente::factory()->create();

        $this->post('/reset-password', [
            'token' => 'token-falso',
            'email' => $cliente->email,
            'password' => 'nueva-clave-123',
            'password_confirmation' => 'nueva-clave-123',
        ])->assertSessionHasErrors('email');
    }

    public function test_admin_puede_crear_otro_admin(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/usuarios', [
                'nombre' => 'Nuevo Admin',
                'email' => 'nuevo@example.com',
                'telefono' => '71234567',
                'role' => 'admin',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])->assertSessionHasNoErrors();

        $nuevo = Cliente::where('email', 'nuevo@example.com')->firstOrFail();
        $this->assertSame('admin', $nuevo->role);
        $this->assertTrue(Hash::check('password123', $nuevo->password));

        // Y el nuevo admin puede entrar al panel.
        $this->post('/logout');
        $this->post('/login', ['email' => 'nuevo@example.com', 'password' => 'password123'])->assertRedirect('/admin');
    }

    public function test_cliente_no_puede_crear_usuarios(): void
    {
        $cliente = Cliente::factory()->create();

        $this->actingAs($cliente)
            ->post('/admin/usuarios', [
                'nombre' => 'Intruso',
                'email' => 'intruso@example.com',
                'telefono' => '71234567',
                'role' => 'admin',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])->assertRedirect('/');

        $this->assertDatabaseMissing('clientes', ['email' => 'intruso@example.com']);
    }

    public function test_admin_no_puede_quitarse_su_propio_rol(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)
            ->put("/admin/usuarios/{$admin->id}", [
                'nombre' => $admin->nombre,
                'email' => $admin->email,
                'telefono' => '71234567',
                'role' => 'cliente',
            ])->assertSessionHasErrors('role');

        $this->assertSame('admin', $admin->fresh()->role);
    }

    public function test_admin_no_puede_usar_email_de_otro_usuario(): void
    {
        $admin = $this->admin();
        $otro = Cliente::factory()->create();

        $this->actingAs($admin)
            ->put("/admin/usuarios/{$admin->id}", [
                'nombre' => $admin->nombre,
                'email' => $otro->email,
                'role' => 'admin',
            ])->assertSessionHasErrors('email');
    }
}
