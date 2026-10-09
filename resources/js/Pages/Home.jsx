import { useState, useRef, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

/* ── Novedad Card (premium, distinto al catálogo) ── */
const NovedadCard = ({ producto }) => {
    const prices = producto.variantes.map(v => parseFloat(v.precio)).filter(p => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return (
        <Link
            href={`/catalogo/${producto.id}`}
            className="group relative flex-shrink-0 w-[280px] sm:w-auto"
        >
            {/* Imagen con overlay */}
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
                <img
                    src={producto.variantes?.[0]?.url_foto || '/placeholder.jpg'}
                    alt={producto.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay oscuro que aparece al hover */}
                <div className="absolute inset-0 bg-joya-black/0 group-hover:bg-joya-black/40 transition-colors duration-500" />

                {/* Badge NUEVO */}
                <div className="absolute top-4 left-4">
                    <span className="bg-joya-gold text-joya-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5">
                        Nuevo
                    </span>
                </div>

                {/* Info flotante abajo */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    {producto.tags && producto.tags.length > 0 && (
                        <div className="flex gap-2 mb-2">
                            {producto.tags.slice(0, 2).map(tag => (
                                <span key={tag.id} className="text-joya-gold text-[10px] uppercase tracking-wider font-medium">
                                    {tag.descripcion}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3 className="text-white font-semibold text-base leading-tight mb-1 line-clamp-2">
                        {producto.nombre}
                    </h3>
                    {minPrice && (
                        <p className="text-joya-gold font-bold text-lg">
                            Bs. {minPrice.toFixed(2)}
                        </p>
                    )}
                </div>

                {/* Botón hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white text-joya-black text-xs font-semibold uppercase tracking-wider px-5 py-2.5">
                        Ver Detalle
                    </span>
                </div>
            </div>
        </Link>
    );
};

/* ── Product Card (catálogo estándar) ── */
const ProductCard = ({ producto }) => {
    const allColors = producto.variantes.flatMap(v => v.colores || []);
    const uniqueColors = [...new Map(allColors.map(c => [c.cod_hex, c])).values()];
    const prices = producto.variantes.map(v => parseFloat(v.precio)).filter(p => !isNaN(p));
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return (
        <div className="group bg-white border border-joya-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
            <Link href={`/catalogo/${producto.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-joya-cream relative">
                    <img
                        src={producto.variantes?.[0]?.url_foto || '/placeholder.jpg'}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {producto.tags && producto.tags.length > 0 && (
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                            {producto.tags.slice(0, 2).map(tag => (
                                <span key={tag.id} className="bg-joya-black/80 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider">
                                    {tag.descripcion}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </Link>
            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <Link href={`/catalogo/${producto.id}`}>
                        <h3 className="font-semibold text-joya-black text-sm leading-tight mb-3 line-clamp-2 hover:text-joya-gold transition-colors">
                            {producto.nombre}
                        </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mb-3">
                        {uniqueColors.slice(0, 5).map(color => (
                            <div key={color.id} className="w-4 h-4 rounded-full border border-joya-border" style={{ backgroundColor: color.cod_hex }} title={color.color} />
                        ))}
                        {uniqueColors.length > 5 && <span className="text-[10px] text-joya-gray">+{uniqueColors.length - 5}</span>}
                    </div>
                </div>
                <div className="flex items-center justify-between border-t border-joya-border pt-3 mt-auto">
                    <div>
                        <span className="text-xs text-joya-gray">Desde</span>
                        <p className="text-joya-black font-bold text-lg">{minPrice ? `Bs. ${minPrice.toFixed(2)}` : 'Consultar'}</p>
                    </div>
                    <Link href={`/catalogo/${producto.id}`} className="text-joya-gold text-sm font-medium hover:text-joya-gold-hover transition-colors">
                        Ver detalles →
                    </Link>
                </div>
            </div>
        </div>
    );
};

/* ── Página principal ── */
export default function Home({ categorias, novedades, totalProductos, productos, colores, tallas, tags, rangoPrecio, filtros }) {

    /* ── Estado de filtros del catálogo ── */
    const [search, setSearch] = useState(filtros.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filtros.id_categoria || '');
    const [selectedColores, setSelectedColores] = useState(filtros.colores || []);
    const [selectedTallas, setSelectedTallas] = useState(filtros.tallas || []);
    const [selectedTags, setSelectedTags] = useState(filtros.tags || []);
    const [precioMin, setPrecioMin] = useState(filtros.precio_min || '');
    const [precioMax, setPrecioMax] = useState(filtros.precio_max || '');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const debounceRef = useRef(null);

    const buildFilters = useCallback((overrides = {}) => {
        const f = {
            search: overrides.search !== undefined ? overrides.search : search,
            id_categoria: overrides.id_categoria !== undefined ? overrides.id_categoria : selectedCategory,
            colores: overrides.colores !== undefined ? overrides.colores : selectedColores,
            tallas: overrides.tallas !== undefined ? overrides.tallas : selectedTallas,
            tags: overrides.tags !== undefined ? overrides.tags : selectedTags,
            precio_min: overrides.precio_min !== undefined ? overrides.precio_min : precioMin,
            precio_max: overrides.precio_max !== undefined ? overrides.precio_max : precioMax,
        };
        const params = {};
        if (f.search) params.search = f.search;
        if (f.id_categoria) params.id_categoria = f.id_categoria;
        if (f.colores?.length) params.colores = f.colores;
        if (f.tallas?.length) params.tallas = f.tallas;
        if (f.tags?.length) params.tags = f.tags;
        if (f.precio_min) params.precio_min = f.precio_min;
        if (f.precio_max) params.precio_max = f.precio_max;
        return params;
    }, [search, selectedCategory, selectedColores, selectedTallas, selectedTags, precioMin, precioMax]);

    const applyFilters = useCallback((overrides = {}) => {
        const params = buildFilters(overrides);
        router.get('/', params, { preserveState: true, preserveScroll: true, replace: true });
    }, [buildFilters]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => applyFilters({ search: val }), 400);
    };

    const toggle = (arr, id) => arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id];

    const handleCategoryToggle = (catId) => {
        const s = catId.toString();
        const v = selectedCategory === s ? '' : s;
        setSelectedCategory(v);
        applyFilters({ id_categoria: v });
    };
    const handleColorToggle = (id) => { const s = id.toString(); const n = toggle(selectedColores, s); setSelectedColores(n); applyFilters({ colores: n }); };
    const handleTallaToggle = (id) => { const s = id.toString(); const n = toggle(selectedTallas, s); setSelectedTallas(n); applyFilters({ tallas: n }); };
    const handleTagToggle = (id) => { const s = id.toString(); const n = toggle(selectedTags, s); setSelectedTags(n); applyFilters({ tags: n }); };

    const handlePrecioChange = (type, value) => {
        if (type === 'min') { setPrecioMin(value); } else { setPrecioMax(value); }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => applyFilters(type === 'min' ? { precio_min: value } : { precio_max: value }), 400);
    };

    const clearFilters = () => {
        setSearch(''); setSelectedCategory(''); setSelectedColores([]); setSelectedTallas([]); setSelectedTags([]); setPrecioMin(''); setPrecioMax('');
        router.get('/', {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = search || selectedCategory || selectedColores.length || selectedTallas.length || selectedTags.length || precioMin || precioMax;

    const activeChips = [];
    if (search) activeChips.push({ label: `"${search}"`, onRemove: () => { setSearch(''); applyFilters({ search: '' }); } });
    if (selectedCategory) { const c = categorias.find(c => c.id.toString() === selectedCategory); activeChips.push({ label: c?.categoria || 'Categoría', onRemove: () => { setSelectedCategory(''); applyFilters({ id_categoria: '' }); } }); }
    selectedColores.forEach(id => { const c = colores.find(c => c.id.toString() === id); activeChips.push({ label: c?.color || 'Color', onRemove: () => handleColorToggle(id) }); });
    selectedTallas.forEach(id => { const t = tallas.find(t => t.id.toString() === id); activeChips.push({ label: `Talla ${t?.talla || ''}`, onRemove: () => handleTallaToggle(id) }); });
    selectedTags.forEach(id => { const t = tags.find(t => t.id.toString() === id); activeChips.push({ label: t?.descripcion || 'Tag', onRemove: () => handleTagToggle(id) }); });

    /* ── Sidebar de filtros ── */
    const FilterSidebar = () => (
        <div className="space-y-6">
            {/* Búsqueda */}
            <div>
                <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-2 block">Buscar</label>
                <div className="relative">
                    <input type="text" placeholder="Nombre del producto..." value={search} onChange={handleSearchChange}
                        className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm bg-white focus:border-joya-gold focus:ring-1 focus:ring-joya-gold placeholder:text-joya-gray/50" />
                    <svg className="w-4 h-4 text-joya-gray absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Categorías */}
            <div>
                <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">Categorías</label>
                <div className="space-y-2">
                    {categorias.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={selectedCategory === cat.id.toString()} onChange={() => handleCategoryToggle(cat.id)}
                                className="w-4 h-4 rounded border-joya-border text-joya-gold focus:ring-joya-gold cursor-pointer" />
                            <span className={`text-sm transition-colors ${selectedCategory === cat.id.toString() ? 'text-joya-black font-medium' : 'text-joya-gray group-hover:text-joya-black'}`}>{cat.categoria}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Colores */}
            {colores?.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">Colores</label>
                    <div className="flex flex-wrap gap-2">
                        {colores.map(color => (
                            <button key={color.id} onClick={() => handleColorToggle(color.id)} title={color.color}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColores.includes(color.id.toString()) ? 'border-joya-gold scale-110 shadow-md' : 'border-joya-border hover:border-joya-gray'}`}
                                style={{ backgroundColor: color.cod_hex }} />
                        ))}
                    </div>
                </div>
            )}

            {/* Tallas */}
            {tallas?.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">Tallas</label>
                    <div className="flex flex-wrap gap-2">
                        {tallas.map(talla => (
                            <button key={talla.id} onClick={() => handleTallaToggle(talla.id)}
                                className={`px-3 py-1.5 text-sm border rounded-lg transition-all ${selectedTallas.includes(talla.id.toString()) ? 'bg-joya-black text-white border-joya-black' : 'bg-white text-joya-gray border-joya-border hover:border-joya-black hover:text-joya-black'}`}>
                                {talla.talla}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Precio */}
            {rangoPrecio && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">Precio</label>
                    <div className="flex items-center gap-2">
                        <input type="number" placeholder={`${rangoPrecio.min || 0}`} value={precioMin} onChange={(e) => handlePrecioChange('min', e.target.value)}
                            className="w-full border border-joya-border rounded-lg px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                        <span className="text-joya-gray text-sm">—</span>
                        <input type="number" placeholder={`${rangoPrecio.max || 999}`} value={precioMax} onChange={(e) => handlePrecioChange('max', e.target.value)}
                            className="w-full border border-joya-border rounded-lg px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                    </div>
                </div>
            )}

            {/* Tags */}
            {tags?.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">Etiquetas</label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button key={tag.id} onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 text-xs border rounded-full transition-all ${selectedTags.includes(tag.id.toString()) ? 'bg-joya-gold text-joya-black border-joya-gold font-medium' : 'bg-white text-joya-gray border-joya-border hover:border-joya-gold hover:text-joya-gold'}`}>
                                {tag.descripcion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full py-2.5 text-sm font-medium text-joya-gray border border-joya-border rounded-lg hover:bg-joya-cream hover:text-joya-black transition-colors">
                    Limpiar todos los filtros
                </button>
            )}
        </div>
    );

    return (
        <CatalogoLayout>
            <Head title="Inicio" />

            {/* ═══════ HERO ═══════ */}
            <section className="relative bg-joya-black overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515562141589-67f0d4da0001?w=1920&q=80')" }} />
                <div className="absolute inset-0 bg-joya-black/60" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
                    <div className="max-w-2xl">
                        <p className="text-joya-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Colección Exclusiva</p>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                            Elegancia que<br /><span className="text-joya-gold">define tu estilo</span>
                        </h1>
                        <p className="text-white/60 text-lg mb-10 max-w-lg leading-relaxed">
                            Descubre piezas únicas de joyería artesanal. Cada detalle cuenta una historia de sofisticación y buen gusto.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#catalogo" className="inline-flex items-center px-8 py-3.5 bg-joya-gold text-joya-black font-semibold text-sm uppercase tracking-wider hover:bg-joya-gold-hover transition-colors">
                                Explorar Colección
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </a>
                            <span className="inline-flex items-center px-6 py-3.5 border border-white/20 text-white/60 text-sm">
                                {totalProductos}+ productos disponibles
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CATEGORÍAS ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-12">
                    <p className="text-joya-gold text-sm uppercase tracking-[0.2em] mb-2 font-medium">Explora</p>
                    <h2 className="text-3xl font-bold text-joya-black">Nuestras Categorías</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {categorias.map(cat => (
                        <button key={cat.id} onClick={() => { handleCategoryToggle(cat.id); setTimeout(() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                            className={`group relative bg-white border rounded-lg p-8 text-center transition-all duration-300 ${selectedCategory === cat.id.toString() ? 'border-joya-gold shadow-md' : 'border-joya-border hover:border-joya-gold'}`}>
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${selectedCategory === cat.id.toString() ? 'bg-joya-gold/20' : 'bg-joya-cream group-hover:bg-joya-gold/10'}`}>
                                <svg className="w-7 h-7 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <h3 className={`font-semibold transition-colors ${selectedCategory === cat.id.toString() ? 'text-joya-gold' : 'text-joya-black group-hover:text-joya-gold'}`}>{cat.categoria}</h3>
                        </button>
                    ))}
                </div>
            </section>

            {/* ═══════ RECIÉN LLEGADOS (estilo premium / oscuro) ═══════ */}
            {novedades?.length > 0 && (
                <section className="bg-joya-dark py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <p className="text-joya-gold text-xs uppercase tracking-[0.3em] mb-3 font-semibold flex items-center gap-2">
                                    <span className="w-8 h-px bg-joya-gold inline-block" />
                                    Lo más nuevo
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-white">Recién Llegados</h2>
                            </div>
                            <a href="#catalogo" className="hidden sm:inline-flex items-center text-joya-gold text-sm font-medium hover:text-white transition-colors gap-1">
                                Ver todo el catálogo
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </a>
                        </div>

                        {/* Grid horizontal scrollable en mobile, grid estático en desktop */}
                        <div className="flex gap-5 overflow-x-auto pb-4 custom-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
                            {novedades.map(producto => (
                                <NovedadCard key={producto.id} producto={producto} />
                            ))}
                        </div>

                        <div className="mt-8 text-center sm:hidden">
                            <a href="#catalogo" className="inline-flex items-center text-joya-gold text-sm font-medium">
                                Ver todo el catálogo →
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ PROPUESTA DE VALOR ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Calidad Premium</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">Cada pieza es seleccionada cuidadosamente para garantizar los más altos estándares de calidad.</p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Envío Seguro</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">Tu joyería llega protegida con empaque especial. Seguimiento en tiempo real de tu pedido.</p>
                    </div>
                    <div className="text-center p-8">
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-joya-gold/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-joya-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                        <h3 className="font-semibold text-joya-black text-lg mb-2">Atención Personalizada</h3>
                        <p className="text-joya-gray text-sm leading-relaxed">Nuestro equipo te asesora para encontrar la pieza perfecta para cada ocasión especial.</p>
                    </div>
                </div>
            </section>

            {/* ═══════ CATÁLOGO COMPLETO ═══════ */}
            <section id="catalogo" className="bg-white py-16 scroll-mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header del catálogo */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-joya-gold text-sm uppercase tracking-[0.2em] mb-2 font-medium">Colección completa</p>
                                <h2 className="text-3xl font-bold text-joya-black">Catálogo</h2>
                                <p className="text-joya-gray text-sm mt-1">{productos.total} {productos.total === 1 ? 'producto' : 'productos'}</p>
                            </div>
                            <button onClick={() => setFiltersOpen(!filtersOpen)}
                                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-joya-border rounded-lg text-sm text-joya-black hover:border-joya-gold transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                Filtros
                                {hasActiveFilters && <span className="w-5 h-5 bg-joya-gold text-joya-black text-xs rounded-full flex items-center justify-center font-bold">{activeChips.length}</span>}
                            </button>
                        </div>

                        {activeChips.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activeChips.map((chip, i) => (
                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-joya-black text-white text-xs rounded-full">
                                        {chip.label}
                                        <button onClick={chip.onRemove} className="hover:text-joya-gold transition-colors">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                ))}
                                <button onClick={clearFilters} className="text-xs text-joya-gray hover:text-joya-black transition-colors underline">Limpiar todo</button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-8">
                        {/* Sidebar desktop */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24 bg-joya-cream border border-joya-border rounded-lg p-6 custom-scrollbar overflow-y-auto max-h-[calc(100vh-8rem)]">
                                <FilterSidebar />
                            </div>
                        </aside>

                        {/* Mobile filters */}
                        {filtersOpen && (
                            <div className="fixed inset-0 z-40 lg:hidden">
                                <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
                                <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto custom-scrollbar">
                                    <div className="sticky top-0 bg-white border-b border-joya-border px-6 py-4 flex items-center justify-between z-10">
                                        <h3 className="font-semibold text-joya-black">Filtros</h3>
                                        <button onClick={() => setFiltersOpen(false)} className="text-joya-gray hover:text-joya-black">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="p-6"><FilterSidebar /></div>
                                </div>
                            </div>
                        )}

                        {/* Product grid */}
                        <div className="flex-1 min-w-0">
                            {productos.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {productos.data.map(prod => <ProductCard key={prod.id} producto={prod} />)}
                                    </div>

                                    {productos.last_page > 1 && (
                                        <div className="mt-12 flex justify-center gap-1">
                                            {productos.links.map((link, i) => {
                                                if (!link.url) return null;
                                                let label = link.label;
                                                if (label.includes('Previous')) label = '←';
                                                if (label.includes('Next')) label = '→';
                                                return (
                                                    <Link key={i} href={link.url} preserveScroll
                                                        className={`min-w-[40px] h-10 flex items-center justify-center px-3 text-sm border transition-colors ${link.active ? 'bg-joya-black text-white border-joya-black' : 'bg-white text-joya-gray border-joya-border hover:border-joya-black hover:text-joya-black'}`}
                                                        dangerouslySetInnerHTML={{ __html: label }} />
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-24 bg-joya-cream border border-joya-border rounded-lg">
                                    <svg className="w-16 h-16 text-joya-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <h3 className="text-lg font-semibold text-joya-black mb-2">No se encontraron productos</h3>
                                    <p className="text-joya-gray text-sm mb-6">Intenta ajustar los filtros para ver más resultados.</p>
                                    <button onClick={clearFilters} className="inline-flex items-center px-6 py-2.5 bg-joya-black text-white text-sm font-medium hover:bg-joya-dark transition-colors">Limpiar filtros</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CTA FINAL ═══════ */}
            <section className="bg-joya-black">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <p className="text-joya-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">¿Lista para brillar?</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Encuentra la pieza que te define</h2>
                    <p className="text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">Explora nuestra colección completa y encuentra joyería que habla de quién eres.</p>
                    <a href="#catalogo" className="inline-flex items-center px-10 py-4 bg-joya-gold text-joya-black font-semibold text-sm uppercase tracking-wider hover:bg-joya-gold-hover transition-colors">
                        Volver al Catálogo
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                    </a>
                </div>
            </section>
        </CatalogoLayout>
    );
}
