# Conector MCP del catálogo

Servidor oficial Laravel MCP, con transporte local STDIO y Streamable HTTP.
No necesita claves de OpenAI ni ejecutar un modelo dentro de la tienda.

## Preparar el proyecto y probar en local

Requisitos: PHP 8.2 o superior, Composer, Node 22 y una base MySQL o SQLite.
Desde la carpeta `catalogo_joyeria`:

```powershell
composer install
npm ci
php artisan migrate
php artisan storage:link
npm run build
php artisan serve --host=127.0.0.1 --port=8000
```

Configura primero `.env` con la base de datos local y `APP_URL=http://127.0.0.1:8000`.
En una instalación nueva, copia `.env.example` a `.env` y ejecuta `php artisan key:generate`.
La web y el panel se prueban en <http://127.0.0.1:8000>.
Para desarrollo visual puede usarse `npm run dev` en otra terminal.
Las migraciones agregan las credenciales y la auditoría MCP; no reinician la base.

## Credenciales

Usa el correo de una cuenta administrativa existente:

```powershell
php artisan mcp:token admin@tu-tienda.com --name=codex --days=30 --allow-delete
```

La credencial aparece una sola vez. Se guarda hasheada en `personal_access_tokens`.
En desarrollo puedes añadir `--save-local` para guardarla directamente en `.env`
sin mostrarla. Esa opción solo funciona con `APP_ENV=local`. Reemplaza la variable
local; las credenciales anteriores se revocan por ID si ya no las necesitas.
Copia el valor completo, incluido el ID y el separador `|`, a tu `.env` privado:

```dotenv
CATALOGO_MCP_TOKEN="ID|CREDENCIAL"
```

No agregues ese valor a Git. `.env` está excluido. Si hay configuración cacheada,
ejecuta `php artisan config:clear` después de cambiarlo.

Permisos disponibles:

| Opción | Acceso |
| --- | --- |
| Sin opciones extra | Leer, crear y editar el catálogo |
| `--read-only` | Solo consultas |
| `--allow-delete` | Agrega eliminaciones |
| `--users` | Agrega acceso a usuarios, respetando los otros permisos |
| `--days=30` | Vigencia de 1 a 365 días |

Revocación inmediata: `php artisan mcp:revoke ID`.
Al quitar el rol admin o eliminar la cuenta, sus credenciales también dejan de funcionar.
Cada llamada vuelve a comprobar permisos y caducidad, incluso en STDIO persistente.

## Conectar Codex localmente

Copia y adapta este bloque a la configuración MCP de Codex. El archivo de ejemplo
`docs/codex-mcp.example.toml` no incluye secretos. Ajusta `cwd` a la ruta absoluta
de tu instalación. El proceso PHP lee la credencial del `.env` del proyecto:

```toml
[mcp_servers.catalogo_joyeria]
command = "php"
args = ["artisan", "mcp:start", "catalogo"]
cwd = 'C:\Users\milae\Documents\joyeria\catalogo_joyeria'
startup_timeout_sec = 30
tool_timeout_sec = 60
```

Si `php` no está en el PATH del cliente, indica su ruta completa.
Recarga la conexión o reinicia el cliente después de añadirla. Registrar el servidor
en el cliente es un paso separado de instalar este código; este repositorio no
modifica la configuración personal de Codex.

## Conectar por HTTP

URL local: `http://127.0.0.1:8000/mcp/catalogo`.
Enviar `Authorization: Bearer ID|CREDENCIAL` en **todas** las peticiones.
No se aceptan cookies de sesión ni la credencial del `.env` como alternativa al header.
Hay un límite de 60 peticiones/minuto por administrador. GET y DELETE devuelven
405 porque este servidor no mantiene sesiones HTTP ni un flujo SSE independiente.

Ejemplo alternativo para Codex (no configures ambas opciones con el mismo nombre):

```toml
[mcp_servers.catalogo_joyeria]
url = "http://127.0.0.1:8000/mcp/catalogo"
bearer_token_env_var = "CATALOGO_MCP_TOKEN"
```

Aquí la variable debe estar disponible para el proceso de Codex; el cliente HTTP
no lee automáticamente el `.env` del servidor. Para acceso remoto, publica la
aplicación con HTTPS y usa una credencial distinta por conexión. Esta versión usa
Bearer preconfigurado; no implementa OAuth ni el inicio de sesión automático de
clientes que exijan OAuth. Un cliente alojado fuera de tu PC no puede acceder
a `127.0.0.1` de tu máquina.

## Herramientas

Para `productos`, `variantes`, `categorias`, `atributos`, `valores`, `tags`,
`proveedores` y `usuarios`: herramientas `RECURSO_listar`, `RECURSO_obtener`,
`RECURSO_crear`, `RECURSO_actualizar`, `RECURSO_eliminar`.
Además: `seo_obtener`, `seo_actualizar`, `imagenes_crear`.
Son 43 herramientas con permisos completos; se ocultan las no autorizadas.
Cada una anuncia sus campos y tipos en `tools/list`.

- `listar`: `search`, `page`, `per_page` (1–100) y filtro opcional según recurso:
  `id_categoria`, `parent_id`, `id_producto` o `id_atributo`. `parent_id: null` lista raíces.
