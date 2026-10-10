import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';

export default function Tags({ tags, filtros }) {
    const { flash, errors } = usePage().props;
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const searchTimeout = useRef(null);

    const form = useForm({ descripcion: '' });

    const handleSearch = (value) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            router.get('/admin/tags', { search: value || undefined }, { preserveState: true, preserveScroll: true });
        }, 400);
    };

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setShowModal(true);
    };

    const openEdit = (tag) => {
        setEditing(tag);
        form.setData({ descripcion: tag.descripcion });
        form.clearErrors();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
    };

    const submitForm = (e) => {
        e.preventDefault();
        const opts = { onSuccess: () => { setShowModal(false); setEditing(null); } };
        editing ? form.put(`/admin/tags/${editing.id}`, opts) : form.post('/admin/tags', opts);
    };

    const handleDelete = (id) => {
        router.delete(`/admin/tags/${id}`, {
            onSuccess: () => setDeleteConfirm(null),
        });
    };

    return (
        <AdminLayout title="Tags" active="tags">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Tags</h1>
                        <p className="text-joya-gray text-sm mt-1">{tags.total} tag{tags.total !== 1 ? 's' : ''} en total</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-full bg-vino text-white px-5 py-2.5 text-sm font-medium hover:bg-vino-deep transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo Tag
                    </button>
                </div>

                {/* Flash status */}
                {flash?.status && (
                    <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">
                        {flash.status}
                    </div>
                )}

                {/* Error banner */}
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
                        placeholder="Buscar tags..."
                        className="w-full sm:max-w-sm border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                    />
                </div>

                {/* Table */}
                <div className="bg-white border border-joya-border rounded-[18px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-joya-border bg-gray-50/50">
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Descripcion</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Productos</th>
                                    <th className="text-right px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tags.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="text-center py-12 text-joya-gray">
                                            No se encontraron tags.
                                        </td>
                                    </tr>
                                ) : (
                                    tags.data.map((tag) => (
                                        <tr key={tag.id} className="border-b border-joya-border last:border-0 hover:bg-joya-cream/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="inline-block text-xs font-medium bg-joya-gold/10 text-joya-gold px-3 py-1 rounded-full">
                                                    {tag.descripcion}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-joya-gray">{tag.productos_count}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(tag)}
                                                        className="text-joya-gray hover:text-joya-gold transition-colors p-1"
                                                        title="Editar"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    {deleteConfirm === tag.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleDelete(tag.id)}
                                                                className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                            >
                                                                Si
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirm(null)}
                                                                className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
                                                            >
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirm(tag.id)}
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

                    {/* Pagination */}
                    {tags.last_page > 1 && (
                        <div className="border-t border-joya-border px-6 py-4 flex items-center justify-between">
                            <p className="text-xs text-joya-gray">
                                Mostrando {tags.from}&ndash;{tags.to} de {tags.total}
                            </p>
                            <div className="flex gap-1">
                                {tags.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-xs rounded transition-colors ${
                                            link.active
                                                ? 'bg-vino text-white'
                                                : link.url
                                                    ? 'text-joya-gray hover:text-joya-black'
                                                    : 'text-joya-gray/30 cursor-default'
                                        }`}
                                        preserveState
                                        preserveScroll
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border">
                            <h3 className="font-semibold text-joya-black">{editing ? 'Editar Tag' : 'Nuevo Tag'}</h3>
                            <button onClick={closeModal} className="text-joya-gray hover:text-joya-black">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={submitForm} className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Descripcion</label>
                                <input
                                    type="text"
                                    value={form.data.descripcion}
                                    onChange={(e) => form.setData('descripcion', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                    autoFocus
                                    required
                                />
                                {form.errors.descripcion && <p className="text-red-500 text-xs mt-1">{form.errors.descripcion}</p>}
                            </div>

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
                                    onClick={closeModal}
                                    className="px-5 py-2.5 text-sm border border-joya-border text-joya-gray hover:bg-gray-50 transition-colors"
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
