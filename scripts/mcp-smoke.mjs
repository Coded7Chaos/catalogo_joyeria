// Prueba real con el cliente oficial: node --env-file=.env scripts/mcp-smoke.mjs
// Por defecto solo lee. --write realiza un ciclo de prueba en la base configurada.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const isolated = process.argv.includes('--isolated');
const write = process.argv.includes('--write') || isolated;
let server;
if (isolated) {
    const prepare = spawnSync(process.env.PHP_BINARY || 'php', ['scripts/prepare-mcp-smoke.php'], {
        cwd: root, encoding: 'utf8', env: process.env, timeout: 60000,
    });
    assert.equal(prepare.status, 0, prepare.stderr || prepare.stdout);
    Object.assign(process.env, JSON.parse(readFileSync(prepare.stdout.trim(), 'utf8')));
    const portProbe = createServer();
    await new Promise(resolve => portProbe.listen(0, '127.0.0.1', resolve));
    const port = portProbe.address().port;
    await new Promise(resolve => portProbe.close(resolve));
    process.env.MCP_URL = `http://127.0.0.1:${port}/mcp/catalogo`;
    server = spawn(process.env.PHP_BINARY || 'php', ['-S', `127.0.0.1:${port}`,
        fileURLToPath(new URL('../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php', import.meta.url))], {
        cwd: fileURLToPath(new URL('../public/', import.meta.url)), env: process.env, stdio: 'ignore',
    });
    server.on('error', () => {});
    process.on('exit', () => server.kill());
    for (let attempt = 0; ; attempt++) {
        try {
            await fetch(process.env.MCP_URL, { signal: AbortSignal.timeout(1000) });
            break;
        } catch (error) {
            if (attempt >= 50 || server.exitCode !== null) {
                server.kill();
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}
if (write) {
    assert.equal(process.env.APP_ENV, 'testing', '--write requiere APP_ENV=testing y una base desechable.');
    assert.equal(process.env.DB_CONNECTION, 'sqlite', '--write requiere SQLite aislada.');
    if (process.env.MCP_URL) assert(['127.0.0.1', 'localhost'].includes(new URL(process.env.MCP_URL).hostname));
}
const token = process.env.CATALOGO_MCP_TOKEN;
assert(token, 'Define CATALOGO_MCP_TOKEN; no pases credenciales por argumentos.');

async function check(transport, label) {
    const client = new Client({ name: 'catalogo-smoke', version: '1.0.0' });
    const call = async (name, args) => {
        const result = await client.callTool({ name, arguments: args });
        assert(!result.isError, `${name}: ${JSON.stringify(result.content)}`);
        return result.structuredContent;
    };
    try {
        await client.connect(transport);
        const tools = await client.listTools();
        assert(tools.tools.some(t => t.name === 'productos_listar'));
        const list = await call('productos_listar', { per_page: 1 });
        assert(Number.isInteger(list.total));
        if (write) {
            const suffix = `MCP smoke ${label} ${Date.now()}`;
            const { datos: category } = await call('categorias_crear', { datos: { categoria: suffix } });
            let product;
            try {
                ({ datos: product } = await call('productos_crear', { datos: {
                    nombre: suffix, id_categoria: category.id,
                    variantes: [{ sku: suffix, precio: 12.5, stock: 2 }],
                } }));
                const variantId = product.variantes[0].id;
                await call('productos_actualizar', { id: product.id, datos: {
                    variantes_update: [{ id: variantId, stock: 3 }],
                } });
                const detail = await call('productos_obtener', { id: product.id });
                assert.equal(detail.datos.variantes[0].stock, 3);
                await call('productos_eliminar', { id: product.id, confirmar: true });
                const missing = await client.callTool({ name: 'productos_obtener', arguments: { id: product.id } });
                assert(missing.isError);
                // El producto conserva su categoría por borrado lógico: no se borra la categoría.
            } catch (error) {
                if (product) await call('productos_eliminar', { id: product.id, confirmar: true }).catch(() => {});
                throw error;
            }
        }
        console.log(`${label}: handshake, discovery y ${write ? 'CRUD' : 'lectura'} OK (${tools.tools.length} herramientas).`);
    } finally {
        await client.close();
    }
}

try {
    await check(new StdioClientTransport({
        command: process.env.PHP_BINARY || 'php', args: ['artisan', 'mcp:start', 'catalogo'],
        cwd: root, env: Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== undefined)),
    }), 'STDIO');

    if (process.env.MCP_URL) {
        await check(new StreamableHTTPClientTransport(new URL(process.env.MCP_URL), {
            requestInit: { headers: { Authorization: `Bearer ${token}` } },
        }), 'HTTP');
    }
} finally {
    server?.kill();
}
