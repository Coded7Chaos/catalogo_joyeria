<?php

// Crea una base SQLite nueva en una carpeta ignorada; no modifica la base de .env.
use App\Models\Cliente;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();
if (! $app->environment('local', 'testing')) {
    fwrite(STDERR, "Solo se permite preparar pruebas desde local o testing.\n");
    exit(1);
}
$directory = storage_path('app/mcp-smoke-'.bin2hex(random_bytes(8)));
mkdir($directory, 0700, true);
$database = str_replace('\\', '/', $directory.'/database.sqlite');
touch($database);
config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => $database,
    'cache.default' => 'array', 'session.driver' => 'array', 'queue.default' => 'sync']);
DB::purge('sqlite');
Artisan::call('migrate', ['--force' => true]);
$admin = Cliente::create(['nombre' => 'Prueba MCP', 'email' => 'mcp-smoke@example.test',
    'telefono' => '+591 70000000', 'role' => 'admin', 'password' => bin2hex(random_bytes(24))]);
$token = $admin->createToken('smoke', ['mcp:read', 'mcp:write', 'mcp:delete', 'mcp:users'], now()->addHour());
$env = ['APP_ENV' => 'testing', 'APP_DEBUG' => 'false', 'APP_KEY' => 'base64:'.base64_encode(random_bytes(32)),
    'APP_CONFIG_CACHE' => $directory.'/config-cache.php', 'APP_ROUTES_CACHE' => $directory.'/routes-cache.php',
    'DB_CONNECTION' => 'sqlite', 'DB_DATABASE' => $database, 'CACHE_STORE' => 'array',
    'SESSION_DRIVER' => 'array', 'QUEUE_CONNECTION' => 'sync', 'MAIL_MAILER' => 'array',
    'CATALOGO_MCP_TOKEN' => $token->plainTextToken];
file_put_contents($directory.'/environment.json', json_encode($env, JSON_THROW_ON_ERROR));
echo $directory.'/environment.json';
