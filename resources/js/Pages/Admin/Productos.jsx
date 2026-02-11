import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import axios from 'axios';

function ImageDropZone({ value, onChange, className = '' }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const upload = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('image', file);
            const { data } = await axios.post('/admin/upload-image', fd);
            onChange(data.url);
        } catch {
            alert('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) upload(file);
    }, [upload]);

    const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true); }, []);
    const handleDragLeave = useCallback(() => setDragging(false), []);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragging ? 'border-joya-gold bg-joya-gold/5' : 'border-joya-border hover:border-joya-gold/50'
            } ${className}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) upload(e.target.files[0]); }}
            />
            {uploading ? (
                <div className="flex items-center justify-center py-6">
                    <div className="w-5 h-5 border-2 border-joya-gold border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-xs text-joya-gray">Subiendo...</span>
                </div>
            ) : value ? (
                <div className="relative group">
                    <img src={value} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">Click o arrastra para cambiar</span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        x
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-joya-gray">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-xs">Arrastra una imagen o haz click</span>
                </div>
            )}
        </div>
    );
}

function InlineColorForm({ onCreated }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({ color: '', cod_hex: '#000000', tipo: 'solido' });

    const submit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaving(true);
        try {
            await axios.post('/admin/colores', data);
            setData({ color: '', cod_hex: '#000000', tipo: 'solido' });
            setOpen(false);
            onCreated();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al crear color');
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
                Nuevo color
            </button>
        );
    }

    return (
        <div className="mt-2 p-3 border border-joya-border rounded-lg bg-gray-50 space-y-2" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-medium text-joya-black">Crear color</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={data.color}
                    onChange={(e) => setData({ ...data, color: e.target.value })}
                    placeholder="Nombre"
                    className="flex-1 border border-joya-border rounded px-2 py-1 text-xs focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                />
                <input
                    type="color"
                    value={data.cod_hex}
                    onChange={(e) => setData({ ...data, cod_hex: e.target.value })}
                    className="w-8 h-8 rounded border border-joya-border cursor-pointer p-0"
                />
            </div>
            <select
                value={data.tipo}
                onChange={(e) => setData({ ...data, tipo: e.target.value })}
                className="w-full border border-joya-border rounded px-2 py-1 text-xs focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
            >
                <option value="solido">Solido</option>
                <option value="metalico">Metalico</option>
                <option value="mate">Mate</option>
                <option value="brillante">Brillante</option>
            </select>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={submit}
                    disabled={!data.color || saving}
                    className="text-xs bg-joya-black text-white px-3 py-1 rounded hover:bg-joya-dark disabled:opacity-50"
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

function VariantCard({ variant, index, tallas, colores, errors, onUpdate, onRemove, onToggleColor, onReloadColors }) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const fieldError = (field) => {
        // Errors come mapped as variantes.0.precio, variantes_new.0.precio, variantes_update.0.precio
        // We receive pre-mapped errors for this variant's index
        return errors?.[field];
    };

    return (
        <div className="border border-joya-border rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-medium text-joya-black">Variante {index + 1} {variant.id ? <span className="text-xs text-joya-gray font-normal">(ID: {variant.id})</span> : <span className="text-xs text-green-600 font-normal">(Nueva)</span>}</h4>
                {confirmDelete ? (
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-red-600 mr-1">Eliminar?</span>
                        <button type="button" onClick={() => { onRemove(variant._key); setConfirmDelete(false); }} className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600">Si</button>
                        <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-300">No</button>
                    </div>
                ) : (
                    <button type="button" onClick={() => setConfirmDelete(true)} className="text-joya-gray hover:text-red-500 transition-colors p-1" title="Eliminar variante">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                )}
            </div>

            <div className="flex gap-4">
                {/* Image */}
                <div className="w-32 flex-shrink-0">
                    <ImageDropZone value={variant.url_foto} onChange={(url) => onUpdate(variant._key, 'url_foto', url)} className="h-full min-h-[100px]" />
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs font-medium text-joya-gray block mb-1">SKU</label>
                            <input type="text" value={variant.sku} onChange={(e) => onUpdate(variant._key, 'sku', e.target.value)} placeholder="SKU-001" className="w-full border border-joya-border rounded px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                            {fieldError('sku') && <p className="text-red-500 text-xs mt-0.5">{fieldError('sku')}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-joya-gray block mb-1">Talla</label>
                            <select value={variant.id_talla} onChange={(e) => onUpdate(variant._key, 'id_talla', e.target.value)} className="w-full border border-joya-border rounded px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold">
                                <option value="">Sin talla</option>
                                {tallas.map((t) => <option key={t.id} value={t.id}>{t.talla}</option>)}
                            </select>
                            {fieldError('id_talla') && <p className="text-red-500 text-xs mt-0.5">{fieldError('id_talla')}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-joya-gray block mb-1">Precio</label>
                            <input type="number" step="0.01" min="0" value={variant.precio} onChange={(e) => onUpdate(variant._key, 'precio', e.target.value)} placeholder="0.00" className="w-full border border-joya-border rounded px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                            {fieldError('precio') && <p className="text-red-500 text-xs mt-0.5">{fieldError('precio')}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-joya-gray block mb-1">Stock</label>
                            <input type="number" min="0" value={variant.stock} onChange={(e) => onUpdate(variant._key, 'stock', e.target.value)} placeholder="0" className="w-full border border-joya-border rounded px-3 py-2 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                            {fieldError('stock') && <p className="text-red-500 text-xs mt-0.5">{fieldError('stock')}</p>}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="text-xs font-medium text-joya-gray block mb-1">Colores</label>
                        <div className="flex flex-wrap gap-1.5">
                            {colores.map((color) => (
                                <button key={color.id} type="button" onClick={() => onToggleColor(variant._key, color.id)}
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${variant.colores.includes(color.id) ? 'bg-joya-black text-white border-joya-black' : 'bg-white text-joya-gray border-joya-border hover:border-joya-gold/50'}`}>
                                    <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: color.cod_hex || '#ccc' }} />
                                    {color.color}
                                </button>
                            ))}
                            {colores.length === 0 && <span className="text-xs text-joya-gray">No hay colores.</span>}
                        </div>
                        <InlineColorForm onCreated={onReloadColors} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const emptyFormData = () => ({
    nombre: '',
    id_categoria: '',
    url_foto: '',
    tags: [],
    variantes: [],
    variantes_delete: [],
});

export default function Productos({ productos, categorias, colores, tallas, tags: allTags, filtros }) {
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
            variantes: [...prev.variantes, { _key: crypto.randomUUID(), id: null, sku: '', id_talla: '', precio: '', stock: '', url_foto: '', colores: [] }],
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

    const toggleVariantColor = (key, colorId) => {
        setFormData((prev) => ({
            ...prev,
            variantes: prev.variantes.map((v) =>
                v._key === key ? { ...v, colores: v.colores.includes(colorId) ? v.colores.filter((id) => id !== colorId) : [...v.colores, colorId] } : v
            ),
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
            url_foto: p.url_foto || '',
            tags: p.tags?.map((t) => t.id) || [],
            variantes: (p.variantes || []).map((v) => ({
                _key: crypto.randomUUID(),
                id: v.id,
                sku: v.sku || '',
                id_talla: v.id_talla || '',
                precio: v.precio || '',
                stock: v.stock ?? '',
                url_foto: v.url_foto || '',
                colores: v.colores?.map((c) => c.id) || [],
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
            url_foto: formData.url_foto || null,
            tags: formData.tags,
        };

        const opts = {
            onSuccess: () => { setShowModal(false); setEditing(null); },
            onError: (errors) => setFormErrors(errors),
            onFinish: () => setFormProcessing(false),
        };

        if (editing) {
            // Partition into update (have id) and new (no id)
            const variantesUpdate = formData.variantes
                .filter((v) => v.id)
                .map(({ _key, ...rest }) => rest);
            const variantesNew = formData.variantes
                .filter((v) => !v.id)
                .map(({ _key, id, ...rest }) => rest);

            router.put(`/admin/productos/${editing.id}`, {
                ...payload,
                variantes_update: variantesUpdate,
                variantes_new: variantesNew,
                variantes_delete: formData.variantes_delete,
            }, opts);
        } else {
            // All variantes are new
            const variantes = formData.variantes.map(({ _key, id, ...rest }) => rest);
            router.post('/admin/productos', { ...payload, variantes }, opts);
        }
    };

    const handleDelete = (id) => router.delete(`/admin/productos/${id}`, { onSuccess: () => setDeleteConfirm(null) });

    const reloadPage = () => router.reload({ only: ['colores'] });

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
        return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} \u2013 $${max.toFixed(2)}`;
    };
    const getTotalStock = (vs) => vs?.reduce((s, v) => s + (v.stock || 0), 0) || 0;

    return (
        <AdminLayout title="Productos" active="productos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-joya-black">Productos</h1>
                        <p className="text-joya-gray text-sm mt-1">{productos.total} producto{productos.total !== 1 ? 's' : ''} en total</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center gap-2 bg-joya-black text-white px-5 py-2.5 text-sm font-medium hover:bg-joya-dark transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo Producto
                    </button>
                </div>

                {flash?.status && <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">{flash.status}</div>}

                <div className="mb-6">
                    <input type="text" defaultValue={filtros.search || ''} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar productos..." className="w-full sm:max-w-sm border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" />
                </div>

                {/* Table */}
                <div className="bg-white border border-joya-border rounded-lg overflow-hidden">
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
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 text-xs rounded transition-colors ${link.active ? 'bg-joya-black text-white' : link.url ? 'text-joya-gray hover:text-joya-black' : 'text-joya-gray/30 cursor-default'}`} preserveState preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unified Product + Variants Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="md:col-span-1">
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                        <input type="text" value={formData.nombre} onChange={(e) => setField('nombre', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold" autoFocus />
                                        {formErrors.nombre && <p className="text-red-500 text-xs mt-1">{formErrors.nombre}</p>}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Categoria</label>
                                        <select value={formData.id_categoria} onChange={(e) => setField('id_categoria', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold">
                                            <option value="">Seleccionar categoria</option>
                                            {categorias.map((c) => <option key={c.id} value={c.id}>{c.categoria}</option>)}
                                        </select>
                                        {formErrors.id_categoria && <p className="text-red-500 text-xs mt-1">{formErrors.id_categoria}</p>}
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Imagen</label>
                                        <ImageDropZone value={formData.url_foto} onChange={(url) => setField('url_foto', url)} />
                                        {formErrors.url_foto && <p className="text-red-500 text-xs mt-1">{formErrors.url_foto}</p>}
                                    </div>
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
                                </div>
                            </div>

                            {/* ── Variants Section ── */}
                            <div className="border-t border-joya-border pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-joya-black uppercase tracking-wider">
                                        Variantes {formData.variantes.length > 0 && <span className="text-joya-gray font-normal">({formData.variantes.length})</span>}
                                    </h4>
                                    <button type="button" onClick={addVariant} className="inline-flex items-center gap-1.5 text-xs bg-joya-black text-white px-3 py-1.5 font-medium hover:bg-joya-dark transition-colors rounded">
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
                                                tallas={tallas}
                                                colores={colores}
                                                errors={getVariantErrors(i)}
                                                onUpdate={updateVariant}
                                                onRemove={removeVariant}
                                                onToggleColor={toggleVariantColor}
                                                onReloadColors={reloadPage}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Submit ── */}
                            <div className="border-t border-joya-border pt-4 flex gap-3">
                                <button type="submit" disabled={formProcessing} className="flex-1 bg-joya-black text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-joya-dark transition-colors disabled:opacity-50">
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
                        {p.url_foto ? (
                            <img src={p.url_foto} alt={p.nombre} className="w-10 h-10 rounded object-cover border border-joya-border" />
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
                            <div className="bg-white border border-joya-border rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead><tr className="border-b border-joya-border bg-gray-50/50">
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">SKU</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Talla</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Precio</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Stock</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Colores</th>
                                        <th className="text-left px-4 py-2 font-medium text-joya-gray uppercase tracking-wider">Foto</th>
                                    </tr></thead>
                                    <tbody>
                                        {p.variantes.map((v) => (
                                            <tr key={v.id} className="border-b border-joya-border last:border-0 hover:bg-joya-cream/30">
                                                <td className="px-4 py-2.5 text-joya-gray font-mono">{v.sku || '\u2014'}</td>
                                                <td className="px-4 py-2.5 text-joya-gray">{v.talla?.talla || '\u2014'}</td>
                                                <td className="px-4 py-2.5 text-joya-black font-medium">${parseFloat(v.precio).toFixed(2)}</td>
                                                <td className="px-4 py-2.5"><span className={v.stock === 0 ? 'text-red-500 font-medium' : 'text-joya-gray'}>{v.stock}</span></td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1">
                                                        {v.colores?.map((c) => <span key={c.id} title={c.color} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.cod_hex || '#ccc' }} />)}
                                                        {(!v.colores || v.colores.length === 0) && <span className="text-joya-gray">{'\u2014'}</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    {v.url_foto ? <img src={v.url_foto} alt="Variante" className="w-8 h-8 rounded object-cover border border-joya-border" /> : <span className="text-joya-gray">{'\u2014'}</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-joya-gray text-center py-4 bg-white border border-joya-border rounded-lg">Este producto no tiene variantes.</p>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}
