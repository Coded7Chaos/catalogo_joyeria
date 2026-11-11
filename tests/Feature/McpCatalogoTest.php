<?php

namespace Tests\Feature;

use App\Models\Atributo;
use App\Models\Categoria;
use App\Models\Cliente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class McpCatalogoTest extends TestCase
{
    use RefreshDatabase;

    private string $token;

    private Cliente $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = Cliente::factory()->create(['role' => 'admin']);
        $this->token = $this->admin->createToken('test', ['mcp:read', 'mcp:write', 'mcp:delete', 'mcp:users'], now()->addDay())->plainTextToken;
    }

    private function rpc(string $method, array $params = [], ?string $token = null)
    {
        return $this->withToken($token ?? $this->token)->postJson('/mcp/catalogo', [
            'jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => $params ?: (object) [],
        ]);
    }

    private function callTool(string $name, array $args = [], bool $error = false): array
    {
        $response = $this->rpc('tools/call', ['name' => $name, 'arguments' => $args ?: (object) []]);
        $response->assertOk();
        $this->assertSame($error, $response->json('result.isError'), $response->getContent());

        return $response->json('result.structuredContent') ?? [];
    }

    private function create(string $resource, array $data): array
    {
        return $this->callTool($resource.'_crear', ['datos' => $data])['datos'];
    }

    public function test_handshake_and_complete_discoverable_schemas(): void
    {
        $this->rpc('initialize', ['protocolVersion' => '2025-03-26', 'capabilities' => (object) [],
            'clientInfo' => ['name' => 'test', 'version' => '1']])->assertOk()->assertJsonPath('result.serverInfo.version', '1.0.0');
        $tools = $this->rpc('tools/list')->assertOk()->json('result.tools');
        $this->assertCount(43, $tools);
        $tools = collect($tools)->keyBy('name');
        $this->assertTrue($tools['productos_obtener']['annotations']['readOnlyHint']);
        $this->assertTrue($tools['productos_eliminar']['annotations']['destructiveHint']);
        $this->assertSame(['nombre', 'id_categoria'], $tools['productos_crear']['inputSchema']['properties']['datos']['required']);
        $this->assertArrayHasKey('variantes_update', $tools['productos_actualizar']['inputSchema']['properties']['datos']['properties']);
        $this->assertFalse($tools['usuarios_crear']['inputSchema']['properties']['datos']['additionalProperties']);
    }

    public function test_http_never_accepts_browser_session_or_stdio_token_as_credentials(): void
    {
        config(['catalogo-mcp.token' => $this->token]);
        $this->actingAs($this->admin)->postJson('/mcp/catalogo', ['jsonrpc' => '2.0', 'id' => 1, 'method' => 'tools/list'])->assertUnauthorized();
        $this->get('/mcp/catalogo')->assertUnauthorized();
    }

    public function test_non_admin_expired_revoked_and_demoted_tokens_are_rejected(): void
    {
        $client = Cliente::factory()->create();
        $token = $client->createToken('bad', ['mcp:read'])->plainTextToken;
        $this->rpc('tools/list', token: $token)->assertUnauthorized();
        $token = $this->admin->createToken('expired', ['mcp:read'], now()->subMinute())->plainTextToken;
        $this->rpc('tools/list', token: $token)->assertUnauthorized();
        $this->admin->tokens()->delete();
        $this->rpc('tools/list')->assertUnauthorized();
        $this->token = $this->admin->createToken('demote', ['mcp:read'])->plainTextToken;
        $this->admin->update(['role' => 'cliente']);
        $this->rpc('tools/list')->assertUnauthorized();
    }

    public function test_scopes_limit_discovery_and_direct_calls(): void
    {
        $read = $this->admin->createToken('read', ['mcp:read'])->plainTextToken;
        $names = array_column($this->rpc('tools/list', token: $read)->assertOk()->json('result.tools'), 'name');
        $this->assertCount(15, $names);
        $this->assertNotContains('productos_crear', $names);
        $this->assertNotContains('usuarios_listar', $names);
        $this->rpc('tools/call', ['name' => 'productos_crear', 'arguments' => ['datos' => ['nombre' => 'No']]], $read)->assertStatus(400);
        $write = $this->admin->createToken('write', ['mcp:read', 'mcp:write'])->plainTextToken;
        $this->rpc('tools/call', ['name' => 'productos_eliminar', 'arguments' => ['id' => 1, 'confirmar' => true]], $write)->assertStatus(400);
        $this->assertDatabaseCount('productos', 0);
    }

    public function test_full_product_lifecycle_with_variants_values_images_and_tags(): void
    {
        $category = $this->create('categorias', ['categoria' => 'Anillos']);
        $child = $this->create('categorias', ['categoria' => 'Plata', 'parent_id' => $category['id']]);
        $attribute = $this->create('atributos', ['nombre' => 'Color', 'tipo' => 'color']);
        $value = $this->create('valores', ['id_atributo' => $attribute['id'], 'valor' => 'Dorado', 'cod_hex' => '#FFD700']);
        $tag = $this->create('tags', ['descripcion' => 'Regalo']);
        $product = $this->create('productos', ['nombre' => 'Anillo Luna', 'id_categoria' => $child['id'],
            'descripcion' => 'Plata 925', 'tags' => [$tag['id']], 'variantes' => [[
                'sku' => 'LUNA-01', 'precio' => 150.50, 'stock' => 5, 'valores' => [$value['id']],
                'imagenes' => [['url' => '/storage/catalogo/luna.webp', 'alt' => 'Anillo de plata']],
            ]]]);
        $this->assertSame('anillo-luna', $product['slug']);
        $variant = $product['variantes'][0];
        $this->assertSame('/storage/catalogo/luna.webp', $variant['url_foto']);
        $this->assertSame($value['id'], $variant['valores'][0]['id']);
        $this->callTool('productos_actualizar', ['id' => $product['id'], 'datos' => ['nombre' => 'Luna Nueva',
            'variantes_update' => [['id' => $variant['id'], 'stock' => 8]]]]);
        $detail = $this->callTool('productos_obtener', ['id' => $product['id']])['datos'];
        $this->assertSame('Plata 925', $detail['descripcion']);
        $this->assertSame('anillo-luna', $detail['slug']);
        $this->assertCount(1, $detail['tags']);
        $this->assertCount(1, $detail['variantes'][0]['imagenes']);
        $this->assertSame(8, $detail['variantes'][0]['stock']);
        $this->assertSame(1, $this->callTool('productos_listar', ['search' => 'Luna', 'id_categoria' => $child['id'], 'per_page' => 1])['total']);
        // Visible en el mismo catálogo que usa el navegador.
        $this->get('/producto/'.$product['slug'])->assertOk();
        $this->callTool('productos_actualizar', ['id' => $product['id'], 'datos' => ['tags' => [],
            'variantes_new' => [['sku' => 'LUNA-02', 'precio' => 160, 'stock' => 2]],
            'variantes_delete' => [$variant['id']]]]);
        $this->assertSoftDeleted('variantes', ['id' => $variant['id']]);
        $this->callTool('productos_eliminar', ['id' => $product['id'], 'confirmar' => true]);
        $this->assertSoftDeleted('productos', ['id' => $product['id']]);
        $this->callTool('productos_obtener', ['id' => $product['id']], true);
        $this->assertSame(0, $this->callTool('productos_listar')['total']);
        $this->assertDatabaseHas('mcp_audit_logs', ['cliente_id' => $this->admin->id, 'herramienta' => 'productos_eliminar', 'registro_id' => $product['id']]);
    }

    public function test_atomic_rollback_on_duplicate_sku_and_invalid_nested_data(): void
    {
        $cat = Categoria::factory()->create();
        $this->callTool('productos_crear', ['datos' => ['nombre' => 'Rollback', 'id_categoria' => $cat->id,
            'variantes' => [['sku' => 'DUP', 'precio' => 10, 'stock' => 1], ['sku' => 'DUP', 'precio' => 20, 'stock' => 1]]]], true);
        $this->assertDatabaseCount('productos', 0);
        $this->assertDatabaseCount('variantes', 0);
        $this->assertDatabaseCount('mcp_audit_logs', 0);
        $this->callTool('productos_crear', ['datos' => ['nombre' => 'Inválido', 'id_categoria' => $cat->id,
            'variantes' => [['precio' => -1, 'stock' => 1]]]], true);
        $this->assertDatabaseCount('productos', 0);
    }

    public function test_variant_ownership_and_overlapping_ids_are_enforced(): void
    {
        $cat = Categoria::factory()->create();
        $a = $this->create('productos', ['nombre' => 'A', 'id_categoria' => $cat->id, 'variantes' => [['precio' => 10, 'stock' => 1]]]);
        $b = $this->create('productos', ['nombre' => 'B', 'id_categoria' => $cat->id]);
        $id = $a['variantes'][0]['id'];
        $this->callTool('productos_actualizar', ['id' => $b['id'], 'datos' => ['nombre' => 'Cambiado', 'variantes_update' => [['id' => $id, 'stock' => 99]]]], true);
        $this->assertDatabaseHas('productos', ['id' => $b['id'], 'nombre' => 'B']);
        $this->assertDatabaseHas('variantes', ['id' => $id, 'stock' => 1]);
        $this->callTool('productos_actualizar', ['id' => $a['id'], 'datos' => ['variantes_update' => [['id' => $id, 'stock' => 2]], 'variantes_delete' => [$id]]], true);
        $this->callTool('productos_eliminar', ['id' => $a['id'], 'confirmar' => true]);
        $this->callTool('variantes_actualizar', ['id' => $id, 'datos' => ['stock' => 5]], true);
    }

    public function test_attribute_conflicts_and_bad_image_urls_are_rejected(): void
    {
        $cat = Categoria::factory()->create();
        $a = Atributo::create(['nombre' => 'Color', 'tipo' => 'color']);
        $v1 = $a->valores()->create(['valor' => 'Rojo']);
        $v2 = $a->valores()->create(['valor' => 'Azul']);
        $product = $this->create('productos', ['nombre' => 'A', 'id_categoria' => $cat->id]);
        $this->callTool('variantes_crear', ['datos' => ['id_producto' => $product['id'], 'precio' => 1, 'stock' => 1, 'valores' => [$v1->id, $v2->id]]], true);
        foreach (['javascript:alert(1)', 'file:///etc/passwd', 'data:image/svg+xml,a'] as $url) {
            $this->callTool('variantes_crear', ['datos' => ['id_producto' => $product['id'], 'precio' => 1, 'stock' => 1, 'imagenes' => [['url' => $url]]]], true);
        }
        $this->assertDatabaseCount('variantes', 0);
    }

    public function test_category_cycles_sibling_duplicates_and_deletion_guards(): void
    {
        $a = $this->create('categorias', ['categoria' => 'Raíz']);
        $b = $this->create('categorias', ['categoria' => 'Hija', 'parent_id' => $a['id']]);
        $this->callTool('categorias_actualizar', ['id' => $a['id'], 'datos' => ['parent_id' => $b['id']]], true);
        $this->callTool('categorias_actualizar', ['id' => $a['id'], 'datos' => ['parent_id' => $a['id']]], true);
        $other = $this->create('categorias', ['categoria' => 'Hija']);
        $this->callTool('categorias_actualizar', ['id' => $other['id'], 'datos' => ['parent_id' => $a['id']]], true);
        $this->assertSame(2, $this->callTool('categorias_listar', ['parent_id' => null])['total']);
        $this->callTool('categorias_eliminar', ['id' => $a['id'], 'confirmar' => true], true);
        $this->callTool('categorias_eliminar', ['id' => $b['id'], 'confirmar' => true]);
    }

    public function test_generic_resources_crud_and_pagination(): void
    {
        foreach (['tags' => ['descripcion' => 'Nuevo'], 'proveedores' => ['nombre' => 'Proveedor'],
            'atributos' => ['nombre' => 'Material', 'tipo' => 'texto']] as $resource => $data) {
            $row = $this->create($resource, $data);
            $this->assertSame($row['id'], $this->callTool($resource.'_obtener', ['id' => $row['id']])['datos']['id']);
            $field = array_key_first($data);
            $this->callTool($resource.'_actualizar', ['id' => $row['id'], 'datos' => [$field => 'Editado']]);
            $this->assertSame(1, $this->callTool($resource.'_listar', ['search' => 'Editado', 'page' => 1, 'per_page' => 1])['total']);
            $this->callTool($resource.'_eliminar', ['id' => $row['id'], 'confirmar' => true]);
        }
        $this->callTool('tags_listar', ['per_page' => 101], true);
        $this->callTool('tags_listar', ['page' => 0], true);
        $this->callTool('tags_crear', ['datos' => ['descripcion' => 'Mal', 'role' => 'admin']], true);
    }

    public function test_in_use_taxonomies_cannot_be_deleted_even_after_product_soft_delete(): void
    {
        $cat = Categoria::factory()->create();
        $a = $this->create('atributos', ['nombre' => 'Color', 'tipo' => 'color']);
        $v = $this->create('valores', ['id_atributo' => $a['id'], 'valor' => 'Rojo']);
        $tag = $this->create('tags', ['descripcion' => 'Tag']);
        $p = $this->create('productos', ['nombre' => 'P', 'id_categoria' => $cat->id, 'tags' => [$tag['id']],
            'variantes' => [['precio' => 10, 'stock' => 1, 'valores' => [$v['id']]]]]);
        $this->callTool('productos_eliminar', ['id' => $p['id'], 'confirmar' => true]);
        foreach (['categorias' => $cat->id, 'atributos' => $a['id'], 'valores' => $v['id'], 'tags' => $tag['id']] as $r => $id) {
            $this->callTool($r.'_eliminar', ['id' => $id, 'confirmar' => true], true);
        }
    }

    public function test_values_crud_and_uniqueness(): void
    {
        $a = Atributo::create(['nombre' => 'Talla', 'tipo' => 'texto']);
        $v = $this->create('valores', ['id_atributo' => $a->id, 'valor' => 'M']);
        $this->callTool('valores_actualizar', ['id' => $v['id'], 'datos' => ['valor' => 'L']]);
        $this->assertSame(1, $this->callTool('valores_listar', ['id_atributo' => $a->id])['total']);
        $this->callTool('valores_crear', ['datos' => ['id_atributo' => $a->id, 'valor' => 'L']], true);
        $this->callTool('valores_eliminar', ['id' => $v['id'], 'confirmar' => true]);
    }

    public function test_user_password_is_hashed_hidden_and_actor_cannot_delete_or_demote_self(): void
    {
        $u = $this->create('usuarios', ['nombre' => 'Nueva', 'email' => 'nueva@example.com', 'telefono' => '+591 71234567', 'role' => 'cliente', 'password' => 'secret123']);
        $this->assertArrayNotHasKey('password', $u);
        $this->assertArrayNotHasKey('remember_token', $u);
        $this->assertTrue(Hash::check('secret123', Cliente::findOrFail($u['id'])->password));
        $this->callTool('usuarios_actualizar', ['id' => $u['id'], 'datos' => ['nombre' => 'Editada']]);
        $this->callTool('usuarios_actualizar', ['id' => $this->admin->id, 'datos' => ['role' => 'cliente']], true);
        $this->callTool('usuarios_eliminar', ['id' => $this->admin->id, 'confirmar' => true], true);
        $this->callTool('usuarios_eliminar', ['id' => $u['id'], 'confirmar' => true]);
        $this->assertSoftDeleted('clientes', ['id' => $u['id']]);
        $this->assertStringNotContainsString('secret123', json_encode(DB::table('mcp_audit_logs')->get()));
    }

    public function test_deletion_requires_explicit_boolean_confirmation(): void
    {
        $tag = $this->create('tags', ['descripcion' => 'Conservar']);
        $this->callTool('tags_eliminar', ['id' => $tag['id']], true);
        $this->callTool('tags_eliminar', ['id' => $tag['id'], 'confirmar' => false], true);
        $this->callTool('tags_eliminar', ['id' => $tag['id'], 'confirmar' => 'yes'], true);
        $this->assertDatabaseHas('tags', ['id' => $tag['id']]);
    }

    public function test_seo_partial_updates_invalidate_cached_settings(): void
    {
        $this->callTool('seo_actualizar', ['datos' => ['seo_nombre_sitio' => 'Mi joyería', 'seo_descripcion' => 'Descripción']]);
        $this->callTool('seo_actualizar', ['datos' => ['seo_nombre_sitio' => 'Otro nombre']]);
        $seo = $this->callTool('seo_obtener')['datos'];
        $this->assertSame('Otro nombre', $seo['seo_nombre_sitio']);
        $this->assertSame('Descripción', $seo['seo_descripcion']);
        $this->callTool('seo_actualizar', ['datos' => ['seo_google_verificacion' => '<script>']], true);
    }

    public function test_image_upload_uses_storage_and_rejects_invalid_bytes(): void
    {
        Storage::fake('public');
        $png = base64_encode(file_get_contents(base_path('public/images/favicon.png')));
        $result = $this->callTool('imagenes_crear', ['datos' => ['base64' => $png]]);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $result['url']));
        $this->callTool('imagenes_crear', ['datos' => ['base64' => base64_encode('<svg onload="alert(1)"></svg>')]], true);
        $this->callTool('imagenes_crear', ['datos' => ['base64' => '%%%']], true);
    }

    public function test_token_command_validation_and_revocation(): void
    {
        $this->artisan('mcp:token', ['email' => $this->admin->email, '--read-only' => true])->assertSuccessful();
        $token = $this->admin->tokens()->latest('id')->first();
        $this->assertSame(['mcp:read'], $token->abilities);
        $this->assertNotNull($token->expires_at);
        $this->artisan('mcp:revoke', ['id' => $token->id])->assertSuccessful();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->id]);
        $this->artisan('mcp:token', ['email' => $this->admin->email, '--days' => 0])->assertFailed();
        $this->artisan('mcp:token', ['email' => 'missing@example.com'])->assertFailed();
    }

    public function test_foreign_origin_and_malformed_protocol_are_rejected(): void
    {
        $this->withHeader('Origin', 'https://evil.example')->rpc('tools/list')->assertForbidden();
        $this->flushHeaders();
        $this->withToken($this->token)->postJson('/mcp/catalogo', ['bad' => true])->assertStatus(400);
    }

    public function test_individual_variant_crud_and_explicitly_clearing_relations(): void
    {
        $cat = Categoria::factory()->create();
        $p = $this->create('productos', ['nombre' => 'Variante suelta', 'id_categoria' => $cat->id]);
        $v = $this->create('variantes', ['id_producto' => $p['id'], 'sku' => 'SOLO-01', 'precio' => 12.5, 'stock' => 3,
            'imagenes' => [['url' => '/storage/catalogo/a.png', 'alt' => 'Portada']]]);
        $this->assertSame(1, $this->callTool('variantes_listar', ['id_producto' => $p['id'], 'search' => 'SOLO'])['total']);
        $updated = $this->callTool('variantes_actualizar', ['id' => $v['id'], 'datos' => ['precio' => 20, 'imagenes' => [], 'valores' => []]])['datos'];
        $this->assertSame(3, $updated['stock']);
        $this->assertNull($updated['url_foto']);
        $this->assertSame([], $updated['imagenes']);
        $this->assertSame($v['id'], $this->callTool('variantes_obtener', ['id' => $v['id']])['datos']['id']);
        $this->callTool('variantes_eliminar', ['id' => $v['id'], 'confirmar' => true]);
        $this->assertSoftDeleted('variantes', ['id' => $v['id']]);
        $this->assertSame(0, $this->callTool('variantes_listar', ['id_producto' => $p['id']])['total']);
    }

    public function test_deleted_admin_cannot_connect_with_an_existing_token(): void
    {
        $this->admin->delete();
        $this->rpc('tools/list')->assertUnauthorized();
    }

    public function test_invalid_nested_shapes_unknown_arguments_and_empty_updates(): void
    {
        $cat = Categoria::factory()->create();
        $p = $this->create('productos', ['nombre' => 'Conservar', 'id_categoria' => $cat->id]);
        $this->callTool('productos_actualizar', ['id' => $p['id'], 'datos' => []], true);
        $this->callTool('productos_actualizar', ['id' => $p['id'], 'datos' => ['variantes_new' => [['precio' => 1, 'stock' => 2, 'id_producto' => 999]]]], true);
        $this->callTool('productos_listar', ['sql' => 'delete from productos'], true);
        $this->callTool('productos_crear', ['datos' => ['nombre' => 'Mal', 'id_categoria' => 99999]], true);
        $this->callTool('productos_obtener', ['id' => 99999], true);
        $this->assertDatabaseCount('productos', 1);
        $this->assertDatabaseCount('variantes', 0);
    }

    public function test_http_rate_limit_is_enforced(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $this->rpc('ping')->assertOk();
        }
        $this->rpc('ping')->assertStatus(429);
    }

    public function test_failed_audit_rolls_back_seo_without_poisoning_the_cache(): void
    {
        $this->callTool('seo_actualizar', ['datos' => ['seo_nombre_sitio' => 'Original']]);
        DB::listen(function ($query) {
            if (str_starts_with($query->sql, 'insert') && str_contains($query->sql, 'mcp_audit_logs')) {
                throw new \RuntimeException('Fallo de auditoría simulado.');
            }
        });
        $this->callTool('seo_actualizar', ['datos' => ['seo_nombre_sitio' => 'Revertido']], true);
        $this->assertSame('Original', $this->callTool('seo_obtener')['datos']['seo_nombre_sitio']);
        $this->assertDatabaseCount('mcp_audit_logs', 1);
    }

    public function test_failed_audit_removes_the_uploaded_file(): void
    {
        Storage::fake('public');
        DB::listen(function ($query) {
            if (str_starts_with($query->sql, 'insert') && str_contains($query->sql, 'mcp_audit_logs')) {
                throw new \RuntimeException('Fallo de auditoría simulado.');
            }
        });
        $png = base64_encode(file_get_contents(base_path('public/images/favicon.png')));
        $this->callTool('imagenes_crear', ['datos' => ['base64' => $png]], true);
        $this->assertSame([], Storage::disk('public')->allFiles());
        $this->assertDatabaseCount('mcp_audit_logs', 0);
    }

    public function test_save_local_is_rejected_outside_local_environment(): void
    {
        $before = $this->admin->tokens()->count();
        $this->artisan('mcp:token', ['email' => $this->admin->email, '--save-local' => true])->assertFailed();
        $this->assertSame($before, $this->admin->tokens()->count());
    }
}
