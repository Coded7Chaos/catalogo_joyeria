import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';
import { GaleriaImagenes } from '@/Components/Admin/Imagenes';
import CamposSeo from '@/Components/Admin/CamposSeo';

/** Creates a new value for an attribute (e.g. a new color or size) without leaving the form. */
function InlineValorForm({ atributo, onCreated }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({ valor: '', cod_hex: '#c9a46a' });
    const esColor = atributo.tipo === 'color';

    const submit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaving(true);
        try {
            await axios.post(`/admin/atributos/${atributo.id}/valores`, { valor: data.valor, cod_hex: esColor ? data.cod_hex : null });
            setData({ valor: '', cod_hex: '#c9a46a' });
            setOpen(false);
            onCreated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear el valor');
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <button type="button" onClick={() => setOpen(true)} className="mt-1 inline-flex items-center gap-1 text-xs text-joya-gold transition-colors hover:text-joya-gold-hover">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nuevo valor
            </button>
        );
    }

    return (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-joya-border bg-gray-50 p-2" onClick={(e) => e.stopPropagation()}>
            <input type="text" value={data.valor} onChange={(e) => setData({ ...data, valor: e.target.value })} placeholder={`Nuevo ${atributo.nombre.toLowerCase()}`} className="min-w-0 flex-1 rounded border border-joya-border px-2 py-1 text-xs focus:border-vino focus:ring-1 focus:ring-vino/25" autoFocus />
            {esColor && <input type="color" value={data.cod_hex} onChange={(e) => setData({ ...data, cod_hex: e.target.value })} className="h-7 w-7 cursor-pointer rounded border border-joya-border p-0" />}
            <button type="button" onClick={submit} disabled={!data.valor || saving} className="rounded bg-vino px-2.5 py-1 text-xs text-white hover:bg-vino-deep disabled:opacity-50">
                {saving ? '…' : 'Crear'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-joya-gray hover:text-joya-black">×</button>
        </div>
    );
}

function InlineTagForm({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [descripcion, setDescripcion] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaving(true);
        try {
            await axios.post('/admin/tags', { descripcion });
            setDescripcion('');
            setOpen(false);
            onCreated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear tag');
        } finally {
            setSaving(false);
        }
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-joya-gold hover:text-joya-gold-hover transition-colors mt-1"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nuevo tag
            </button>
        );
    }

    return (
        <div className="mt-2 p-3 border border-joya-border rounded-lg bg-gray-50 space-y-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-joya-black">Crear tag</p>
            <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripcion del tag"
                className="w-full border border-joya-border rounded px-2 py-1 text-xs focus:border-vino focus:ring-1 focus:ring-vino/25"
            />
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={submit}
                    disabled={!descripcion || saving}
                    className="text-xs bg-vino text-white px-3 py-1 rounded hover:bg-vino-deep disabled:opacity-50"
                >
                    {saving ? 'Creando...' : 'Crear'}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="text-xs text-joya-gray hover:text-joya-black">
                    Cancelar
                </button>
            </div>
        </div>
    );
}

