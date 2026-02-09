import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Show({ producto, relacionados }) {
    const allImages = [
        producto.url_foto, 
        ...producto.variantes.map(v => v.url_foto)
    ].filter(img => img !== null && img !== '');
    
    const uniqueImages = [...new Set(allImages)];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev === uniqueImages.length - 1 ? 0 : prev + 1));
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? uniqueImages.length - 1 : prev - 1));
    };

    return (
        <>
        <div className="min-h-screen bg-gray-50 py-8">
            <Head title={producto.nombre} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Navegación (Breadcrumb) */}
                <div className="mb-6 flex items-center text-sm text-gray-500">
                    <Link href="/catalogo" className="hover:text-black transition">Catálogo</Link>
                    <span className="mx-2">/</span>
                    <span className="font-medium text-gray-900">{producto.nombre}</span>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        
                        {/* --- ZONA A: CARRUSEL DE IMÁGENES --- */}
                        <div className="relative bg-gray-100 h-[400px] lg:h-[600px] flex items-center justify-center group">
                            
                            {/* Imagen Actual */}
                            <img 
                                src={uniqueImages[currentImageIndex] || 'https://via.placeholder.com/600'} 
                                alt="Producto" 
                                className="max-h-full max-w-full object-contain mix-blend-multiply transition-opacity duration-300"
                            />

                            {/* Flechas (Solo se muestran si hay más de 1 imagen) */}
                            {uniqueImages.length > 1 && (
                                <>
                                    {/* Flecha Izquierda */}
                                    <button 
                                        onClick={prevImage}
                                        className="absolute left-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>

                                    {/* Flecha Derecha */}
                                    <button 
                                        onClick={nextImage}
                                        className="absolute right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>

                                    {/* Indicadores (Puntitos abajo) */}
                                    <div className="absolute bottom-4 flex gap-2">
                                        {uniqueImages.map((_, idx) => (
                                            <div 
                                                key={idx}
                                                className={`h-2 w-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-black w-4' : 'bg-gray-400'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* --- ZONA B: INFORMACIÓN Y LISTA DE VARIANTES --- */}
                        <div className="p-8 flex flex-col h-full overflow-y-auto">
                            
                            {/* Cabecera del Producto */}
                            <div className="mb-8 border-b pb-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{producto.nombre}</h1>
                                <p className="text-gray-500">{producto.categoria?.nombre}</p>
                                
                                {/* Tags */}
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {producto.tags.map(tag => (
                                        <span key={tag.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tag.descripcion || tag.nombre}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* --- LISTA DE VARIANTES (FILAS) --- */}
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Opciones Disponibles</h3>
                            
                            <div className="flex-1 space-y-3">
                                {producto.variantes.map((variante) => (
                                    <div 
                                        key={variante.id} 
                                        className="group flex flex-wrap md:flex-nowrap items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
                                    >
                                        {/* Columna 1: Info Visual (Color/Talla) */}
                                        <div className="flex items-center gap-4 w-full md:w-auto mb-2 md:mb-0">
                                            {/* Burbuja de color */}
                                            {variante.colores && variante.colores.length > 0 ? (
                                                <div 
                                                    className="w-10 h-10 rounded-full border shadow-sm ring-1 ring-white"
                                                    style={{ backgroundColor: variante.colores[0].cod_hex }}
                                                    title={variante.colores[0].color}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">N/A</div>
                                            )}
                                            
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {variante.colores?.[0]?.color || 'Estándar'} 
                                                    <span className="text-gray-400 mx-2">|</span> 
                                                    Talla: {variante.talla?.nombre || 'Única'}
                                                </p>
                                                <p className="text-xs text-gray-500">SKU: {variante.sku}</p>
                                            </div>
                                        </div>

                                        {/* Columna 2: Precio y Stock */}
                                        <div className="flex items-center justify-between w-full md:w-auto gap-6">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">${variante.precio}</p>
                                                {/* Aviso de stock bajo (Solo si es 1) */}
                                                {variante.stock === 1 && (
                                                    <p className="text-xs text-orange-600 font-semibold animate-pulse">¡Última unidad!</p>
                                                )}
                                            </div>

                                            {/* BOTÓN CARRITO 🛒 */}
                                            <button 
                                                className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors active:scale-95 shadow-lg group-hover:bg-indigo-600"
                                                title="Añadir al carrito"
                                                onClick={() => console.log('Añadir al carrito variant ID:', variante.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
</div>        

<div className="mt-16 border-t pt-10">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">
        También te podría interesar
    </h2>

    {relacionados.data.length > 0 ? (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relacionados.data.map((rel) => (
                    // Reutilizas tu componente ProductCard aquí
                    // O creas una tarjeta simplificada
                    <div key={rel.id} className="border rounded-lg p-4 group">
                        <Link href={`/catalogo/${rel.id}`}>
                            <div className="aspect-square bg-gray-100 mb-4 overflow-hidden rounded-md">
                                <img 
                                    src={rel.url_foto} 
                                    alt={rel.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                            </div>
                            <h3 className="font-medium text-gray-900">{rel.nombre}</h3>
                            <p className="text-sm text-gray-500 mb-2">
                                {rel.coincidencias} Tags en común {/* Debug visual opcional */}
                            </p>
                            <p className="font-bold text-gray-900">
                                ${rel.variantes[0]?.precio || 'Ver precio'}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Paginación de Relacionados */}
            <div className="mt-8 flex justify-center gap-2">
                {relacionados.links.map((link, i) => (
                    link.url ? (
                        <Link
                            key={i}
                            href={link.url}
                            className={`px-3 py-1 border rounded ${link.active ? 'bg-black text-white' : 'bg-white'}`}
                            preserveScroll // IMPORTANTE: Para que no suba al inicio de la página al cambiar de página
                            only={['relacionados']} // OPTIMIZACIÓN: Solo recarga esta parte, no el producto principal
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ) : null
                ))}
            </div>
        </>
    ) : (
        <p className="text-gray-500">No hay productos relacionados por el momento.</p>
    )}
</div>
</>
    );
}