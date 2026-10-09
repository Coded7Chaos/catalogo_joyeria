import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

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
                                <span
                                    key={tag.id}
                                    className="bg-joya-black/80 text-white text-[10px] px-2 py-0.5 uppercase tracking-wider"
                                >
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
                            <div
                                key={color.id}
                                className="w-4 h-4 rounded-full border border-joya-border"
                                style={{ backgroundColor: color.cod_hex }}
                                title={color.color}
                            />
                        ))}
                        {uniqueColors.length > 5 && (
                            <span className="text-[10px] text-joya-gray">+{uniqueColors.length - 5}</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-joya-border pt-3 mt-auto">
                    <div>
                        <span className="text-xs text-joya-gray">Desde</span>
                        <p className="text-joya-black font-bold text-lg">
                            {minPrice ? `Bs. ${minPrice.toFixed(2)}` : 'Consultar'}
                        </p>
                    </div>
                    <Link
                        href={`/catalogo/${producto.id}`}
                        className="text-joya-gold text-sm font-medium hover:text-joya-gold-hover transition-colors"
                    >
                        Ver detalles →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function Index({ productos, categorias, colores, tallas, tags, rangoPrecio, filtros }) {
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

        // Clean empty values
        const params = {};
        if (f.search) params.search = f.search;
        if (f.id_categoria) params.id_categoria = f.id_categoria;
        if (f.colores && f.colores.length > 0) params.colores = f.colores;
        if (f.tallas && f.tallas.length > 0) params.tallas = f.tallas;
        if (f.tags && f.tags.length > 0) params.tags = f.tags;
        if (f.precio_min) params.precio_min = f.precio_min;
        if (f.precio_max) params.precio_max = f.precio_max;

        return params;
    }, [search, selectedCategory, selectedColores, selectedTallas, selectedTags, precioMin, precioMax]);

    const applyFilters = useCallback((overrides = {}) => {
        const params = buildFilters(overrides);
        router.get('/catalogo', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [buildFilters]);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => applyFilters({ search: val }), 400);
    };

    const handleCategoryToggle = (catId) => {
        const idStr = catId.toString();
        const newVal = selectedCategory === idStr ? '' : idStr;
        setSelectedCategory(newVal);
        applyFilters({ id_categoria: newVal });
    };

    const handleColorToggle = (colorId) => {
        const id = colorId.toString();
        const newColores = selectedColores.includes(id)
            ? selectedColores.filter(c => c !== id)
            : [...selectedColores, id];
        setSelectedColores(newColores);
        applyFilters({ colores: newColores });
    };

    const handleTallaToggle = (tallaId) => {
        const id = tallaId.toString();
        const newTallas = selectedTallas.includes(id)
            ? selectedTallas.filter(t => t !== id)
            : [...selectedTallas, id];
        setSelectedTallas(newTallas);
        applyFilters({ tallas: newTallas });
    };

    const handleTagToggle = (tagId) => {
        const id = tagId.toString();
        const newTags = selectedTags.includes(id)
            ? selectedTags.filter(t => t !== id)
            : [...selectedTags, id];
        setSelectedTags(newTags);
        applyFilters({ tags: newTags });
    };

    const handlePrecioChange = (type, value) => {
        if (type === 'min') {
            setPrecioMin(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => applyFilters({ precio_min: value }), 400);
        } else {
            setPrecioMax(value);
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => applyFilters({ precio_max: value }), 400);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedColores([]);
        setSelectedTallas([]);
        setSelectedTags([]);
        setPrecioMin('');
        setPrecioMax('');
        router.get('/catalogo', {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = search || selectedCategory || selectedColores.length > 0 ||
        selectedTallas.length > 0 || selectedTags.length > 0 || precioMin || precioMax;

    // Active filter chips
    const activeChips = [];
    if (search) activeChips.push({ label: `"${search}"`, onRemove: () => { setSearch(''); applyFilters({ search: '' }); } });
    if (selectedCategory) {
        const cat = categorias.find(c => c.id.toString() === selectedCategory);
        activeChips.push({ label: cat?.categoria || 'Categoría', onRemove: () => { setSelectedCategory(''); applyFilters({ id_categoria: '' }); } });
    }
    selectedColores.forEach(cId => {
        const color = colores.find(c => c.id.toString() === cId);
        activeChips.push({ label: color?.color || 'Color', onRemove: () => handleColorToggle(cId) });
    });
    selectedTallas.forEach(tId => {
        const talla = tallas.find(t => t.id.toString() === tId);
        activeChips.push({ label: `Talla ${talla?.talla || ''}`, onRemove: () => handleTallaToggle(tId) });
    });
    selectedTags.forEach(tId => {
        const tag = tags.find(t => t.id.toString() === tId);
        activeChips.push({ label: tag?.descripcion || 'Tag', onRemove: () => handleTagToggle(tId) });
    });

    const FilterSidebar = () => (
        <div className="space-y-6">
            {/* Búsqueda */}
            <div>
                <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-2 block">
                    Buscar
                </label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Nombre del producto..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm bg-white focus:border-joya-gold focus:ring-1 focus:ring-joya-gold placeholder:text-joya-gray/50"
                    />
                    <svg className="w-4 h-4 text-joya-gray absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Categorías */}
            <div>
                <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">
                    Categorías
                </label>
                <div className="space-y-2">
                    {categorias.map(cat => (
                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={selectedCategory === cat.id.toString()}
                                onChange={() => handleCategoryToggle(cat.id)}
                                className="w-4 h-4 rounded border-joya-border text-joya-gold focus:ring-joya-gold cursor-pointer"
                            />
                            <span className={`text-sm transition-colors ${
                                selectedCategory === cat.id.toString()
                                    ? 'text-joya-black font-medium'
                                    : 'text-joya-gray group-hover:text-joya-black'
                            }`}>
                                {cat.categoria}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Colores */}
            {colores && colores.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">
                        Colores
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {colores.map(color => (
                            <button
                                key={color.id}
                                onClick={() => handleColorToggle(color.id)}
                                title={color.color}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                    selectedColores.includes(color.id.toString())
                                        ? 'border-joya-gold scale-110 shadow-md'
                                        : 'border-joya-border hover:border-joya-gray'
                                }`}
                                style={{ backgroundColor: color.cod_hex }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Tallas */}
            {tallas && tallas.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">
                        Tallas
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tallas.map(talla => (
                            <button
                                key={talla.id}
                                onClick={() => handleTallaToggle(talla.id)}
                                className={`px-3 py-1.5 text-sm border rounded-lg transition-all ${
                                    selectedTallas.includes(talla.id.toString())
                                        ? 'bg-joya-black text-white border-joya-black'
                                        : 'bg-white text-joya-gray border-joya-border hover:border-joya-black hover:text-joya-black'
                                }`}
                            >
                                {talla.talla}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Rango de Precio */}
            {rangoPrecio && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">
                        Precio
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder={`${rangoPrecio.min || 0}`}
                            value={precioMin}
                            onChange={(e) => handlePrecioChange('min', e.target.value)}
                            className="w-full border border-joya-border rounded-lg px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                        />
                        <span className="text-joya-gray text-sm">—</span>
                        <input
                            type="number"
                            placeholder={`${rangoPrecio.max || 999}`}
                            value={precioMax}
                            onChange={(e) => handlePrecioChange('max', e.target.value)}
                            className="w-full border border-joya-border rounded-lg px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                        />
                    </div>
                </div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div>
                    <label className="text-xs uppercase tracking-wider text-joya-gray font-semibold mb-3 block">
                        Etiquetas
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <button
                                key={tag.id}
                                onClick={() => handleTagToggle(tag.id)}
                                className={`px-3 py-1.5 text-xs border rounded-full transition-all ${
                                    selectedTags.includes(tag.id.toString())
                                        ? 'bg-joya-gold text-joya-black border-joya-gold font-medium'
                                        : 'bg-white text-joya-gray border-joya-border hover:border-joya-gold hover:text-joya-gold'
                                }`}
                            >
                                {tag.descripcion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Limpiar filtros */}
            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full py-2.5 text-sm font-medium text-joya-gray border border-joya-border rounded-lg hover:bg-joya-cream hover:text-joya-black transition-colors"
                >
                    Limpiar todos los filtros
                </button>
            )}
        </div>
    );

    return (
        <CatalogoLayout>
            <Head title="Catálogo" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-joya-black">Catálogo</h1>
                            <p className="text-joya-gray text-sm mt-1">
                                {productos.total} {productos.total === 1 ? 'producto' : 'productos'}
                            </p>
                        </div>

                        {/* Mobile filter toggle */}
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-joya-border rounded-lg text-sm text-joya-black hover:border-joya-gold transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filtros
                            {hasActiveFilters && (
                                <span className="w-5 h-5 bg-joya-gold text-joya-black text-xs rounded-full flex items-center justify-center font-bold">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Active filter chips */}
                    {activeChips.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {activeChips.map((chip, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-joya-black text-white text-xs rounded-full"
                                >
                                    {chip.label}
                                    <button onClick={chip.onRemove} className="hover:text-joya-gold transition-colors">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={clearFilters}
                                className="text-xs text-joya-gray hover:text-joya-black transition-colors underline"
                            >
                                Limpiar todo
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24 bg-white border border-joya-border rounded-lg p-6 custom-scrollbar overflow-y-auto max-h-[calc(100vh-8rem)]">
                            <FilterSidebar />
                        </div>
                    </aside>

                    {/* Mobile filters panel */}
                    {filtersOpen && (
                        <div className="fixed inset-0 z-40 lg:hidden">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
                            <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto custom-scrollbar">
                                <div className="sticky top-0 bg-white border-b border-joya-border px-6 py-4 flex items-center justify-between z-10">
                                    <h3 className="font-semibold text-joya-black">Filtros</h3>
                                    <button onClick={() => setFiltersOpen(false)} className="text-joya-gray hover:text-joya-black">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <FilterSidebar />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="flex-1 min-w-0">
                        {productos.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {productos.data.map(prod => (
                                        <ProductCard key={prod.id} producto={prod} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {productos.last_page > 1 && (
                                    <div className="mt-12 flex justify-center gap-1">
                                        {productos.links.map((link, i) => {
                                            if (!link.url) return null;

                                            let label = link.label;
                                            if (label.includes('Previous')) label = '←';
                                            if (label.includes('Next')) label = '→';

                                            return (
                                                <Link
                                                    key={i}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`min-w-[40px] h-10 flex items-center justify-center px-3 text-sm border transition-colors ${
                                                        link.active
                                                            ? 'bg-joya-black text-white border-joya-black'
                                                            : 'bg-white text-joya-gray border-joya-border hover:border-joya-black hover:text-joya-black'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: label }}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-24 bg-white border border-joya-border rounded-lg">
                                <svg className="w-16 h-16 text-joya-border mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-joya-black mb-2">No se encontraron productos</h3>
                                <p className="text-joya-gray text-sm mb-6">Intenta ajustar los filtros para ver más resultados.</p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-6 py-2.5 bg-joya-black text-white text-sm font-medium hover:bg-joya-dark transition-colors"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CatalogoLayout>
    );
}
