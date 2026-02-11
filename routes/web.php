<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;

// Public routes
Route::get('/', [CatalogoController::class, 'home'])->name('home');
Route::get('/catalogo', [CatalogoController::class, 'index'])->name('catalogo.index');
Route::get('/catalogo/{id}', [CatalogoController::class, 'show'])->name('catalogo.show');

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

    // Tallas
    Route::get('/tallas', [AdminController::class, 'tallas'])->name('admin.tallas');
    Route::post('/tallas', [AdminController::class, 'tallaStore'])->name('admin.tallas.store');
    Route::put('/tallas/{id}', [AdminController::class, 'tallaUpdate'])->name('admin.tallas.update');
    Route::delete('/tallas/{id}', [AdminController::class, 'tallaDestroy'])->name('admin.tallas.destroy');

    // Colores
    Route::get('/colores', [AdminController::class, 'colores'])->name('admin.colores');
    Route::post('/colores', [AdminController::class, 'colorStore'])->name('admin.colores.store');
    Route::put('/colores/{id}', [AdminController::class, 'colorUpdate'])->name('admin.colores.update');
    Route::delete('/colores/{id}', [AdminController::class, 'colorDestroy'])->name('admin.colores.destroy');

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
