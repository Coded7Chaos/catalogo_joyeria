<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;

// Public routes
Route::get('/', [CatalogoController::class, 'home'])->name('home');
Route::get('/catalogo', [CatalogoController::class, 'index'])->name('catalogo.index');
Route::get('/categoria/{slug}', [CatalogoController::class, 'categoria'])->name('categoria.show');
Route::get('/producto/{slug}', [CatalogoController::class, 'show'])->name('producto.show');
// Old product links (/catalogo/15) redirect to the product's own URL.
Route::get('/catalogo/{id}', [CatalogoController::class, 'showPorId'])->whereNumber('id')->name('catalogo.show');

// SEO
Route::get('/sitemap.xml', [CatalogoController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [CatalogoController::class, 'robots'])->name('robots');

// Authenticated user routes
Route::middleware('auth')->group(function () {
    Route::get('/mi-cuenta', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/mi-cuenta', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/mi-cuenta', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', IsAdmin::class])->prefix('admin')->group(function () {
    Route::get('/', [AdminController::class, 'dashboard'])->name('admin.dashboard');

    // Image upload
    Route::post('/upload-image', [AdminController::class, 'uploadImage'])->name('admin.upload-image');

    // Productos
    Route::get('/productos', [AdminController::class, 'productos'])->name('admin.productos');
    Route::post('/productos', [AdminController::class, 'productoStore'])->name('admin.productos.store');
    Route::put('/productos/{id}', [AdminController::class, 'productoUpdate'])->name('admin.productos.update');
    Route::delete('/productos/{id}', [AdminController::class, 'productoDestroy'])->name('admin.productos.destroy');

    // Variantes
    Route::post('/productos/{id}/variantes', [AdminController::class, 'varianteStore'])->name('admin.variantes.store');
    Route::put('/variantes/{id}', [AdminController::class, 'varianteUpdate'])->name('admin.variantes.update');
    Route::delete('/variantes/{id}', [AdminController::class, 'varianteDestroy'])->name('admin.variantes.destroy');

    // Usuarios
    Route::get('/usuarios', [AdminController::class, 'usuarios'])->name('admin.usuarios');
    Route::put('/usuarios/{id}', [AdminController::class, 'usuarioUpdate'])->name('admin.usuarios.update');
    Route::delete('/usuarios/{id}', [AdminController::class, 'usuarioDestroy'])->name('admin.usuarios.destroy');

    // Categorias
    Route::get('/categorias', [AdminController::class, 'categorias'])->name('admin.categorias');
    Route::post('/categorias', [AdminController::class, 'categoriaStore'])->name('admin.categorias.store');
    Route::put('/categorias/{id}', [AdminController::class, 'categoriaUpdate'])->name('admin.categorias.update');
    Route::delete('/categorias/{id}', [AdminController::class, 'categoriaDestroy'])->name('admin.categorias.destroy');

    // Atributos de las variantes (Talla, Color, Material…) y sus valores
    Route::get('/atributos', [AdminController::class, 'atributos'])->name('admin.atributos');
    Route::post('/atributos', [AdminController::class, 'atributoStore'])->name('admin.atributos.store');
    Route::put('/atributos/{id}', [AdminController::class, 'atributoUpdate'])->name('admin.atributos.update');
    Route::delete('/atributos/{id}', [AdminController::class, 'atributoDestroy'])->name('admin.atributos.destroy');
    Route::post('/atributos/{id}/valores', [AdminController::class, 'valorStore'])->name('admin.valores.store');
    Route::put('/valores/{id}', [AdminController::class, 'valorUpdate'])->name('admin.valores.update');
    Route::delete('/valores/{id}', [AdminController::class, 'valorDestroy'])->name('admin.valores.destroy');

    // SEO
    Route::get('/seo', [AdminController::class, 'seo'])->name('admin.seo');
    Route::put('/seo', [AdminController::class, 'seoUpdate'])->name('admin.seo.update');

    // Tags
    Route::get('/tags', [AdminController::class, 'tags'])->name('admin.tags');
    Route::post('/tags', [AdminController::class, 'tagStore'])->name('admin.tags.store');
    Route::put('/tags/{id}', [AdminController::class, 'tagUpdate'])->name('admin.tags.update');
    Route::delete('/tags/{id}', [AdminController::class, 'tagDestroy'])->name('admin.tags.destroy');

    // Proveedores
    Route::get('/proveedores', [AdminController::class, 'proveedores'])->name('admin.proveedores');
    Route::post('/proveedores', [AdminController::class, 'proveedorStore'])->name('admin.proveedores.store');
    Route::put('/proveedores/{id}', [AdminController::class, 'proveedorUpdate'])->name('admin.proveedores.update');
    Route::delete('/proveedores/{id}', [AdminController::class, 'proveedorDestroy'])->name('admin.proveedores.destroy');
});

require __DIR__ . '/auth.php';
