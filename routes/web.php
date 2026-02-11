<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\CatalogoController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\IsAdmin;
use Inertia\Inertia;

Route::get('/', [CatalogoController::class, 'home'])->name('home');

Route::get('/catalogo', [CatalogoController::class, 'index'])->name('catalogo.index');

Route::get('/catalogo/{id}', [CatalogoController::class, 'show'])->name('catalogo.show');

Route::middleware('guest')->group( function(){
    Route::post('/login', [LoginController::class, 'store']);

    Route::get('/login', [LoginController::class, 'create'])->name('login');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/logout', [LoginController::class, 'destroy'])->name('logout'); 
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', IsAdmin::class])->group( function(){
    Route::get('/admin/dashboard', function(){return Inertia::render('Admin/Dashboard'); });
    Route::post('/admin/crear-producto', [CatalogoController::class, 'store']);
    //Route::get('/admin/crear-producto', [CatalogoController::class, 'create']);
    //Route::get('/admin/crear-producto', [CatalogoController::class, 'create']);
    //Route::get('/admin/crear-producto', [CatalogoController::class, 'show($id)']);
});

require __DIR__.'/auth.php';
