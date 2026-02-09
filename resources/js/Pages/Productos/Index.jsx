import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';

const ProductCard = ({ producto }) => {
    const allColors = producto.variantes.flatMap(variante => variante.colores);

    const uniqueColors = [
        ...new Map(allColors.map(color => [color.cod_hex, color])).values()
    ];
    const precio = producto.variantes[0]?.precio || "Consultar";
    return ( 
        <div className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* Imagen Principal */}
            <div className="relative h-64 overflow-hidden bg-gray-100">
                <img 
                    src={producto.url_foto} 
                    alt={producto.nombre} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Tags Flotantes (De tu array "tags") */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {producto.tags.map(tag => (
                        <span key={tag.id} className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {tag.descripcion}
                        </span>
                    ))}
                </div>
            </div>

            {/* Cuerpo de la Tarjeta */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex-1">
                    {/* Categoría (Si tienes el nombre en el objeto categoria, si no, usa el ID por ahora) */}
                    <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">
                        Categoría {producto.id_categoria}
                    </p>
                    
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                        {producto.nombre}
                    </h3>

                    {/* Burbujas de Colores Disponibles */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {uniqueColors.length > 0 ? (
                            uniqueColors.map(color => (
                                <div 
                                    key={color.id} 
                                    className="w-5 h-5 rounded-full border border-gray-300 shadow-sm ring-1 ring-white"
                                    style={{ backgroundColor: color.cod_hex }}
                                    title={color.color} // Tooltip nativo con el nombre
                                />
                            ))
                        ) : (
                            <span className="text-xs text-gray-400">Sin colores</span>
                        )}
                    </div>
                </div>

                {/* Footer: Precio y Botón */}
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                    <span className="text-xl font-bold text-gray-900">
                        {typeof precio === 'number' ? `$${precio}` : precio}
                    </span>
                    
                    <Link 
                        href={`/catalogo/${producto.id}`} 
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        Ver detalles &rarr;
                    </Link>
                </div>
            </div>
        </div>
    ); };

export default function Index({productos, categorias, filtros}){

    const [search, setSearch] = useState(filtros.search || '');
    const [selectedCategory, setSelectedCategory] = useState(
        filtros.categoria || ''
    );

    const applyFilters = (term, cat) => {
        router.get('/catalogo', { 
            search: term,
            id_categoria: cat
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        // Esperamos 300ms antes de pedir al servidor para no saturarlo
        setTimeout(() => applyFilters(val, selectedCategory), 300);
    };

    const handleCategorySelect = (id) => {
    const idStr = id.toString();
    
    // Si el usuario hace click en la categoría que YA está seleccionada, la desmarcamos (filtro vacío)
    // Si no, seleccionamos la nueva.
    const newSelection = selectedCategory === idStr ? '' : idStr;

    setSelectedCategory(newSelection);
    applyFilters(search, newSelection);
    };



    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <Head title="Catálogo de Productos" />

            {/* Header simple */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">Nuestra Colección</h1>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
                
                {/* --- SIDEBAR (Filtros) --- */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
                    {/* Buscador */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold mb-4 text-gray-900">Buscar</h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={search}
                                onChange={handleSearch}
                                placeholder="Buscar joya..." 
                                className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Categorías Multi-Select */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="font-semibold mb-4 text-gray-900">Categorías</h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                            {categorias.map(cat => (
                <label key={cat.id} className="flex items-center group cursor-pointer">
        <input 
            type="radio" // CAMBIO AQUÍ
            name="categoria_filter" // Importante para que el navegador sepa que son grupo
            value={cat.id}
            // Verificamos si es IGUAL al seleccionado
            checked={selectedCategory === cat.id.toString()}
            // Usamos la nueva función
            onChange={() => handleCategorySelect(cat.id)}
            className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer"
        />
        <span className={`ml-3 text-sm transition-colors ${
            selectedCategory === cat.id.toString() ? 'font-bold text-indigo-700' : 'text-gray-600'
        }`}>
            {cat.categoria}
        </span>
    </label>
))}
                        </div>
                    </div>
                </aside>

                {/* --- GRID DE PRODUCTOS --- */}
                <div className="flex-1">
                    {productos.data.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productos.data.map(producto => (
                                <ProductCard key={producto.id} producto={producto} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 text-lg">No encontramos productos con esos filtros.</p>
                            <button 
                                onClick={() => { setSearch(''); setSelectedCategory([]); applyFilters('', []); }}
                                className="mt-4 text-indigo-600 hover:underline font-medium"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}

                    {/* Paginación */}
                    <div className="mt-10 flex justify-center">
                         <div className="flex gap-1 flex-wrap justify-center">
                            {productos.links.map((link, key) => (
                                link.url ? (
                                    <Link
                                        key={key}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                            link.active 
                                                ? 'bg-indigo-600 text-white font-medium shadow-md' 
                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                        }`}
                                    />
                                ) : (
                                    <span 
                                        key={key} 
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-4 py-2 text-sm text-gray-400 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                                    />
                                )
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}