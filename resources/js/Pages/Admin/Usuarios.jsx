import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import PasswordInput from '@/Components/PasswordInput';

const inputClass = 'w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';
// wa.me necesita el código de país: a los números bolivianos de 8 dígitos se les antepone 591.
const linkWhatsapp = (tel) => { const d = tel.replace(/[^0-9]/g, ''); return d.length === 8 ? `591${d}` : d; };
const nuevoUsuarioVacio = { nombre: '', email: '', telefono: '', role: 'admin', password: '', password_confirmation: '' };

export default function Usuarios({ usuarios, filtros }) {
    const { auth, flash, errors: pageErrors } = usePage().props;
    const [editing, setEditing] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const searchTimeout = useRef(null);

    const [creating, setCreating] = useState(false);

    const form = useForm({ nombre: '', email: '', telefono: '', role: 'cliente' });
    const createForm = useForm(nuevoUsuarioVacio);

    const buscar = (cambios) => {
        const params = { search: filtros.search || undefined, rol: filtros.rol || undefined, ...cambios };
        router.get('/admin/usuarios', params, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (value) => {
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => buscar({ search: value || undefined }), 400);
    };

    const openCreate = () => { createForm.reset(); createForm.clearErrors(); setCreating(true); };
    const cancelCreate = () => { setCreating(false); createForm.reset(); createForm.clearErrors(); };
    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/admin/usuarios', {
            preserveScroll: true,
            onSuccess: () => { setCreating(false); createForm.reset(); },
            onError: () => createForm.reset('password', 'password_confirmation'),
        });
    };

    const openEdit = (u) => {
        setEditing(u);
        form.setData({ nombre: u.nombre, email: u.email, telefono: u.telefono || '', role: u.role });
        form.clearErrors();
    };
    const cancelEdit = () => { setEditing(null); form.reset(); form.clearErrors(); };
    const submitForm = (e) => {
        e.preventDefault();
        form.put(`/admin/usuarios/${editing.id}`, { onSuccess: () => { setEditing(null); form.reset(); } });
    };
    const handleDelete = (id) => router.delete(`/admin/usuarios/${id}`, { onSuccess: () => setDeleteConfirm(null) });

    return (
        <AdminLayout title="Usuarios" active="usuarios">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Usuarios</h1>
                        <p className="text-joya-gray text-sm mt-1">{usuarios.total} usuario{usuarios.total !== 1 ? 's' : ''} registrado{usuarios.total !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-full bg-vino text-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-vino-deep transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo usuario
                    </button>
                </div>

                {flash?.status && <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">{flash.status}</div>}
                {pageErrors?.error && <div className="mb-6 text-sm font-medium text-red-600 bg-red-50 border border-red-200 py-3 px-4 rounded-lg">{pageErrors.error}</div>}

                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    <input type="text" defaultValue={filtros.search || ''} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por nombre, email o teléfono..." className="w-full sm:max-w-sm border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                    <select value={filtros.rol || ''} onChange={(e) => buscar({ rol: e.target.value || undefined })} className="w-full sm:w-48 border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25">
                        <option value="">Todos los roles</option>
                        <option value="admin">Administradores</option>
                        <option value="cliente">Clientes</option>
                    </select>
                </div>

                <div className="bg-white border border-joya-border rounded-[18px] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-joya-border bg-gray-50/50">
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Usuario</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Email</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Teléfono</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Rol</th>
                                    <th className="text-left px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Registro</th>
                                    <th className="text-right px-6 py-3 font-medium text-joya-gray uppercase tracking-wider text-xs">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.data.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-12 text-joya-gray">No se encontraron usuarios.</td></tr>
                                ) : usuarios.data.map((u) => (
                                    <tr key={u.id} className="border-b border-joya-border last:border-0 hover:bg-joya-cream/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-joya-gold/10 border border-joya-gold/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-joya-gold text-xs font-bold">{u.nombre?.charAt(0)?.toUpperCase()}</span>
                                                </div>
                                                <span className="font-medium text-joya-black">{u.nombre}</span>
                                                {u.id === auth.user?.id && <span className="text-[10px] bg-joya-gold/10 text-joya-gold px-1.5 py-0.5 rounded font-medium">Tu</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-joya-gray">{u.email}</td>
                                        <td className="px-6 py-4 text-joya-gray whitespace-nowrap">
                                            {u.telefono ? (
                                                <a href={`https://wa.me/${linkWhatsapp(u.telefono)}`} target="_blank" rel="noopener noreferrer" className="hover:text-vino transition-colors" title="Abrir en WhatsApp">{u.telefono}</a>
                                            ) : <span className="text-joya-gray/40">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium px-2 py-1 rounded ${u.role === 'admin' ? 'bg-joya-gold/10 text-joya-gold' : 'bg-gray-100 text-joya-gray'}`}>
                                                {u.role === 'admin' ? 'Administrador' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-joya-gray text-xs">
                                            {new Date(u.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEdit(u)} className="text-joya-gray hover:text-joya-gold transition-colors p-1" title="Editar">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                {u.id !== auth.user?.id && (
                                                    deleteConfirm === u.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleDelete(u.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Si</button>
                                                            <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300">No</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setDeleteConfirm(u.id)} className="text-joya-gray hover:text-red-500 transition-colors p-1" title="Eliminar">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {usuarios.last_page > 1 && (
                        <div className="border-t border-joya-border px-6 py-4 flex items-center justify-between">
                            <p className="text-xs text-joya-gray">Mostrando {usuarios.from}–{usuarios.to} de {usuarios.total}</p>
                            <div className="flex gap-1">
                                {usuarios.links.map((link, i) => (
                                    <Link key={i} href={link.url || '#'} className={`px-3 py-1 text-xs rounded transition-colors ${link.active ? 'bg-vino text-white' : link.url ? 'text-joya-gray hover:text-joya-black' : 'text-joya-gray/30 cursor-default'}`} preserveState preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {editing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={cancelEdit}>
                    <div className="bg-white rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border">
                            <h3 className="font-semibold text-joya-black">Editar Usuario</h3>
                            <button onClick={cancelEdit} className="text-joya-gray hover:text-joya-black">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitForm} className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                <input type="text" value={form.data.nombre} onChange={(e) => form.setData('nombre', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                                {form.errors.nombre && <p className="text-red-500 text-xs mt-1">{form.errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Email</label>
                                <input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                                {form.errors.email && <p className="text-red-500 text-xs mt-1">{form.errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Teléfono</label>
                                <input type="tel" value={form.data.telefono} onChange={(e) => form.setData('telefono', e.target.value)} className={inputClass} placeholder="Ej. 71234567" />
                                {form.errors.telefono && <p className="text-red-500 text-xs mt-1">{form.errors.telefono}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Rol</label>
                                <select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} disabled={editing.id === auth.user?.id} className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25 disabled:bg-gray-50 disabled:text-joya-gray">
                                    <option value="cliente">Cliente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                {editing.id === auth.user?.id && <p className="text-joya-gray text-xs mt-1">No puedes cambiar tu propio rol.</p>}
                                {form.errors.role && <p className="text-red-500 text-xs mt-1">{form.errors.role}</p>}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={form.processing} className="flex-1 rounded-full bg-vino text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-vino-deep transition-colors disabled:opacity-50">
                                    {form.processing ? 'Guardando...' : 'Actualizar'}
                                </button>
                                <button type="button" onClick={cancelEdit} className="px-5 py-2.5 text-sm border border-joya-border text-joya-gray hover:bg-gray-50 transition-colors">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {creating && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={cancelCreate}>
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-joya-border">
                            <h3 className="font-semibold text-joya-black">Nuevo usuario</h3>
                            <button onClick={cancelCreate} className="text-joya-gray hover:text-joya-black">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={submitCreate} className="p-6 space-y-5">
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                <input type="text" value={createForm.data.nombre} onChange={(e) => createForm.setData('nombre', e.target.value)} className={inputClass} placeholder="Nombre completo" autoFocus />
                                {createForm.errors.nombre && <p className="text-red-500 text-xs mt-1">{createForm.errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Email</label>
                                <input type="email" value={createForm.data.email} onChange={(e) => createForm.setData('email', e.target.value)} className={inputClass} placeholder="correo@ejemplo.com" autoComplete="off" />
                                {createForm.errors.email && <p className="text-red-500 text-xs mt-1">{createForm.errors.email}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Teléfono</label>
                                <input type="tel" value={createForm.data.telefono} onChange={(e) => createForm.setData('telefono', e.target.value)} className={inputClass} placeholder="Ej. 71234567" />
                                {createForm.errors.telefono && <p className="text-red-500 text-xs mt-1">{createForm.errors.telefono}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Rol</label>
                                <select value={createForm.data.role} onChange={(e) => createForm.setData('role', e.target.value)} className={inputClass}>
                                    <option value="admin">Administrador (puede gestionar la tienda)</option>
                                    <option value="cliente">Cliente</option>
                                </select>
                                {createForm.errors.role && <p className="text-red-500 text-xs mt-1">{createForm.errors.role}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Contraseña</label>
                                <PasswordInput value={createForm.data.password} onChange={(e) => createForm.setData('password', e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
                                {createForm.errors.password && <p className="text-red-500 text-xs mt-1">{createForm.errors.password}</p>}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Confirmar contraseña</label>
                                <PasswordInput value={createForm.data.password_confirmation} onChange={(e) => createForm.setData('password_confirmation', e.target.value)} className={inputClass} placeholder="Repite la contraseña" autoComplete="new-password" />
                            </div>
                            <p className="text-xs text-joya-gray">Comparte la contraseña con la persona; luego puede cambiarla desde "Mi cuenta" o con "¿Olvidaste tu contraseña?".</p>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={createForm.processing} className="flex-1 rounded-full bg-vino text-white py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-vino-deep transition-colors disabled:opacity-50">
                                    {createForm.processing ? 'Creando...' : 'Crear usuario'}
                                </button>
                                <button type="button" onClick={cancelCreate} className="px-5 py-2.5 text-sm border border-joya-border text-joya-gray hover:bg-gray-50 transition-colors">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
