import { Head, useForm, usePage } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import { useState } from 'react';

export default function MiCuenta({ status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [tab, setTab] = useState('perfil');

    const profileForm = useForm({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const deleteForm = useForm({ password: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch('/mi-cuenta');
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        deleteForm.delete('/mi-cuenta', {
            onSuccess: () => setShowDeleteConfirm(false),
        });
    };

    const tabs = [
        { id: 'perfil', label: 'Mi Perfil' },
        { id: 'password', label: 'Contraseña' },
        { id: 'cuenta', label: 'Cuenta' },
    ];

    return (
        <CatalogoLayout>
            <Head title="Mi Cuenta" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-joya-gold/20 border-2 border-joya-gold/40 flex items-center justify-center">
                        <span className="text-joya-gold text-2xl font-bold">
                            {user.nombre?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-joya-black">{user.nombre}</h1>
                        <p className="text-joya-gray text-sm">{user.email}</p>
                    </div>
                </div>

                {status && (
                    <div className="mb-6 text-sm font-medium text-green-600 bg-green-50 border border-green-200 py-3 px-4 rounded-lg">
                        {status}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-joya-border mb-8">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                                tab === t.id
                                    ? 'border-joya-gold text-joya-black'
                                    : 'border-transparent text-joya-gray hover:text-joya-black'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {tab === 'perfil' && (
                    <form onSubmit={submitProfile} className="bg-white border border-joya-border rounded-lg p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-joya-black mb-1">Información Personal</h2>
                        <p className="text-sm text-joya-gray mb-6">Actualiza tu nombre, correo y teléfono.</p>

                        <div className="space-y-5 max-w-lg">
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                                <input
                                    type="text"
                                    value={profileForm.data.nombre}
                                    onChange={(e) => profileForm.setData('nombre', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                />
                                {profileForm.errors.nombre && <p className="text-red-500 text-xs mt-1">{profileForm.errors.nombre}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Correo electrónico</label>
                                <input
                                    type="email"
                                    value={profileForm.data.email}
                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                />
                                {profileForm.errors.email && <p className="text-red-500 text-xs mt-1">{profileForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Teléfono</label>
                                <input
                                    type="text"
                                    value={profileForm.data.telefono}
                                    onChange={(e) => profileForm.setData('telefono', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                    placeholder="+58 412 000 0000"
                                />
                                {profileForm.errors.telefono && <p className="text-red-500 text-xs mt-1">{profileForm.errors.telefono}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={profileForm.processing}
                                className="bg-joya-black text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-joya-dark transition-colors disabled:opacity-50"
                            >
                                {profileForm.processing ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Password Tab */}
                {tab === 'password' && (
                    <form onSubmit={submitPassword} className="bg-white border border-joya-border rounded-lg p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-joya-black mb-1">Cambiar Contraseña</h2>
                        <p className="text-sm text-joya-gray mb-6">Usa una contraseña segura de al menos 8 caracteres.</p>

                        <div className="space-y-5 max-w-lg">
                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Contraseña actual</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                />
                                {passwordForm.errors.current_password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.current_password}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                {passwordForm.errors.password && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.password}</p>}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-joya-black block mb-1.5">Confirmar nueva contraseña</label>
                                <input
                                    type="password"
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                />
                                {passwordForm.errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{passwordForm.errors.password_confirmation}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={passwordForm.processing}
                                className="bg-joya-black text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-joya-dark transition-colors disabled:opacity-50"
                            >
                                {passwordForm.processing ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Account Tab */}
                {tab === 'cuenta' && (
                    <div className="bg-white border border-joya-border rounded-lg p-6 sm:p-8">
                        <h2 className="text-lg font-semibold text-joya-black mb-1">Eliminar Cuenta</h2>
                        <p className="text-sm text-joya-gray mb-6">
                            Una vez eliminada tu cuenta, todos tus datos serán borrados permanentemente. Esta acción no se puede deshacer.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="bg-red-500 text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider hover:bg-red-600 transition-colors"
                            >
                                Eliminar mi cuenta
                            </button>
                        ) : (
                            <form onSubmit={submitDelete} className="border border-red-200 bg-red-50 rounded-lg p-6 max-w-lg">
                                <p className="text-sm text-red-700 font-medium mb-4">
                                    Ingresa tu contraseña para confirmar la eliminación de tu cuenta.
                                </p>
                                <input
                                    type="password"
                                    value={deleteForm.data.password}
                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                    className="w-full border border-red-300 rounded-lg px-4 py-2.5 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 mb-4"
                                    placeholder="Tu contraseña"
                                />
                                {deleteForm.errors.password && <p className="text-red-500 text-xs mb-4">{deleteForm.errors.password}</p>}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={deleteForm.processing}
                                        className="bg-red-600 text-white px-5 py-2 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {deleteForm.processing ? 'Eliminando...' : 'Confirmar Eliminación'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowDeleteConfirm(false); deleteForm.reset(); }}
                                        className="px-5 py-2 text-sm text-joya-gray border border-joya-border hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </CatalogoLayout>
    );
}
