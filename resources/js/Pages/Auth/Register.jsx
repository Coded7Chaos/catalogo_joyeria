import { Head, Link, useForm } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        nombre: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <CatalogoLayout>
            <Head title="Crear Cuenta" />

            <div className="min-h-[70vh] flex items-center justify-center bg-rosa py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo.png" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Crea tu cuenta</h1>
                        <p className="text-tinta/60 text-[15px] mt-3">Únete a la familia Gilded</p>
                    </div>

                    <form onSubmit={submit} className="bg-white rounded-[28px] p-8 sm:p-9 space-y-5 shadow-[0_24px_60px_-30px_rgba(83,19,30,0.45)]">
                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Nombre</label>
                            <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="Tu nombre completo" autoFocus />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="tu@email.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Contraseña</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="Mínimo 8 caracteres" />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Confirmar contraseña</label>
                            <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="Repite tu contraseña" />
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full rounded-full bg-vino text-white py-3.5 text-[15px] font-medium hover:bg-vino-deep transition-colors disabled:opacity-50">
                            {processing ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-joya-gray mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-joya-gold font-medium hover:text-joya-gold-hover transition-colors">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </CatalogoLayout>
    );
}
