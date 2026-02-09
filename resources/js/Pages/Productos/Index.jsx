import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';


const HeroSection = ({ novedades, categorias, onCategorySelect }) => (
    <div className="mb-16 animate-fade-in space-y-12">
        
        {/* 1. BANNER PRINCIPAL */}
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl text-white">
            {/* Fondo con gradiente y posible imagen */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-transparent opacity-90 z-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-40"></div>
            
            <div className="relative z-20 px-8 py-16 md:py-24 md:px-16 max-w-3xl">
                <span className="uppercase tracking-widest text-xs font-bold text-indigo-400 mb-2 block">
                    Colección 2026
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                    Redefine tu estilo con <span className="text-indigo-400">exclusividad.</span>
                </h1>
                <p className="text-gray-300 text-lg mb-8 max-w-lg">
                    Descubre las piezas que marcan tendencia esta temporada. Calidad premium y diseño que habla por ti.
                </p>
                <button 
                    onClick={() => document.getElementById('catalogo-grid').scrollIntoView({ behavior: 'smooth' })}
                    className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                >
                    Ver Catálogo Completo
                </button>
            </div>
        </div>

        {/* 2. CATEGORÍAS DESTACADAS (Burbujas) */}
        <div className="px-2">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Explora por Categoría</h2>
            <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
                {categorias.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => onCategorySelect(cat.id)}
                        className="snap-center flex-shrink-0 flex flex-col items-center group cursor-pointer min-w-[100px]"
                    >
                        <div className="w-24 h-24 rounded-full bg-gray-100 mb-3 overflow-hidden border-2 border-gray-100 group-hover:border-indigo-600 group-hover:shadow-lg transition-all duration-300">
                             {/* Placeholder visual con las iniciales o imagen aleatoria */}
                            <img 
                                src={`https://ui-avatars.com/api/?name=${cat.nombre}&background=random&size=128`} 
                                alt={cat.nombre} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                            {cat.nombre}
                        </span>
                    </button>
                ))}
            </div>
        </div>
        {/* 3. RECIÉN LLEGADOS (Mini Grid) */}
        {novedades && novedades.length > 0 && (
            <div>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-bold text-gray-900">Recién Llegados 🔥</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {novedades.map(nov => (
                         <Link key={nov.id} href={`/catalogo/${nov.id}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                            <div className="aspect-[4/5] bg-gray-50 overflow-hidden relative">
                                <img 
                                    src={nov.url_foto || 'https://via.placeholder.com/300'} 
                                    alt={nov.nombre} 
                                    className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                />
                                {nov.variantes[0]?.precio && (
                                    <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                                        ${nov.variantes[0].precio}
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-gray-900 truncate">{nov.nombre}</h3>
                            </div>
                         </Link>
                    ))}
                </div>
            </div>
        )}
    </div>
);


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

export default function Index({productos, categorias, filtros, novedades, esLanding}){

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
            replace: true,
            onSuccess: () => {
                if(term || cat) {
                   document.getElementById('catalogo-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
            }
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

    const handleHeroCategoryClick = (catId) => {
        setSelectedCategory(catId.toString());
        applyFilters(search, catId.toString());
        // Scroll suave al grid
        setTimeout(() => document.getElementById('catalogo-grid').scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const showHero = esLanding && !search && !selectedCategory;

    // Función para hacer scroll con "Offset" (Desplazamiento personalizado)
    const scrollToGrid = () => {
    const element = document.getElementById('catalogo-grid');
    
    if (element) {
        // 1. ¿Cuánto mide tu menú fijo? (Ajusta este número)
        // Si quieres que quede más abajo, aumenta este número.
        // Si quieres que quede más arriba, disminúyelo.
        const headerOffset = 120; 

        // 2. Calculamos la posición exacta
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // 3. Hacemos el scroll manual
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
};


    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
            <Head title="Tienda Online" />

            {/* Navbar Simple */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div 
                        className="text-2xl font-black text-gray-900 tracking-tighter cursor-pointer"
                        onClick={() => {
                            setSearch('');
                            setSelectedCategory('');
                            router.get('/catalogo'); // Reset total
                        }}
                    >
                        MI TIENDA<span className="text-indigo-600">.</span>
                    </div>
                    {/* Buscador en Header (Opcional) */}
                    <div className="hidden md:block w-1/3">
                        <input 
                            type="text" 
                            placeholder="Buscar productos..." 
                            value={search}
                            onChange={handleSearch}
                            className="w-full bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                
                {/* --- RENDERIZADO CONDICIONAL DEL HERO --- */}
                {showHero && (
                    <HeroSection 
                        novedades={novedades} 
                        categorias={categorias}
                        onCategorySelect={handleHeroCategoryClick}
                    />
                )}

                {/* --- SECCIÓN CATÁLOGO (ID para el scroll) --- */}
                <div id="catalogo-grid" className={`transition-all duration-500 ${showHero ? '' : 'mt-4'}`}>
                    
                    <div className="flex flex-col md:flex-row gap-8">
                        
                        {/* SIDEBAR FILTROS */}
                        <aside className="w-full md:w-64 flex-shrink-0">
                            <div className="sticky top-24 space-y-8">
                                {/* Buscador Móvil */}
                                <div className="md:hidden">
                                    <input 
                                        type="text" 
                                        placeholder="Buscar..." 
                                        value={search}
                                        onChange={handleSearch}
                                        className="w-full border-gray-300 rounded-lg"
                                    />
                                </div>

                                {/* Lista de Categorías */}
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Filtrar por</h3>
                                    <div className="space-y-2">
                                        {categorias.map(cat => (
                                            <label key={cat.id} className="flex items-center cursor-pointer group">
                                                <input 
                                                    type="radio" 
                                                    name="cat_filter"
                                                    checked={selectedCategory === cat.id.toString()}
                                                    onChange={() => handleCategorySelect(cat.id)}
                                                    className="text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <span className={`ml-3 text-sm group-hover:text-indigo-600 transition ${selectedCategory === cat.id.toString() ? 'font-bold text-indigo-700' : 'text-gray-600'}`}>
                                                    {cat.categoria}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {/* Botón limpiar */}
                                    {(search || selectedCategory) && (
                                        <button 
                                            onClick={() => { setSearch(''); setSelectedCategory(''); applyFilters('', ''); }}
                                            className="mt-4 w-full py-2 text-xs font-bold text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
                                        >
                                            Limpiar Filtros
                                        </button>
                                    )}
                                </div>
                            </div>
                        </aside>

                        {/* GRID PRODUCTOS */}
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {search || selectedCategory ? 'Resultados de búsqueda' : 'Catálogo Completo'}
                                </h2>
                                <span className="text-sm text-gray-500">{productos.total} productos</span>
                            </div>

                            {productos.data.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {productos.data.map(prod => (
                                        <ProductCard key={prod.id} producto={prod} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-500">No encontramos nada con esos filtros.</p>
                                </div>
                            )}

                            {/* PAGINACIÓN */}
                            <div className="mt-12 flex justify-center gap-2">
                                {productos.links.map((link, i) => (
                                    link.url && (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            preserveScroll
                                            onSuccess={scrollToGrid}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-4 py-2 text-sm rounded-lg border ${link.active ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        />
                                    )
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}