function VariantCard({ variant, index, atributos, errors, onUpdate, onRemove, onSetValor, onReloadAtributos }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const fieldError = (field) => errors?.[field];
    const errorFotos = Object.entries(errors || {}).find(([k]) => k.startsWith('imagenes'))?.[1];

    return (
        <div className="rounded-[18px] border border-joya-border bg-white p-4">
            <div className="mb-3 flex items-start justify-between">
                <h4 className="text-sm font-medium text-joya-black">Variante {index + 1} {variant.id ? <span className="text-xs font-normal text-joya-gray">(ID: {variant.id})</span> : <span className="text-xs font-normal text-green-600">(Nueva)</span>}</h4>
                {confirmDelete ? (
                    <div className="flex items-center gap-1">
                        <span className="mr-1 text-xs text-red-600">Eliminar?</span>
                        <button type="button" onClick={() => { onRemove(variant._key); setConfirmDelete(false); }} className="rounded bg-red-500 px-2 py-0.5 text-xs text-white hover:bg-red-600">Si</button>
                        <button type="button" onClick={() => setConfirmDelete(false)} className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-300">No</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="p-1 text-joya-gray transition-colors hover:text-red-500" title="Eliminar variante">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-joya-gray">SKU</label>
                    <input type="text" value={variant.sku} onChange={(e) => onUpdate(variant._key, 'sku', e.target.value)} placeholder="SKU-001" className="w-full rounded border border-joya-border px-3 py-2 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                    {fieldError('sku') && <p className="mt-0.5 text-xs text-red-500">{fieldError('sku')}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-joya-gray">Precio (Bs.)</label>
                    <input type="number" step="0.01" min="0" value={variant.precio} onChange={(e) => onUpdate(variant._key, 'precio', e.target.value)} placeholder="0.00" className="w-full rounded border border-joya-border px-3 py-2 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                    {fieldError('precio') && <p className="mt-0.5 text-xs text-red-500">{fieldError('precio')}</p>}
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-joya-gray">Stock</label>
                    <input type="number" min="0" value={variant.stock} onChange={(e) => onUpdate(variant._key, 'stock', e.target.value)} placeholder="0" className="w-full rounded border border-joya-border px-3 py-2 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                    {fieldError('stock') && <p className="mt-0.5 text-xs text-red-500">{fieldError('stock')}</p>}
                </div>
            </div>

            {/* Attributes defined in Admin → Atributos (Color, Talla, Material…) */}
            {atributos.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {atributos.map((a) => (
                        <div key={a.id}>
                            <label className="mb-1 block text-xs font-medium text-joya-gray">{a.nombre}</label>
                            {a.tipo === 'color' ? (
                                <div className="flex flex-wrap gap-1.5">
                                    {a.valores.map((val) => {
                                        const on = Number(variant.valores[a.id]) === val.id;
                                        return (
                                            <button key={val.id} type="button" onClick={() => onSetValor(variant._key, a.id, on ? '' : val.id)}
                                                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${on ? 'border-vino bg-vino text-white' : 'border-joya-border bg-white text-joya-gray hover:border-vino/40'}`}>
                                                <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: val.cod_hex || '#ccc' }} />
                                                {val.valor}
                                            </button>
                                        );
                                    })}
                                    {a.valores.length === 0 && <span className="text-xs text-joya-gray">Sin valores todavía.</span>}
                                </div>
                            ) : (
                                <select value={variant.valores[a.id] ?? ''} onChange={(e) => onSetValor(variant._key, a.id, e.target.value)} className="w-full rounded border border-joya-border px-3 py-2 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25">
                                    <option value="">Sin {a.nombre.toLowerCase()}</option>
                                    {a.valores.map((val) => <option key={val.id} value={val.id}>{val.valor}</option>)}
                                </select>
                            )}
                            <InlineValorForm atributo={a} onCreated={onReloadAtributos} />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="mt-4 text-xs text-joya-gray">
                    No hay atributos (Talla, Color…). Créalos en <Link href="/admin/atributos" className="text-vino underline">Atributos</Link>.
                </p>
            )}
            {fieldError('valores') && <p className="mt-1 text-xs text-red-500">{fieldError('valores')}</p>}

            <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-joya-gray">Fotos</label>
                <GaleriaImagenes value={variant.imagenes} onChange={(imgs) => onUpdate(variant._key, 'imagenes', imgs)} />
                {errorFotos && <p className="mt-0.5 text-xs text-red-500">{errorFotos}</p>}
            </div>
        </div>
    );
}

const emptyFormData = () => ({
    nombre: '',
    id_categoria: '',
    descripcion: '',
    slug: '',
    meta_titulo: '',
    meta_descripcion: '',
    tags: [],
    variantes: [],
    variantes_delete: [],
});

/** Category options with subcategories indented under their parent. */
const opcionesCategorias = (categorias, padre = null, nivel = 0) =>
    categorias
        .filter((c) => (c.parent_id ?? null) === padre)
        .flatMap((c) => [{ ...c, nivel }, ...opcionesCategorias(categorias, c.id, nivel + 1)]);

export default function Productos({ productos, categorias, atributos, tags: allTags, filtros }) {
    const { flash } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const searchTimeout = useRef(null);

    // Unified form state
    const [formData, setFormData] = useState(emptyFormData());
    const [formErrors, setFormErrors] = useState({});
    const [formProcessing, setFormProcessing] = useState(false);

    const handleSearch = (value) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get('/admin/productos', { search: value || undefined }, { preserveState: true, preserveScroll: true });
        }, 400);
    };

    // ── Form helpers ──
    const setField = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

    const toggleTag = (tagId) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.includes(tagId) ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId],
        }));
    };

    // ── Variant helpers ──
    const addVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variantes: [...prev.variantes, { _key: crypto.randomUUID(), id: null, sku: '', precio: '', stock: '', valores: {}, imagenes: [] }],
        }));
    };

    const removeVariant = (key) => {
        setFormData((prev) => {
            const variant = prev.variantes.find((v) => v._key === key);
            return {
                ...prev,
                variantes: prev.variantes.filter((v) => v._key !== key),
                variantes_delete: variant?.id ? [...prev.variantes_delete, variant.id] : prev.variantes_delete,
            };
        });
    };

    const updateVariant = (key, field, value) => {
        setFormData((prev) => ({
            ...prev,
            variantes: prev.variantes.map((v) => v._key === key ? { ...v, [field]: value } : v),
        }));
    };

    const setVariantValor = (key, atributoId, valorId) => {
        setFormData((prev) => ({
            ...prev,
            variantes: prev.variantes.map((v) => (v._key === key ? { ...v, valores: { ...v.valores, [atributoId]: valorId } } : v)),
        }));
    };

    // ── CRUD ──
    const openCreate = () => {
        setEditing(null);
        setFormData(emptyFormData());
        setFormErrors({});
        setShowModal(true);
    };

    const openEdit = (p) => {
        setEditing(p);
        setFormData({
            nombre: p.nombre,
            id_categoria: p.id_categoria,
            descripcion: p.descripcion || '',
            slug: p.slug || '',
            meta_titulo: p.meta_titulo || '',
            meta_descripcion: p.meta_descripcion || '',
            tags: p.tags?.map((t) => t.id) || [],
            variantes: (p.variantes || []).map((v) => ({
                _key: crypto.randomUUID(),
                id: v.id,
                sku: v.sku || '',
                precio: v.precio || '',
                stock: v.stock ?? '',
                valores: Object.fromEntries((v.valores || []).map((val) => [val.id_atributo, val.id])),
                imagenes: v.imagenes?.length ? v.imagenes.map((img) => ({ url: img.url, alt: img.alt || '' })) : v.url_foto ? [{ url: v.url_foto, alt: '' }] : [],
            })),
            variantes_delete: [],
        });
        setFormErrors({});
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        setFormProcessing(true);
        setFormErrors({});

        const payload = {
            nombre: formData.nombre,
            id_categoria: formData.id_categoria,
            descripcion: formData.descripcion,
            slug: formData.slug,
            meta_titulo: formData.meta_titulo,
            meta_descripcion: formData.meta_descripcion,
            tags: formData.tags,
        };
        // {atributoId: valorId} → [valorId, …]
        const paraEnviar = ({ _key, valores, ...rest }) => ({ ...rest, valores: Object.values(valores).filter(Boolean).map(Number) });

        const opts = {
            onSuccess: () => { setShowModal(false); setEditing(null); },
            onError: (errors) => setFormErrors(errors),
            onFinish: () => setFormProcessing(false),
        };

        if (editing) {
            // Partition into update (have id) and new (no id)
            const variantesUpdate = formData.variantes.filter((v) => v.id).map(paraEnviar);
            const variantesNew = formData.variantes.filter((v) => !v.id).map(({ id, ...v }) => paraEnviar(v));

            router.put(`/admin/productos/${editing.id}`, {
                ...payload,
                variantes_update: variantesUpdate,
                variantes_new: variantesNew,
                variantes_delete: formData.variantes_delete,
            }, opts);
        } else {
            // All variantes are new
            const variantes = formData.variantes.map(({ id, ...v }) => paraEnviar(v));
            router.post('/admin/productos', { ...payload, variantes }, opts);
        }
    };

    const handleDelete = (id) => router.delete(`/admin/productos/${id}`, { onSuccess: () => setDeleteConfirm(null) });

    const reloadPage = () => router.reload({ only: ['atributos', 'tags'] });

    // ── Error mapping for variants ──
    const getVariantErrors = (index) => {
        const prefix = editing
            ? (formData.variantes[index]?.id ? 'variantes_update' : 'variantes_new')
            : 'variantes';

        // We need to compute the sub-index within its partition for edit mode
        let subIndex = index;
        if (editing) {
            const variant = formData.variantes[index];
            if (variant?.id) {
                subIndex = formData.variantes.filter((v, i) => i < index && v.id).length;
            } else {
                subIndex = formData.variantes.filter((v, i) => i < index && !v.id).length;
            }
        }

        const mapped = {};
        const pat = `${prefix}.${subIndex}.`;
        Object.entries(formErrors).forEach(([key, val]) => {
            if (key.startsWith(pat)) {
                mapped[key.replace(pat, '')] = val;
            }
        });
        return mapped;
    };

    // ── Helpers ──
    const getPriceRange = (vs) => {
        if (!vs?.length) return '\u2014';
        const ps = vs.map((v) => parseFloat(v.precio));
        const min = Math.min(...ps), max = Math.max(...ps);
        return min === max ? `Bs ${min.toFixed(2)}` : `Bs ${min.toFixed(2)} \u2013 Bs ${max.toFixed(2)}`;
    };
    const getTotalStock = (vs) => vs?.reduce((s, v) => s + (v.stock || 0), 0) || 0;

    return (
        <AdminLayout title="Productos" active="productos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Productos</h1>
                        <p className="text-joya-gray text-sm mt-1">{productos.total} producto{productos.total !== 1 ? 's' : ''} en total</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-vino text-white px-5 py-2.5 text-sm font-medium hover:bg-vino-deep transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo Producto
                    </button>
                </div>

                {flash?.status && <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">{flash.status}</div>}

                <div className="mb-6">
                    <input type="text" defaultValue={filtros.search || ''} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar productos..." className="w-full sm:max-w-sm border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                </div>

                {/* Table */}
                <div className="bg-white border border-joya-border rounded-[18px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-joya-border bg-gray-50/50">
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs w-8"></th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Producto</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Categoria</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Variantes</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Precio</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Stock</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Tags</th>
                                    <th className="text-right px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.data.length === 0 ? (
                                    <tr><td colSpan={8} className="text-center py-12 text-joya-gray">No se encontraron productos.</td></tr>
                                ) : productos.data.map((p) => (
                                    <ProductRow key={p.id} producto={p} isExpanded={expandedProduct === p.id}
                                        onToggle={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
                                        onEdit={() => openEdit(p)} deleteConfirm={deleteConfirm} onDeleteConfirm={setDeleteConfirm} onDelete={handleDelete}
                                        getPriceRange={getPriceRange} getTotalStock={getTotalStock}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {productos.last_page > 1 && (
                        <div className="border-t border-joya-border px-6 py-4 flex items-center justify-between">
                            <p className="text-xs text-joya-gray">Mostrando {productos.from}\u2013{productos.to} de {productos.total}</p>
                            <div className="flex gap-1">
                                {productos.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 text-xs rounded transition-colors ${link.active ? 'bg-vino text-white' : link.url ? 'text-joya-gray hover:text-joya-black' : 'text-joya-gray/30 cursor-default'}`} preserveState preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unified Product + Variants Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[28px] w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border sticky top-0 bg-white z-10">
                            <h3 className="font-semibold text-joya-black text-lg">{editing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-joya-gray hover:text-joya-black">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitForm} className="p-6 space-y-6">
                            {/* Global error */}
                            {formErrors.variantes && <div className="text-sm text-red-600 bg-red-50 border border-red-200 py-2 px-3 rounded-lg">{formErrors.variantes}</div>}

                            {/* ── Product Info Section ── */}
                            <div>
                                <h4 className="text-sm font-semibold text-joya-black uppercase tracking-wider mb-4">Informacion del producto</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                        <input type="text" value={formData.nombre} onChange={(e) => setField('nombre', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" autoFocus />
                                        {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Categoria</label>
                                        <select value={formData.id_categoria} onChange={(e) => setField('id_categoria', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25">
                                            <option value="">Seleccionar categoria</option>
                                            {opcionesCategorias(categorias).map((c) => <option key={c.id} value={c.id}>{'\u00a0\u00a0\u00a0'.repeat(c.nivel)}{c.nivel ? '↳ ' : ''}{c.categoria}</option>)}
                                        </select>
                                        {formErrors.id_categoria && <p className="text-red-500 text-xs mt-1">{formErrors.id_categoria}</p>}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-joya-black block mb-1.5">Descripción</label>
                                    <textarea rows={4} value={formData.descripcion} onChange={(e) => setField('descripcion', e.target.value)} placeholder="Materiales, medidas, cuidados, para qué ocasión es… Una buena descripción ayuda a vender y a aparecer en Google." className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                                    {formErrors.descripcion && <p className="text-red-500 text-xs mt-1">{formErrors.descripcion}</p>}
                                </div>
                                <div className="mt-4">
                                    <label className="text-sm font-medium text-joya-black block mb-1.5">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map((tag) => (
                                            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${formData.tags.includes(tag.id) ? 'bg-joya-gold text-white border-joya-gold' : 'bg-white text-joya-gray border-joya-border hover:border-joya-gold/50'}`}>
                                                {tag.descripcion}
                                            </button>
                                        ))}
                                        {allTags.length === 0 && <p className="text-xs text-joya-gray">No hay tags disponibles.</p>}
                                    </div>
                                    <InlineTagForm onCreated={reloadPage} />
                                </div>
                            </div>

                            {/* ── SEO ── */}
                            <CamposSeo
                                datos={formData}
                                onChange={setField}
                                errors={formErrors}
                                tituloBase={formData.nombre}
                                descripcionBase={formData.descripcion}
                                prefijoUrl="/producto/"
                            />

                            {/* ── Variants Section ── */}
                            <div className="border-t border-joya-border pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-joya-black uppercase tracking-wider">
                                        Variantes {formData.variantes.length > 0 && <span className="text-joya-gray font-normal">({formData.variantes.length})</span>}
                                    </h4>
                                    <button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 text-xs bg-vino text-white px-3 py-1.5 font-medium hover:bg-vino-deep transition-colors rounded">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Agregar variante
                                    </button>
                                </div>

                                {formData.variantes.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-joya-border rounded-lg">
                                        <p className="text-sm text-joya-gray mb-2">No hay variantes</p>
                                        <button type="button" onClick={addVariant} className="text-xs text-joya-gold hover:text-joya-gold-hover transition-colors font-medium">
                                            + Agregar primera variante
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {formData.variantes.map((v, i) => (
                                            <VariantCard
                                                key={v._key}
                                                variant={v}
                                                index={i}
                                                atributos={atributos}
                                                errors={getVariantErrors(i)}
                                                onUpdate={updateVariant}
                                                onRemove={removeVariant}
                                                onSetValor={setVariantValor}
                                                onReloadAtributos={reloadPage}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Submit ── */}
                            <div className="border-t border-joya-border pt-4 flex gap-3">
                                <button type="submit" disabled={formProcessing} className="flex-1 rounded-full bg-vino text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-vino-deep transition-colors disabled:opacity-50">
                                    {formProcessing ? 'Guardando...' : editing ? 'Actualizar Producto' : 'Crear Producto'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm border border-joya-border text-joya-gray hover:bg-gray-50 transition-colors">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function ProductRow({ producto: p, isExpanded, onToggle, onEdit, deleteConfirm, onDeleteConfirm, onDelete, getPriceRange, getTotalStock }) {
    return (
        <>
            <tr className="border-b border-joya-border last:border-0 hover:bg-joya-cream/50 transition-colors">
                <td className="px-6 py-4">
                    <button onClick={onToggle} className="text-joya-gray hover:text-joya-black transition-colors">
                        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {p.variantes?.[0]?.url_foto ? (
                            <img src={p.variantes[0].url_foto} alt={p.nombre} className="w-10 h-10 rounded object-cover border border-joya-border" />
                        ) : (
                            <div className="w-10 h-10 rounded bg-joya-cream border border-joya-border flex items-center justify-center">
                                <svg className="w-5 h-5 text-joya-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        )}
                        <span className="font-medium text-joya-black">{p.nombre}</span>
                    </div>
                </td>
                <td className="px-6 py-4 text-joya-gray">{p.categoria?.categoria || '\u2014'}</td>
                <td className="px-6 py-4 text-joya-gray">{p.variantes?.length || 0}</td>
                <td className="px-6 py-4 text-joya-gray">{getPriceRange(p.variantes)}</td>
                <td className="px-6 py-4">
                    <span className={getTotalStock(p.variantes) === 0 ? 'text-red-500 font-medium' : 'text-joya-gray'}>{getTotalStock(p.variantes)}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                        {p.tags?.map((tag) => <span key={tag.id} className="text-xs bg-joya-gold/10 text-joya-gold px-2 py-0.5 rounded">{tag.descripcion}</span>)}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={onEdit} className="text-joya-gray hover:text-joya-gold transition-colors p-1" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {deleteConfirm === p.id ? (
                            <div className="flex items-center gap-1">
                                <button onClick={() => onDelete(p.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Si</button>
                                <button onClick={() => onDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300">No</button>
                            </div>
                        ) : (
                            <button onClick={() => onDeleteConfirm(p.id)} className="text-joya-gray hover:text-red-500 transition-colors p-1" title="Eliminar">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        )}
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan={8} className="bg-gray-50/80 px-6 py-4">
                        <h4 className="text-sm font-semibold text-joya-black mb-3">Variantes de {p.nombre}</h4>
                        {p.variantes?.length > 0 ? (
                            <div className="bg-white border border-joya-border rounded-[18px] overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b border-joya-border bg-gray-50/50">
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">SKU</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Atributos</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Precio</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Stock</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Fotos</th>
                                    </tr></thead>
                                    <tbody>
                                        {p.variantes.map((v) => (
                                            <tr key={v.id} className="border-b border-joya-border last:border-0 hover:bg-joya-cream/30">
                                                <td className="px-4 py-2.5 text-joya-gray font-mono">{v.sku || '\u2014'}</td>
                                                <td className="px-4 py-2.5 text-joya-gray">
                                                    <div className="flex flex-wrap items-center gap-1">
                                                        {v.valores?.map((val) => (
                                                            <span key={val.id} title={val.atributo?.nombre} className="inline-flex items-center gap-1 rounded-full bg-humo px-2 py-0.5">
                                                                {val.cod_hex && <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: val.cod_hex }} />}
                                                                {val.valor}
                                                            </span>
                                                        ))}
                                                        {!v.valores?.length && '\u2014'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-joya-black font-medium">Bs {parseFloat(v.precio).toFixed(2)}</td>
                                                <td className="px-4 py-2.5"><span className={v.stock === 0 ? 'text-red-500 font-medium' : 'text-joya-gray'}>{v.stock}</span></td>
                                                <td className="px-4 py-2.5">
                                                    {v.url_foto ? (
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <img src={v.url_foto} alt="Variante" className="w-8 h-8 rounded object-cover border border-joya-border" />
                                                            {v.imagenes?.length > 1 && <span className="text-joya-gray">+{v.imagenes.length - 1}</span>}
                                                        </span>
                                                    ) : <span className="text-joya-gray">{'\u2014'}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-joya-gray text-center py-4 bg-white border border-joya-border rounded-[18px]">Este producto no tiene variantes.</p>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
