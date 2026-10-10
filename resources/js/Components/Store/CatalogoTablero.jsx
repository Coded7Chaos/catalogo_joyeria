import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { EditorialTile, ProductTile } from './BoardTile';
import Pagination from './Pagination';
import { CloseIcon, FilterIcon, SearchIcon } from './Icons';
import { editorialTiles } from '@/lib/catalogo';

const toggle = (arr, id) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

const scrollToCatalog = () => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });

const sectionLabel = 'mb-3 block text-[11px] uppercase tracking-[0.2em] text-tinta/55';

/**
 * Pinterest-style board from the Figma Make design with the store's filters
 * (search, category, colors, sizes, price and tags). Filters are sent to
 * `baseUrl` as query params, the same way the pages did before.
 */
export default function CatalogoTablero({
    baseUrl,
    productos,
    categorias,
    colores,
    tallas,
    tags,
    rangoPrecio,
    filtros,
    title,
    showEditorial = false,
}) {
    const [search, setSearch] = useState(filtros.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filtros.id_categoria || '');
    const [selectedColores, setSelectedColores] = useState(filtros.colores || []);
    const [selectedTallas, setSelectedTallas] = useState(filtros.tallas || []);
    const [selectedTags, setSelectedTags] = useState(filtros.tags || []);
    const [precioMin, setPrecioMin] = useState(filtros.precio_min || '');
    const [precioMax, setPrecioMax] = useState(filtros.precio_max || '');
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [active, setActive] = useState(null);
    const [saved, setSaved] = useState(() => new Set());
    const [canHover, setCanHover] = useState(true);
    const debounceRef = useRef(null);

    useEffect(() => {
        const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
        const sync = () => setCanHover(mq.matches);
        sync();
        mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        if (!filtersOpen) return;
        const onKey = (e) => e.key === 'Escape' && setFiltersOpen(false);
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [filtersOpen]);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    const buildFilters = useCallback(
        (overrides = {}) => {
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
        },
        [search, selectedCategory, selectedColores, selectedTallas, selectedTags, precioMin, precioMax],
    );

    const applyFilters = useCallback(
        (overrides = {}) => {
            setActive(null);
            router.get(baseUrl, buildFilters(overrides), { preserveState: true, preserveScroll: true, replace: true });
        },
        [baseUrl, buildFilters],
    );

    const debounced = (overrides) => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => applyFilters(overrides), 400);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        debounced({ search: value });
    };

    const handleCategoryToggle = (catId) => {
        const s = catId ? catId.toString() : '';
        const v = selectedCategory === s ? '' : s;
        setSelectedCategory(v);
        applyFilters({ id_categoria: v });
    };
    const handleColorToggle = (id) => {
        const n = toggle(selectedColores, id.toString());
        setSelectedColores(n);
        applyFilters({ colores: n });
    };
    const handleTallaToggle = (id) => {
        const n = toggle(selectedTallas, id.toString());
        setSelectedTallas(n);
        applyFilters({ tallas: n });
    };
    const handleTagToggle = (id) => {
        const n = toggle(selectedTags, id.toString());
        setSelectedTags(n);
        applyFilters({ tags: n });
    };

    const handlePrecioChange = (type, value) => {
        if (type === 'min') setPrecioMin(value);
        else setPrecioMax(value);
        debounced(type === 'min' ? { precio_min: value } : { precio_max: value });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedColores([]);
        setSelectedTallas([]);
        setSelectedTags([]);
        setPrecioMin('');
        setPrecioMax('');
        setActive(null);
        router.get(baseUrl, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const toggleSave = useCallback((id) => {
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const hasActiveFilters =
        search || selectedCategory || selectedColores.length || selectedTallas.length || selectedTags.length || precioMin || precioMax;

    // Category has its own chip row, so the drawer badge counts the rest.
    const activeChips = [];
    if (search) activeChips.push({ label: `“${search}”`, onRemove: () => handleSearchChange('') });
    selectedColores.forEach((id) => {
        const c = colores.find((c) => c.id.toString() === id);
        activeChips.push({ label: c?.color || 'Color', onRemove: () => handleColorToggle(id) });
    });
    selectedTallas.forEach((id) => {
        const t = tallas.find((t) => t.id.toString() === id);
        activeChips.push({ label: `Talla ${t?.talla || ''}`, onRemove: () => handleTallaToggle(id) });
    });
    selectedTags.forEach((id) => {
        const t = tags.find((t) => t.id.toString() === id);
        activeChips.push({ label: t?.descripcion || 'Etiqueta', onRemove: () => handleTagToggle(id) });
    });
    if (precioMin || precioMax) {
        activeChips.push({
            label: `Bs. ${precioMin || rangoPrecio?.min || 0} – ${precioMax || rangoPrecio?.max || '…'}`,
            onRemove: () => {
                setPrecioMin('');
                setPrecioMax('');
                applyFilters({ precio_min: '', precio_max: '' });
            },
        });
    }

    const nombreCategoria = useMemo(
        () => Object.fromEntries(categorias.map((c) => [c.id, c.categoria])),
        [categorias],
    );

    const items = useMemo(() => {
        const list = productos.data.map((p) => ({ type: 'product', key: `p${p.id}`, producto: p }));
        if (showEditorial && !hasActiveFilters && productos.current_page === 1 && list.length > 0) {
            for (const { at, ...tile } of editorialTiles) {
                list.splice(Math.min(at, list.length), 0, { type: 'editorial', key: tile.id, ...tile });
            }
        }
        return list;
    }, [productos, showEditorial, hasActiveFilters]);

    const chip = (isActive) =>
        `shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
            isActive ? 'bg-vino text-white' : 'bg-white text-tinta hover:bg-rosa-deep'
        }`;

    const filterPanel = (
        <div className="space-y-8">
            <div>
                <span className={sectionLabel}>Buscar</span>
                <label className="flex h-11 items-center gap-2.5 rounded-full border border-tinta/15 bg-white px-4 focus-within:border-vino focus-within:ring-1 focus-within:ring-vino/25">
                    <SearchIcon width={18} height={18} className="shrink-0 opacity-60" />
                    <input
                        type="search"
                        placeholder="Nombre de la pieza"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full min-w-0 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-tinta/45 focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
                    />
                </label>
            </div>

            {colores?.length > 0 && (
                <div>
                    <span className={sectionLabel}>Colores</span>
                    <div className="flex flex-wrap gap-2.5">
                        {colores.map((color) => {
                            const on = selectedColores.includes(color.id.toString());
                            return (
                                <button
                                    key={color.id}
                                    onClick={() => handleColorToggle(color.id)}
                                    title={color.color}
                                    aria-label={color.color}
                                    aria-pressed={on}
                                    className={`h-9 w-9 rounded-full ring-offset-2 transition-all ${
                                        on ? 'scale-110 ring-2 ring-vino' : 'ring-1 ring-tinta/15 hover:ring-vino/40'
                                    }`}
                                    style={{ backgroundColor: color.cod_hex }}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {tallas?.length > 0 && (
                <div>
                    <span className={sectionLabel}>Tallas</span>
                    <div className="flex flex-wrap gap-2">
                        {tallas.map((talla) => {
                            const on = selectedTallas.includes(talla.id.toString());
                            return (
                                <button
                                    key={talla.id}
                                    onClick={() => handleTallaToggle(talla.id)}
                                    aria-pressed={on}
                                    className={`min-w-[44px] rounded-full border px-4 py-2 text-sm transition-colors ${
                                        on ? 'border-vino bg-vino text-white' : 'border-tinta/15 text-tinta hover:border-vino'
                                    }`}
                                >
                                    {talla.talla}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {rangoPrecio && (
                <div>
                    <span className={sectionLabel}>Precio (Bs.)</span>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            aria-label="Precio mínimo"
                            placeholder={`${rangoPrecio.min || 0}`}
                            value={precioMin}
                            onChange={(e) => handlePrecioChange('min', e.target.value)}
                            className="h-11 w-full rounded-full border-tinta/15 px-4 text-sm focus:border-vino focus:ring-vino/25"
                        />
                        <span className="text-tinta/40">–</span>
                        <input
                            type="number"
                            aria-label="Precio máximo"
                            placeholder={`${rangoPrecio.max || 999}`}
                            value={precioMax}
                            onChange={(e) => handlePrecioChange('max', e.target.value)}
                            className="h-11 w-full rounded-full border-tinta/15 px-4 text-sm focus:border-vino focus:ring-vino/25"
                        />
                    </div>
                </div>
            )}

            {tags?.length > 0 && (
                <div>
                    <span className={sectionLabel}>Etiquetas</span>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => {
                            const on = selectedTags.includes(tag.id.toString());
                            return (
                                <button
                                    key={tag.id}
                                    onClick={() => handleTagToggle(tag.id)}
                                    aria-pressed={on}
                                    className={`rounded-full px-3.5 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors ${
                                        on ? 'bg-vino text-white' : 'bg-rosa text-vino hover:bg-rosa-deep'
                                    }`}
                                >
                                    {tag.descripcion}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <section id="catalogo" className="scroll-mt-[73px] bg-rosa lg:scroll-mt-[121px]">
            <div className="mx-auto max-w-[1440px] px-3 py-14 sm:px-8 lg:py-20">
                <div className="flex flex-col gap-6 px-2 sm:px-0 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-[13px] font-medium uppercase tracking-[0.22em] text-vino-soft">Catálogo</p>
                        <h2 className="mt-2 font-display text-[44px] font-normal leading-none text-tinta sm:text-[60px]">
                            {selectedCategory
                                ? nombreCategoria[selectedCategory] ?? 'Catálogo'
                                : title ?? (
                                      <>
                                          El <em>tablero</em> de joyas
                                      </>
                                  )}
                        </h2>
                        <p className="mt-3 max-w-md text-[15px] text-tinta/65">
                            {productos.total} {productos.total === 1 ? 'pieza' : 'piezas'} ·{' '}
                            {canHover ? 'pasa el cursor sobre una pieza para ver su precio.' : 'toca una pieza para ver su precio.'}
                        </p>
                    </div>
                    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
                        <button onClick={() => selectedCategory && handleCategoryToggle('')} className={chip(!selectedCategory)}>
                            Todo
                        </button>
                        {categorias.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => handleCategoryToggle(c.id)}
                                className={chip(selectedCategory === c.id.toString())}
                            >
                                {c.categoria}
                            </button>
                        ))}
                        <button
                            onClick={() => setFiltersOpen(true)}
                            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-vino/25 bg-white px-4 py-2 text-sm text-vino transition-colors hover:border-vino"
                        >
                            <FilterIcon width={16} height={16} />
                            Filtros
                            {activeChips.length > 0 && (
                                <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-vino px-1 text-[11px] text-white">
                                    {activeChips.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {activeChips.length > 0 && (
                    <div className="mt-6 flex flex-wrap items-center gap-2 px-2 sm:px-0">
                        {activeChips.map((c, i) => (
                            <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-3 pr-1.5 text-sm text-tinta">
                                {c.label}
                                <button
                                    onClick={c.onRemove}
                                    aria-label={`Quitar ${c.label}`}
                                    className="grid h-6 w-6 place-items-center rounded-full text-tinta/50 hover:bg-rosa hover:text-vino"
                                >
                                    <CloseIcon width={14} height={14} />
                                </button>
                            </span>
                        ))}
                        <button onClick={clearFilters} className="ml-1 text-sm text-vino underline underline-offset-4">
                            Limpiar todo
                        </button>
                    </div>
                )}

                {productos.data.length > 0 ? (
                    <div className="mt-8 columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4 xl:columns-5">
                        {items.map((it) =>
                            it.type === 'editorial' ? (
                                <EditorialTile key={it.key} kind={it.kind} ratio={it.ratio} />
                            ) : (
                                <ProductTile
                                    key={it.key}
                                    producto={it.producto}
                                    categoria={nombreCategoria[it.producto.id_categoria]}
                                    active={active === it.producto.id}
                                    saved={saved.has(it.producto.id)}
                                    canHover={canHover}
                                    onActivate={setActive}
                                    onSave={toggleSave}
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="font-display text-2xl text-tinta/60">No encontramos piezas con esos filtros.</p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-6 rounded-full bg-vino px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-vino-deep"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                )}

                <Pagination links={productos.links} onSuccess={scrollToCatalog} className="mt-12" />
            </div>

            {/* Filters drawer */}
            {filtersOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filtros">
                    <button
                        aria-label="Cerrar filtros"
                        onClick={() => setFiltersOpen(false)}
                        className="absolute inset-0 bg-vino-deep/60 backdrop-blur-sm"
                    />
                    <div className="absolute right-0 top-0 flex h-full w-[380px] max-w-[90vw] animate-rise flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-vino/10 px-6 py-5">
                            <h3 className="font-display text-[28px] leading-none">Filtros</h3>
                            <button
                                onClick={() => setFiltersOpen(false)}
                                aria-label="Cerrar"
                                className="grid h-10 w-10 place-items-center rounded-full hover:bg-humo"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">{filterPanel}</div>
                        <div className="flex gap-3 border-t border-vino/10 px-6 py-4">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 rounded-full border border-tinta/15 py-3 text-sm text-tinta transition-colors hover:border-vino"
                                >
                                    Limpiar
                                </button>
                            )}
                            <button
                                onClick={() => setFiltersOpen(false)}
                                className="flex-1 rounded-full bg-vino py-3 text-sm font-medium text-white transition-colors hover:bg-vino-deep"
                            >
                                Ver {productos.total} {productos.total === 1 ? 'pieza' : 'piezas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