- `obtener`: `id` (excepto SEO).
- `crear`: objeto `datos` con los campos anunciados en el esquema.
- `actualizar`: `id` y `datos`; conserva campos y relaciones que no se envían.
- `eliminar`: `id` y `confirmar: true`. Productos, variantes, usuarios y proveedores
  usan borrado lógico. Las taxonomías con referencias se conservan para proteger
  tanto productos activos como eliminados. No hay eliminación masiva ni definitiva.

Las subcategorías son categorías con `parent_id`. No se permiten ciclos ni nombres
repetidos bajo el mismo padre. Un valor pertenece a un atributo; una variante puede
tener un valor por atributo. Precios y stock no pueden ser negativos.

Ejemplo de argumentos para `productos_crear` (sustituye los IDs por los consultados):

```json
{
  "datos": {
    "nombre": "Anillo Luna",
    "id_categoria": 3,
    "descripcion": "Anillo de plata 925",
    "tags": [2],
    "variantes": [{
      "sku": "LUNA-01",
      "precio": 150.5,
      "stock": 5,
      "valores": [4, 9],
      "imagenes": [{"url": "/storage/catalogo/luna.webp", "alt": "Anillo Luna"}]
    }]
  }
}
```

En `productos_actualizar`, `variantes_new` agrega variantes; `variantes_update`
edita parcialmente por `id`; `variantes_delete` recibe IDs a eliminar. No se
aceptan IDs de variantes de otro producto ni IDs repetidos entre operaciones.
Enviar `tags: []`, `valores: []` o `imagenes: []` vacía esa relación.
Una operación de producto es atómica: si una variante falla, se revierte todo.

`imagenes_crear` recibe `datos.base64` (sin prefijo `data:`), acepta JPG/PNG/GIF/WebP
hasta 10 MiB y 40 megapíxeles y devuelve una URL `/storage/...`. No lee rutas del
equipo ni descarga URLs. Las galerías permiten 12 imágenes por variante.
Para admitir fotos de 10 MiB por HTTP, configura PHP y tu servidor web con un límite
de cuerpo de al menos 20 MiB (PHP: `post_max_size=20M`); base64 aumenta el tamaño.

`usuarios` necesita `--users`; no devuelve contraseñas ni tokens y no permite
eliminar ni degradar al administrador de la conexión. No incluye restablecer
contraseñas ni crear credenciales nuevas desde MCP. SEO solo modifica sus cinco
ajustes públicos, nunca `.env`, pagos, correo ni configuración del servidor.
Compras y ventas no tienen herramientas de edición en esta versión: el panel actual
tampoco ofrece esos flujos. No hay acceso SQL ni ejecución de comandos desde MCP.

La auditoría `mcp_audit_logs` registra administrador, credencial, herramienta, ID
y fecha de cada cambio exitoso, sin guardar contraseñas ni el contenido enviado.
Los errores de validación se devuelven con `isError: true` y el detalle por campo.

## Verificación

```powershell
php artisan test --compact
npm run build
node --env-file=.env scripts/mcp-smoke.mjs
npm run test:mcp
```

El script sin opciones usa el cliente oficial MCP por STDIO y solo lee. Para probar
también HTTP, define `MCP_URL` antes de ejecutarla:

```powershell
$env:MCP_URL = 'http://127.0.0.1:8000/mcp/catalogo'
node --env-file=.env scripts/mcp-smoke.mjs
```

`npm run test:mcp` prepara automáticamente una SQLite nueva bajo `storage/app/`,
crea una credencial temporal y comprueba STDIO y HTTP con el cliente oficial.
Levanta un servidor HTTP en un puerto libre y lo detiene al terminar.
No modifica `.env` ni el catálogo local; la base aislada queda disponible para inspección.

Solo en una base desechable: añadir `--write` comprueba creación, lectura, edición
y borrado con un producto de prueba por transporte. Deja el producto eliminado
lógicamente y su categoría para conservar referencias. Nunca usa una base de
producción: exige `APP_ENV=testing`, SQLite y HTTP local. No borra datos para limpiar. Las pruebas PHPUnit usan
SQLite en memoria y no tocan la base local.

Fuentes: [Laravel MCP](https://laravel.com/docs/12.x/mcp) y
[configuración MCP de Codex](https://developers.openai.com/codex/mcp/).

## Estado verificado el 11 de noviembre de 2026

- 63 pruebas aprobadas, 447 aserciones, usando SQLite en memoria.
- Cliente oficial: conexión, descubrimiento y CRUD por STDIO y HTTP en SQLite aislada.
- Lectura por ambos transportes sobre la base MySQL local, también con rutas cacheadas.
- Compilación de producción y validación de Composer aprobadas.
- Navegador Chrome: inicio → catálogo → ficha de producto en escritorio (1365×900);
  acceso → escribir correo → recuperación de contraseña en móvil (390×844).
  Sin excepciones JavaScript ni pantallas de error. Una foto Figma ausente
  (`68a47.png`) devuelve 404 y usa el reemplazo ya previsto por el diseño.
- La credencial local queda en `.env`, fuera de Git; el cliente Codex se registra
  por separado usando el ejemplo de configuración.

Los gestores de paquetes también detectaron avisos de seguridad en dependencias
que el proyecto ya tenía: 54 avisos PHP en 12 paquetes y 16 dependencias npm
señaladas. Los paquetes señalados ya estaban en el proyecto. Este cambio no actualiza
masivamente esas dependencias; deben revisarse antes de publicar acceso administrativo
por Internet. Las pruebas funcionales aprobadas no sustituyen esa revisión.
