<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Variante;
use App\Models\Atributo;
use App\Models\AtributoValor;
use App\Models\Ajuste;
use App\Models\Tag;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Support\ImagenOptimizada;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AdminController extends Controller
{
    // ── Dashboard ──

    public function dashboard()
    {
        $stats = [
            'totalProductos' => Producto::count(),
            'totalVariantes' => Variante::count(),
            'totalUsuarios' => Cliente::count(),
            'totalCategorias' => Categoria::count(),
            'totalAtributos' => Atributo::count(),
            'totalValores' => AtributoValor::count(),
            'totalTags' => Tag::count(),
            'totalProveedores' => Proveedor::count(),
            'productosAgotados' => Variante::where('stock', 0)->count(),
            'ventasPendientes' => Venta::where('estado', 'pendiente')->count(),
        ];

        $productosRecientes = Producto::with(['categoria', 'variantes:id,id_producto,url_foto'])->latest()->take(5)->get();
        $usuariosRecientes = Cliente::latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', compact('stats', 'productosRecientes', 'usuariosRecientes'));
    }

    // ── Image Upload ──

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:10240',
        ]);

        // Photos are saved as a light WebP; if the server can't convert them, as they came.
        $archivo = $request->file('image');
        if ($webp = ImagenOptimizada::webp($archivo->getRealPath())) {
            $path = 'catalogo/'.Str::random(40).'.webp';
            Storage::disk('public')->put($path, $webp);
        } else {
            $path = $archivo->store('catalogo', 'public');
        }

        return response()->json([
            'url' => '/storage/' . $path,
        ]);
    }

    // ── Products ──

    public function productos(Request $request)
    {
        $productos = Producto::with(['categoria', 'variantes.valores.atributo', 'variantes.imagenes', 'tags'])
            ->when($request->input('search'), fn($q, $s) => $q->where('nombre', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Productos', [
            'productos' => $productos,
            'categorias' => Categoria::orderBy('orden')->orderBy('categoria')->get(['id', 'parent_id', 'categoria']),
            'atributos' => Atributo::with('valores')->orderBy('orden')->orderBy('nombre')->get(),
            'tags' => Tag::all(),
            'filtros' => $request->only('search'),
        ]);
    }

    /** Validation shared by create/update; $prefijo is the key holding the variants. */
    private function reglasProducto(array $prefijos, ?int $productoId = null): array
    {
        $reglas = [
            'nombre' => 'required|string|max:150',
            'id_categoria' => 'required|exists:categorias,id',
            'slug' => ['nullable', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('productos', 'slug')->ignore($productoId)],
            'descripcion' => 'nullable|string|max:5000',
            'meta_titulo' => 'nullable|string|max:70',
            'meta_descripcion' => 'nullable|string|max:170',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
        ];

        foreach ($prefijos as $p) {
            $reglas += [
                "{$p}" => 'nullable|array',
                "{$p}.*.sku" => 'nullable|string|max:50',
                "{$p}.*.precio" => 'required|numeric|min:0',
                "{$p}.*.stock" => 'required|integer|min:0',
                "{$p}.*.valores" => 'nullable|array',
                "{$p}.*.valores.*" => 'integer|exists:atributo_valores,id',
                "{$p}.*.imagenes" => 'nullable|array|max:12',
                "{$p}.*.imagenes.*.url" => 'required|string|max:2048',
                "{$p}.*.imagenes.*.alt" => 'nullable|string|max:180',
            ];
        }

        return $reglas;
    }

    private const MENSAJES_PRODUCTO = [
        'slug.regex' => 'La URL solo puede tener minúsculas, números y guiones (ej: collar-luna-dorada).',
        'slug.unique' => 'Ya hay otro producto con esa URL.',
    ];

    /** A variant can hold one value per attribute (one color, one size…). */
    private function validarValoresPorAtributo(array $variantes): void
    {
        $valorAtributo = AtributoValor::pluck('id_atributo', 'id');
        foreach ($variantes as $v) {
            $atributos = collect($v['valores'] ?? [])->map(fn ($id) => $valorAtributo[$id] ?? null)->filter();
            if ($atributos->count() !== $atributos->unique()->count()) {
                throw ValidationException::withMessages(['variantes' => 'Cada variante puede tener un solo valor por atributo (por ejemplo, un solo color).']);
            }
        }
    }

    private function guardarVariante(Producto $producto, array $vData, ?Variante $variante = null): void
    {
        $datos = [
            'sku' => $vData['sku'] ?? null,
            'precio' => $vData['precio'],
            'stock' => $vData['stock'],
        ];

        $variante = $variante ? tap($variante)->update($datos) : $producto->variantes()->create($datos);
        $variante->valores()->sync($vData['valores'] ?? []);
        $variante->guardarImagenes($vData['imagenes'] ?? []);
    }

    public function productoStore(Request $request)
    {
        $request->validate($this->reglasProducto(['variantes']), self::MENSAJES_PRODUCTO);

        // Validate SKU uniqueness across submitted variants and existing DB records
        $variantes = $request->input('variantes', []);
        $skus = collect($variantes)->pluck('sku')->filter()->values();
        if ($skus->count() !== $skus->unique()->count()) {
            throw ValidationException::withMessages(['variantes' => 'Hay SKUs duplicados entre las variantes.']);
        }
        if ($skus->isNotEmpty()) {
            $existing = Variante::whereIn('sku', $skus)->exists();
            if ($existing) {
                throw ValidationException::withMessages(['variantes' => 'Uno o más SKUs ya existen en la base de datos.']);
            }
        }
        $this->validarValoresPorAtributo($variantes);

        DB::transaction(function () use ($request, $variantes) {
            $producto = Producto::create($request->only('nombre', 'id_categoria', 'slug', 'descripcion', 'meta_titulo', 'meta_descripcion'));
            $producto->tags()->sync($request->input('tags', []));

            foreach ($variantes as $vData) {
                $this->guardarVariante($producto, $vData);
            }
        });

        return back()->with('status', 'Producto creado correctamente.');
    }

    public function productoUpdate(Request $request, string $id)
    {
        $producto = Producto::findOrFail($id);

        $request->validate([
            ...$this->reglasProducto(['variantes_new', 'variantes_update'], $producto->id),
            'variantes_update.*.id' => 'required|exists:variantes,id',
            'variantes_delete' => 'nullable|array',
            'variantes_delete.*' => 'integer',
        ], self::MENSAJES_PRODUCTO);

        $variantesNew = $request->input('variantes_new', []);
        $variantesUpdate = $request->input('variantes_update', []);
        $variantesDelete = $request->input('variantes_delete', []);

        // Validate SKU uniqueness across update + new, excluding those being deleted
        $allSkus = collect($variantesUpdate)->pluck('sku')
            ->merge(collect($variantesNew)->pluck('sku'))
            ->filter()
            ->values();

        if ($allSkus->count() !== $allSkus->unique()->count()) {
            throw ValidationException::withMessages(['variantes' => 'Hay SKUs duplicados entre las variantes.']);
        }

        if ($allSkus->isNotEmpty()) {
            $updateIds = collect($variantesUpdate)->pluck('id')->merge($variantesDelete)->filter()->all();
            $existing = Variante::whereIn('sku', $allSkus)
                ->when(!empty($updateIds), fn($q) => $q->whereNotIn('id', $updateIds))
                ->exists();
            if ($existing) {
                throw ValidationException::withMessages(['variantes' => 'Uno o más SKUs ya existen en la base de datos.']);
            }
        }
        $this->validarValoresPorAtributo([...$variantesUpdate, ...$variantesNew]);

        DB::transaction(function () use ($request, $producto, $variantesNew, $variantesUpdate, $variantesDelete) {
            $producto->update($request->only('nombre', 'id_categoria', 'slug', 'descripcion', 'meta_titulo', 'meta_descripcion'));
            $producto->tags()->sync($request->input('tags', []));

            if (!empty($variantesDelete)) {
                Variante::whereIn('id', $variantesDelete)
                    ->where('id_producto', $producto->id)
                    ->each(fn($v) => $v->delete());
            }

            foreach ($variantesUpdate as $vData) {
                $variante = Variante::where('id', $vData['id'])
                    ->where('id_producto', $producto->id)
                    ->firstOrFail();
                $this->guardarVariante($producto, $vData, $variante);
            }

            foreach ($variantesNew as $vData) {
                $this->guardarVariante($producto, $vData);
            }
        });

        return back()->with('status', 'Producto actualizado correctamente.');
    }

    public function productoDestroy(string $id)
    {
        Producto::findOrFail($id)->delete();

        return back()->with('status', 'Producto eliminado correctamente.');
    }

    // ── Variantes ──

    private function reglasVariante(?int $varianteId = null): array
    {
        return [
            'sku' => ['nullable', 'string', 'max:50', Rule::unique('variantes', 'sku')->ignore($varianteId)],
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'valores' => 'nullable|array',
            'valores.*' => 'integer|exists:atributo_valores,id',
            'imagenes' => 'nullable|array|max:12',
            'imagenes.*.url' => 'required|string|max:2048',
            'imagenes.*.alt' => 'nullable|string|max:180',
        ];
    }

    public function varianteStore(Request $request, string $id)
    {
        $request->validate($this->reglasVariante());
        $this->validarValoresPorAtributo([$request->all()]);

        $producto = Producto::findOrFail($id);
        DB::transaction(fn () => $this->guardarVariante($producto, $request->all()));

        return back()->with('status', 'Variante creada correctamente.');
    }

    public function varianteUpdate(Request $request, string $id)
    {
        $variante = Variante::findOrFail($id);

        $request->validate($this->reglasVariante($variante->id));
        $this->validarValoresPorAtributo([$request->all()]);

        DB::transaction(fn () => $this->guardarVariante($variante->producto, $request->all(), $variante));

        return back()->with('status', 'Variante actualizada correctamente.');
    }

    public function varianteDestroy(string $id)
    {
        Variante::findOrFail($id)->delete();

        return back()->with('status', 'Variante eliminada correctamente.');
    }

    // ── Users ──

    public function usuarios(Request $request)
    {
        $usuarios = Cliente::query()
            ->when($request->input('search'), fn($q, $s) => $q->where('nombre', 'like', "%{$s}%")->orWhere('email', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Usuarios', [
            'usuarios' => $usuarios,
            'filtros' => $request->only('search'),
        ]);
    }

    public function usuarioUpdate(Request $request, string $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email',
            'role' => 'required|in:cliente,admin',
        ]);

        $usuario = Cliente::findOrFail($id);
        $usuario->update($request->only('nombre', 'email', 'role'));

        return back()->with('status', 'Usuario actualizado correctamente.');
    }

    public function usuarioDestroy(string $id)
    {
        $usuario = Cliente::findOrFail($id);

        if ($usuario->id === auth()->id()) {
            return back()->withErrors(['error' => 'No puedes eliminar tu propia cuenta.']);
        }

        $usuario->delete();

        return back()->with('status', 'Usuario eliminado correctamente.');
    }

    // ── Categorias ──

    public function categorias(Request $request)
    {
        // All of them (no paging): the page shows the tree of categories and subcategories.
        $categorias = Categoria::withCount(['productos', 'hijas'])
            ->when($request->input('search'), fn($q, $s) => $q->where('categoria', 'like', "%{$s}%"))
            ->orderBy('orden')
            ->orderBy('categoria')
            ->get();

        return Inertia::render('Admin/Categorias', [
            'categorias' => $categorias,
            'filtros' => $request->only('search'),
        ]);
    }

    private function reglasCategoria(Request $request, ?Categoria $categoria = null): array
    {
        $padre = $request->input('parent_id') ?: null;

        return [
            // The same name can repeat under different parents ("Plata" in Anillos and in Collares).
            'categoria' => [
                'required', 'string', 'max:150',
                Rule::unique('categorias', 'categoria')
                    ->where(fn ($q) => $padre ? $q->where('parent_id', $padre) : $q->whereNull('parent_id'))
                    ->ignore($categoria?->id),
            ],
            'parent_id' => [
                'nullable', 'integer', 'exists:categorias,id',
                function ($attr, $valor, $fail) use ($categoria) {
                    if ($categoria && $valor && in_array((int) $valor, Categoria::idsConDescendientes($categoria->id), true)) {
                        $fail('Una categoría no puede estar dentro de sí misma ni de sus subcategorías.');
                    }
                },
            ],
            'slug' => ['nullable', 'string', 'max:160', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('categorias', 'slug')->ignore($categoria?->id)],
            'descripcion' => 'nullable|string|max:5000',
            'imagen' => 'nullable|string|max:2048',
            'orden' => 'nullable|integer|min:0|max:9999',
            'meta_titulo' => 'nullable|string|max:70',
            'meta_descripcion' => 'nullable|string|max:170',
        ];
    }

    private const MENSAJES_CATEGORIA = [
        'categoria.unique' => 'Ya existe una categoría con ese nombre en el mismo nivel.',
        'slug.regex' => 'La URL solo puede tener minúsculas, números y guiones (ej: anillos-de-plata).',
        'slug.unique' => 'Ya hay otra categoría con esa URL.',
    ];

    private function datosCategoria(Request $request): array
    {
        return [
            ...$request->only('categoria', 'slug', 'descripcion', 'imagen', 'meta_titulo', 'meta_descripcion'),
            'parent_id' => $request->input('parent_id') ?: null,
            'orden' => (int) $request->input('orden', 0),
        ];
    }

    public function categoriaStore(Request $request)
    {
        $request->validate($this->reglasCategoria($request), self::MENSAJES_CATEGORIA);

        Categoria::create($this->datosCategoria($request));

        return back()->with('status', 'Categoria creada correctamente.');
    }

    public function categoriaUpdate(Request $request, string $id)
    {
        $categoria = Categoria::findOrFail($id);

        $request->validate($this->reglasCategoria($request, $categoria), self::MENSAJES_CATEGORIA);

        $categoria->update($this->datosCategoria($request));

        return back()->with('status', 'Categoria actualizada correctamente.');
    }

    public function categoriaDestroy(string $id)
    {
        $categoria = Categoria::withCount(['productos', 'hijas'])->findOrFail($id);

        if ($categoria->productos_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar una categoria con productos asociados.']);
        }
        if ($categoria->hijas_count > 0) {
            return back()->withErrors(['error' => 'Primero elimina o mueve sus subcategorías.']);
        }

        $categoria->delete();

        return back()->with('status', 'Categoria eliminada correctamente.');
    }

    // ── Atributos (Talla, Color, Material…) ──

    public function atributos()
    {
        $atributos = Atributo::with(['valores' => fn ($q) => $q->withCount('variantes')])
            ->orderBy('orden')
            ->orderBy('nombre')
            ->get();

        return Inertia::render('Admin/Atributos', ['atributos' => $atributos]);
    }

    private function reglasAtributo(?Atributo $atributo = null): array
    {
        return [
            'nombre' => ['required', 'string', 'max:80', Rule::unique('atributos', 'nombre')->ignore($atributo?->id)],
            'tipo' => 'required|in:texto,color',
            'filtrable' => 'boolean',
            'orden' => 'nullable|integer|min:0|max:9999',
        ];
    }

    public function atributoStore(Request $request)
    {
        $request->validate($this->reglasAtributo());

        Atributo::create([
            ...$request->only('nombre', 'tipo'),
            'filtrable' => $request->boolean('filtrable', true),
            'orden' => (int) $request->input('orden', 0),
        ]);

        return back()->with('status', 'Atributo creado correctamente.');
    }

    public function atributoUpdate(Request $request, string $id)
    {
        $atributo = Atributo::findOrFail($id);
        $request->validate($this->reglasAtributo($atributo));

        $atributo->update([
            ...$request->only('nombre', 'tipo'),
            'filtrable' => $request->boolean('filtrable'),
            'orden' => (int) $request->input('orden', 0),
        ]);

        return back()->with('status', 'Atributo actualizado correctamente.');
    }

    public function atributoDestroy(string $id)
    {
        $atributo = Atributo::findOrFail($id);

        if (AtributoValor::where('id_atributo', $atributo->id)->whereHas('variantes')->exists()) {
            return back()->withErrors(['error' => "No puedes eliminar \"{$atributo->nombre}\": hay variantes que lo usan."]);
        }

        $atributo->delete();

        return back()->with('status', 'Atributo eliminado correctamente.');
    }

    private function reglasValor(int $atributoId, ?AtributoValor $valor = null): array
    {
        return [
            'valor' => [
                'required', 'string', 'max:80',
                Rule::unique('atributo_valores', 'valor')->where('id_atributo', $atributoId)->ignore($valor?->id),
            ],
            'cod_hex' => ['nullable', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'orden' => 'nullable|integer|min:0|max:9999',
        ];
    }

    public function valorStore(Request $request, string $id)
    {
        $atributo = Atributo::findOrFail($id);
        $request->validate($this->reglasValor($atributo->id), ['valor.unique' => 'Ese valor ya existe en este atributo.']);

        $atributo->valores()->create([
            'valor' => $request->input('valor'),
            'cod_hex' => $request->input('cod_hex'),
            'orden' => (int) $request->input('orden', $atributo->valores()->count()),
        ]);

        return back()->with('status', 'Valor agregado correctamente.');
    }

    public function valorUpdate(Request $request, string $id)
    {
        $valor = AtributoValor::findOrFail($id);
        $request->validate($this->reglasValor($valor->id_atributo, $valor), ['valor.unique' => 'Ese valor ya existe en este atributo.']);

        $valor->update([
            'valor' => $request->input('valor'),
            'cod_hex' => $request->input('cod_hex'),
            'orden' => (int) $request->input('orden', $valor->orden),
        ]);

        return back()->with('status', 'Valor actualizado correctamente.');
    }

    public function valorDestroy(string $id)
    {
        $valor = AtributoValor::withCount('variantes')->findOrFail($id);

        if ($valor->variantes_count > 0) {
            return back()->withErrors(['error' => "No puedes eliminar \"{$valor->valor}\": hay variantes que lo usan."]);
        }

        $valor->delete();

        return back()->with('status', 'Valor eliminado correctamente.');
    }

    // ── SEO ──

    private const AJUSTES_SEO = ['seo_nombre_sitio', 'seo_titulo_inicio', 'seo_descripcion', 'seo_imagen', 'seo_google_verificacion'];

    public function seo()
    {
        $ajustes = collect(self::AJUSTES_SEO)->mapWithKeys(fn ($clave) => [$clave => Ajuste::get($clave, '')])->all();

        return Inertia::render('Admin/Seo', [
            'ajustes' => $ajustes,
            'porDefecto' => [
                'seo_nombre_sitio' => config('seo.nombre_sitio'),
                'seo_titulo_inicio' => config('seo.nombre_sitio').' | '.config('seo.lema'),
                'seo_descripcion' => config('seo.descripcion'),
            ],
            'urls' => [
                'sitio' => url('/'),
                'sitemap' => url('/sitemap.xml'),
                'robots' => url('/robots.txt'),
            ],
            'estadisticas' => [
                'productosSinDescripcion' => Producto::where(fn ($q) => $q->whereNull('descripcion')->orWhere('descripcion', ''))->count(),
                'productosSinFoto' => Producto::whereDoesntHave('variantes', fn ($q) => $q->whereNotNull('url_foto')->where('url_foto', '!=', ''))->count(),
                'categoriasSinDescripcion' => Categoria::where(fn ($q) => $q->whereNull('descripcion')->orWhere('descripcion', ''))->count(),
            ],
        ]);
    }

    public function seoUpdate(Request $request)
    {
        $request->validate([
            'seo_nombre_sitio' => 'nullable|string|max:60',
            'seo_titulo_inicio' => 'nullable|string|max:70',
            'seo_descripcion' => 'nullable|string|max:170',
            'seo_imagen' => 'nullable|string|max:2048',
            // Only the code from Search Console's "HTML tag" method (content="…").
            'seo_google_verificacion' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_\-]+$/'],
        ], ['seo_google_verificacion.regex' => 'Pega solo el código que aparece dentro de content="…".']);

        Ajuste::guardar($request->only(self::AJUSTES_SEO));
        \Illuminate\Support\Facades\Cache::forget('sitemap');

        return back()->with('status', 'Ajustes de SEO guardados.');
    }

    // ── Tags ──

    public function tags(Request $request)
    {
        $tags = Tag::withCount('productos')
            ->when($request->input('search'), fn($q, $s) => $q->where('descripcion', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Tags', [
            'tags' => $tags,
            'filtros' => $request->only('search'),
        ]);
    }

    public function tagStore(Request $request)
    {
        $request->validate([
            'descripcion' => 'required|string|max:150|unique:tags,descripcion',
        ]);

        Tag::create($request->only('descripcion'));

        return back()->with('status', 'Tag creado correctamente.');
    }

    public function tagUpdate(Request $request, string $id)
    {
        $tag = Tag::findOrFail($id);

        $request->validate([
            'descripcion' => 'required|string|max:150|unique:tags,descripcion,' . $tag->id,
        ]);

        $tag->update($request->only('descripcion'));

        return back()->with('status', 'Tag actualizado correctamente.');
    }

    public function tagDestroy(string $id)
    {
        $tag = Tag::withCount('productos')->findOrFail($id);

        if ($tag->productos_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar un tag con productos asociados.']);
        }

        $tag->delete();

        return back()->with('status', 'Tag eliminado correctamente.');
    }

    // ── Proveedores ──

    public function proveedores(Request $request)
    {
        $proveedores = Proveedor::withCount('compras')
            ->when($request->input('search'), fn($q, $s) => $q->where('nombre', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Proveedores', [
            'proveedores' => $proveedores,
            'filtros' => $request->only('search'),
        ]);
    }

    public function proveedorStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:250',
            'notas' => 'nullable|string',
        ]);

        Proveedor::create($request->only('nombre', 'telefono', 'direccion', 'notas'));

        return back()->with('status', 'Proveedor creado correctamente.');
    }

    public function proveedorUpdate(Request $request, string $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:150',
            'telefono' => 'nullable|string|max:50',
            'direccion' => 'nullable|string|max:250',
            'notas' => 'nullable|string',
        ]);

        Proveedor::findOrFail($id)->update($request->only('nombre', 'telefono', 'direccion', 'notas'));

        return back()->with('status', 'Proveedor actualizado correctamente.');
    }

    public function proveedorDestroy(string $id)
    {
        $proveedor = Proveedor::withCount('compras')->findOrFail($id);

        if ($proveedor->compras_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar un proveedor con compras asociadas.']);
        }

        $proveedor->delete();

        return back()->with('status', 'Proveedor eliminado correctamente.');
    }
}
