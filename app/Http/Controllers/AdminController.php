<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Variante;
use App\Models\Color;
use App\Models\Talla;
use App\Models\Tag;
use App\Models\Cliente;
use App\Models\Proveedor;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            'totalTallas' => Talla::count(),
            'totalColores' => Color::count(),
            'totalTags' => Tag::count(),
            'totalProveedores' => Proveedor::count(),
            'productosAgotados' => Variante::where('stock', 0)->count(),
            'ventasPendientes' => Venta::where('estado', 'pendiente')->count(),
        ];

        $productosRecientes = Producto::with('categoria')->latest()->take(5)->get();
        $usuariosRecientes = Cliente::latest()->take(5)->get();

        return Inertia::render('Admin/Dashboard', compact('stats', 'productosRecientes', 'usuariosRecientes'));
    }

    // ── Image Upload ──

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $path = $request->file('image')->store('catalogo', 'public');

        return response()->json([
            'url' => '/storage/' . $path,
        ]);
    }

    // ── Products ──

    public function productos(Request $request)
    {
        $productos = Producto::with(['categoria', 'variantes.talla', 'variantes.colores', 'tags'])
            ->when($request->input('search'), fn($q, $s) => $q->where('nombre', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $categorias = Categoria::all();
        $colores = Color::all();
        $tallas = Talla::all();
        $tags = Tag::all();

        return Inertia::render('Admin/Productos', [
            'productos' => $productos,
            'categorias' => $categorias,
            'colores' => $colores,
            'tallas' => $tallas,
            'tags' => $tags,
            'filtros' => $request->only('search'),
        ]);
    }

    public function productoStore(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'id_categoria' => 'required|exists:categorias,id',
            'url_foto' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'variantes' => 'nullable|array',
            'variantes.*.sku' => 'nullable|string|max:50',
            'variantes.*.id_talla' => 'nullable|exists:tallas,id',
            'variantes.*.precio' => 'required|numeric|min:0',
            'variantes.*.stock' => 'required|integer|min:0',
            'variantes.*.url_foto' => 'nullable|string',
            'variantes.*.colores' => 'nullable|array',
            'variantes.*.colores.*' => 'exists:colors,id',
        ]);

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

        DB::beginTransaction();
        try {
            $producto = Producto::create($request->only('nombre', 'id_categoria', 'url_foto'));
            $producto->tags()->sync($request->input('tags', []));

            foreach ($variantes as $vData) {
                $variante = $producto->variantes()->create([
                    'sku' => $vData['sku'] ?? null,
                    'id_talla' => $vData['id_talla'] ?: null,
                    'precio' => $vData['precio'],
                    'stock' => $vData['stock'],
                    'url_foto' => $vData['url_foto'] ?? null,
                ]);
                if (!empty($vData['colores'])) {
                    $variante->colores()->sync($vData['colores']);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return back()->with('status', 'Producto creado correctamente.');
    }

    public function productoUpdate(Request $request, string $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'id_categoria' => 'required|exists:categorias,id',
            'url_foto' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'variantes_new' => 'nullable|array',
            'variantes_new.*.sku' => 'nullable|string|max:50',
            'variantes_new.*.id_talla' => 'nullable|exists:tallas,id',
            'variantes_new.*.precio' => 'required|numeric|min:0',
            'variantes_new.*.stock' => 'required|integer|min:0',
            'variantes_new.*.url_foto' => 'nullable|string',
            'variantes_new.*.colores' => 'nullable|array',
            'variantes_new.*.colores.*' => 'exists:colors,id',
            'variantes_update' => 'nullable|array',
            'variantes_update.*.id' => 'required|exists:variantes,id',
            'variantes_update.*.sku' => 'nullable|string|max:50',
            'variantes_update.*.id_talla' => 'nullable|exists:tallas,id',
            'variantes_update.*.precio' => 'required|numeric|min:0',
            'variantes_update.*.stock' => 'required|integer|min:0',
            'variantes_update.*.url_foto' => 'nullable|string',
            'variantes_update.*.colores' => 'nullable|array',
            'variantes_update.*.colores.*' => 'exists:colors,id',
            'variantes_delete' => 'nullable|array',
            'variantes_delete.*' => 'integer',
        ]);

        $producto = Producto::findOrFail($id);
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

        DB::beginTransaction();
        try {
            $producto->update($request->only('nombre', 'id_categoria', 'url_foto'));
            $producto->tags()->sync($request->input('tags', []));

            // Delete
            if (!empty($variantesDelete)) {
                Variante::whereIn('id', $variantesDelete)
                    ->where('id_producto', $producto->id)
                    ->each(fn($v) => $v->delete());
            }

            // Update existing
            foreach ($variantesUpdate as $vData) {
                $variante = Variante::where('id', $vData['id'])
                    ->where('id_producto', $producto->id)
                    ->firstOrFail();
                $variante->update([
                    'sku' => $vData['sku'] ?? null,
                    'id_talla' => $vData['id_talla'] ?: null,
                    'precio' => $vData['precio'],
                    'stock' => $vData['stock'],
                    'url_foto' => $vData['url_foto'] ?? null,
                ]);
                $variante->colores()->sync($vData['colores'] ?? []);
            }

            // Create new
            foreach ($variantesNew as $vData) {
                $variante = $producto->variantes()->create([
                    'sku' => $vData['sku'] ?? null,
                    'id_talla' => $vData['id_talla'] ?: null,
                    'precio' => $vData['precio'],
                    'stock' => $vData['stock'],
                    'url_foto' => $vData['url_foto'] ?? null,
                ]);
                if (!empty($vData['colores'])) {
                    $variante->colores()->sync($vData['colores']);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return back()->with('status', 'Producto actualizado correctamente.');
    }

    public function productoDestroy(string $id)
    {
        Producto::findOrFail($id)->delete();

        return back()->with('status', 'Producto eliminado correctamente.');
    }

    // ── Variantes ──

    public function varianteStore(Request $request, string $id)
    {
        $request->validate([
            'sku' => 'nullable|string|max:50|unique:variantes,sku',
            'id_talla' => 'nullable|exists:tallas,id',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'url_foto' => 'nullable|string',
            'colores' => 'nullable|array',
            'colores.*' => 'exists:colors,id',
        ]);

        $producto = Producto::findOrFail($id);
        $variante = $producto->variantes()->create($request->only('sku', 'id_talla', 'precio', 'stock', 'url_foto'));

        if ($request->has('colores')) {
            $variante->colores()->sync($request->input('colores', []));
        }

        return back()->with('status', 'Variante creada correctamente.');
    }

    public function varianteUpdate(Request $request, string $id)
    {
        $variante = Variante::findOrFail($id);

        $request->validate([
            'sku' => 'nullable|string|max:50|unique:variantes,sku,' . $variante->id,
            'id_talla' => 'nullable|exists:tallas,id',
            'precio' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'url_foto' => 'nullable|string',
            'colores' => 'nullable|array',
            'colores.*' => 'exists:colors,id',
        ]);

        $variante->update($request->only('sku', 'id_talla', 'precio', 'stock', 'url_foto'));
        $variante->colores()->sync($request->input('colores', []));

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
        $categorias = Categoria::withCount('productos')
            ->when($request->input('search'), fn($q, $s) => $q->where('categoria', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Categorias', [
            'categorias' => $categorias,
            'filtros' => $request->only('search'),
        ]);
    }

    public function categoriaStore(Request $request)
    {
        $request->validate([
            'categoria' => 'required|string|max:150|unique:categorias,categoria',
        ]);

        Categoria::create($request->only('categoria'));

        return back()->with('status', 'Categoria creada correctamente.');
    }

    public function categoriaUpdate(Request $request, string $id)
    {
        $categoria = Categoria::findOrFail($id);

        $request->validate([
            'categoria' => 'required|string|max:150|unique:categorias,categoria,' . $categoria->id,
        ]);

        $categoria->update($request->only('categoria'));

        return back()->with('status', 'Categoria actualizada correctamente.');
    }

    public function categoriaDestroy(string $id)
    {
        $categoria = Categoria::withCount('productos')->findOrFail($id);

        if ($categoria->productos_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar una categoria con productos asociados.']);
        }

        $categoria->delete();

        return back()->with('status', 'Categoria eliminada correctamente.');
    }

    // ── Tallas ──

    public function tallas(Request $request)
    {
        $tallas = Talla::withCount('variantes')
            ->when($request->input('search'), fn($q, $s) => $q->where('talla', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Tallas', [
            'tallas' => $tallas,
            'filtros' => $request->only('search'),
        ]);
    }

    public function tallaStore(Request $request)
    {
        $request->validate([
            'talla' => 'required|string|max:50|unique:tallas,talla',
        ]);

        Talla::create($request->only('talla'));

        return back()->with('status', 'Talla creada correctamente.');
    }

    public function tallaUpdate(Request $request, string $id)
    {
        $talla = Talla::findOrFail($id);

        $request->validate([
            'talla' => 'required|string|max:50|unique:tallas,talla,' . $talla->id,
        ]);

        $talla->update($request->only('talla'));

        return back()->with('status', 'Talla actualizada correctamente.');
    }

    public function tallaDestroy(string $id)
    {
        $talla = Talla::withCount('variantes')->findOrFail($id);

        if ($talla->variantes_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar una talla con variantes asociadas.']);
        }

        $talla->delete();

        return back()->with('status', 'Talla eliminada correctamente.');
    }

    // ── Colores ──

    public function colores(Request $request)
    {
        $colores = Color::withCount('variantes')
            ->when($request->input('search'), fn($q, $s) => $q->where('color', 'like', "%{$s}%"))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Colores', [
            'colores' => $colores,
            'filtros' => $request->only('search'),
        ]);
    }

    public function colorStore(Request $request)
    {
        $request->validate([
            'color' => 'required|string|max:50',
            'cod_hex' => 'nullable|string|max:50',
            'tipo' => 'required|string|max:50',
        ]);

        $color = Color::create($request->only('color', 'cod_hex', 'tipo'));

        return back()->with('status', 'Color creado correctamente.');
    }

    public function colorUpdate(Request $request, string $id)
    {
        $request->validate([
            'color' => 'required|string|max:50',
            'cod_hex' => 'nullable|string|max:50',
            'tipo' => 'required|string|max:50',
        ]);

        Color::findOrFail($id)->update($request->only('color', 'cod_hex', 'tipo'));

        return back()->with('status', 'Color actualizado correctamente.');
    }

    public function colorDestroy(string $id)
    {
        $color = Color::withCount('variantes')->findOrFail($id);

        if ($color->variantes_count > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar un color con variantes asociadas.']);
        }

        $color->delete();

        return back()->with('status', 'Color eliminado correctamente.');
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
