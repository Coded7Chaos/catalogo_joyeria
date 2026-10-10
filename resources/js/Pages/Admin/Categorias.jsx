import { useForm, usePage, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import AdminLayout from './AdminLayout';
import { ImageDropZone } from '@/Components/Admin/Imagenes';
import CamposSeo from '@/Components/Admin/CamposSeo';

const input = 'w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';

const vacio = { categoria: '', parent_id: '', imagen: '', descripcion: '', orden: 0, slug: '', meta_titulo: '', meta_descripcion: '' };

/** Categories in tree order: each one followed by its subcategories (any depth). */
function arbol(categorias) {
    const porPadre = {};
    categorias.forEach((c) => (porPadre[c.parent_id ?? 0] ??= []).push(c));
    const ids = new Set(categorias.map((c) => c.id));
    const salida = [];
    const recorrer = (padre, nivel) =>
        (porPadre[padre] ?? []).forEach((c) => {
            salida.push({ ...c, nivel });
            recorrer(c.id, nivel + 1);
        });
    recorrer(0, 0);
    // With a search, a subcategory may appear without its parent: list it at the first level.
    categorias.filter((c) => c.parent_id && !ids.has(c.parent_id)).forEach((c) => {
        salida.push({ ...c, nivel: 0 });
        recorrer(c.id, 1);
    });
    return salida;
}

/** A category and everything below it (it can't be moved inside them). */
const descendientes = (categorias, id) => {
    const ids = new Set([id]);
    let creció = true;
    while (creció) {
        creció = false;
        categorias.forEach((c) => {
            if (c.parent_id && ids.has(c.parent_id) && !ids.has(c.id)) {
                ids.add(c.id);
                creció = true;
            }
        });
    }
    return ids;
};

export default function Categorias({ categorias, filtros }) {
    const { flash, errors } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const searchTimeout = useRef(null);

    const form = useForm(vacio);
    const filas = useMemo(() => arbol(categorias), [categorias]);
    const nombrePorId = useMemo(() => Object.fromEntries(categorias.map((c) => [c.id, c.categoria])), [categorias]);

    const handleSearch = (value) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get('/admin/categorias', { search: value || undefined }, { preserveState: true, preserveScroll: true });
        }, 400);
    };

    const openCreate = (padre = null) => {
        setEditing(null);
        form.setData({ ...vacio, parent_id: padre?.id ?? '' });
        form.clearErrors();
        setShowModal(true);
    };

    const openEdit = (cat) => {
        setEditing(cat);
        form.setData({
            categoria: cat.categoria,
            parent_id: cat.parent_id ?? '',
            imagen: cat.imagen ?? '',
            descripcion: cat.descripcion ?? '',
            orden: cat.orden ?? 0,
            slug: cat.slug ?? '',
            meta_titulo: cat.meta_titulo ?? '',
            meta_descripcion: cat.meta_descripcion ?? '',
        });
        form.clearErrors();
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowModal(false); setEditing(null); } };
        editing ? form.put(`/admin/categorias/${editing.id}`, opts) : form.post('/admin/categorias', opts);
    };

    const handleDelete = (id) => {
        router.delete(`/admin/categorias/${id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    const bloqueadas = editing ? descendientes(categorias, editing.id) : new Set();
    const padresPosibles = arbol(categorias).filter((c) => !bloqueadas.has(c.id));

    return (
        <AdminLayout title="Categorias" active="categorias">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Categorias</h1>
                        <p className="text-joya-gray text-sm mt-1">
                            {categorias.length} categoria{categorias.length !== 1 ? 's' : ''} · las subcategorías aparecen como pestañas dentro de su categoría en la tienda.
                        </p>
                    </div>
                    <button onClick={() => openCreate()} className="inline-flex items-center gap-2 rounded-full bg-vino text-white px-5 py-2.5 text-sm font-medium hover:bg-vino-deep transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nueva Categoria
                    </button>
                </div>

                {flash?.status && (
                    <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">
                        {flash.status}
                    </div>
                )}

                {errors?.error && (
                    <div className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-200 py-3 px-4 rounded-lg">
                        {errors.error}
                    </div>
                )}

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        defaultValue={filtros.search || ''}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Buscar categorias..."
                        className="w-full sm:max-w-sm border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                    />
                </div>

                {/* Tree */}
                <div className="bg-white border border-joya-border rounded-[18px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-joya-border bg-gray-50/50">
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Nombre</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">URL</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Productos</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Orden</th>
                                    <th className="text-right px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-joya-gray">
                                            No se encontraron categorias.
                                        </td>
                                    </tr>
                                ) : (
                                    filas.map((cat) => (
                                        <tr key={cat.id} className="border-b border-joya-border last:border-0 hover:bg-joya-cream/50 transition-colors">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3" style={{ paddingLeft: `${cat.nivel * 28}px` }}>
                                                    {cat.nivel > 0 && <span className="text-joya-gray/50">↳</span>}
                                                    {cat.imagen ? (
                                                        <img src={cat.imagen} alt="" className="h-9 w-9 rounded-full object-cover border border-joya-border" />
                                                    ) : (
                                                        <span className="grid h-9 w-9 place-items-center rounded-full bg-rosa font-display text-lg text-vino/60">{cat.categoria.charAt(0)}</span>
                                                    )}
                                                    <div>
                                                        <span className="font-medium text-joya-black">{cat.categoria}</span>
                                                        {!cat.descripcion && <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700" title="Agregar una descripción ayuda al SEO">sin descripción</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <a href={`/categoria/${cat.slug}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-joya-gray hover:text-vino">
                                                    /categoria/{cat.slug}
                                                </a>
                                            </td>
                                            <td className="px-6 py-3 text-joya-gray">{cat.productos_count}</td>
                                            <td className="px-6 py-3 text-joya-gray">{cat.orden}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openCreate(cat)}
                                                        className="rounded-full border border-joya-border px-2.5 py-1 text-xs text-joya-gray transition-colors hover:border-vino hover:text-vino"
                                                        title="Agregar subcategoría"
                                                    >
                                                        + Sub
                                                    </button>
                                                    <button
                                                        onClick={() => openEdit(cat)}
                                                        className="text-joya-gray hover:text-joya-gold transition-colors p-1"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    {deleteConfirm === cat.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleDelete(cat.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Si</button>
                                                            <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300">No</button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(cat.id)}
                                                            className="text-joya-gray hover:text-red-500 transition-colors p-1"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-[28px] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-joya-border bg-white px-6 py-4">
                            <h3 className="font-semibold text-joya-black">
                                {editing ? 'Editar Categoria' : form.data.parent_id ? `Nueva subcategoría de ${nombrePorId[form.data.parent_id] ?? ''}` : 'Nueva Categoria'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-joya-gray hover:text-joya-black">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                        <input type="text" value={form.data.categoria} onChange={(e) => form.setData('categoria', e.target.value)} className={input} autoFocus required />
                                        {form.errors.categoria && <p className="text-red-500 text-xs mt-1">{form.errors.categoria}</p>}
                                    </div>
                                    <div className="grid grid-cols-[1fr_100px] gap-3">
                                        <div>
                                            <label className="text-sm font-medium text-joya-black block mb-1.5">Dentro de</label>
                                            <select value={form.data.parent_id} onChange={(e) => form.setData('parent_id', e.target.value)} className={input}>
                                                <option value="">— Categoría principal —</option>
                                                {padresPosibles.map((c) => (
                                                    <option key={c.id} value={c.id}>{'   '.repeat(c.nivel)}{c.nivel ? '↳ ' : ''}{c.categoria}</option>
                                                ))}
                                            </select>
                                            {form.errors.parent_id && <p className="text-red-500 text-xs mt-1">{form.errors.parent_id}</p>}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-joya-black block mb-1.5">Orden</label>
                                            <input type="number" min="0" value={form.data.orden} onChange={(e) => form.setData('orden', e.target.value)} className={input} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-joya-black block mb-1.5">Portada</label>
                                    <ImageDropZone value={form.data.imagen} onChange={(url) => form.setData('imagen', url)} alt={form.data.categoria} className="min-h-[128px]" />
                                    <p className="mt-1 text-[11px] text-joya-gray">Se muestra en "Comprar por colección".</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Descripción</label>
                                <textarea rows={3} value={form.data.descripcion} onChange={(e) => form.setData('descripcion', e.target.value)} placeholder="Un texto corto sobre esta colección. Aparece en su página y ayuda a posicionarla en Google." className={input} />
                                {form.errors.descripcion && <p className="text-red-500 text-xs mt-1">{form.errors.descripcion}</p>}
                            </div>

                            <CamposSeo
                                datos={form.data}
                                onChange={(campo, valor) => form.setData(campo, valor)}
                                errors={form.errors}
                                tituloBase={form.data.categoria}
                                descripcionBase={form.data.descripcion}
                                prefijoUrl="/categoria/"
                            />

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 rounded-full bg-vino text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-vino-deep transition-colors disabled:opacity-50"
                                >
                                    {form.processing ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="rounded-full px-5 py-2.5 text-sm border border-joya-border text-joya-gray hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
