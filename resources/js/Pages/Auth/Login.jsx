import { Head, Link, useForm } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

export default function Login({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <CatalogoLayout>
            <Head title="Iniciar Sesión" />

            <div className="min-h-[70vh] flex items-center justify-center bg-rosa py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo-192.webp" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Bienvenido de vuelta</h1>
                        <p className="text-tinta/60 text-[15px] mt-3">Inicia sesión en tu cuenta de Gilded</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center bg-green-50 py-2 rounded-lg">{status}</div>
                    )}

                    <form onSubmit={submit} className="bg-white rounded-[28px] p-8 sm:p-9 space-y-5 shadow-[0_24px_60px_-30px_rgba(83,19,30,0.45)]">
                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="tu@email.com" autoFocus />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Contraseña</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="Tu contraseña" />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-joya-border text-joya-gold focus:ring-joya-gold" />
                            <span className="text-sm text-joya-gray">Recordarme</span>
                        </label>

                        <button type="submit" disabled={processing}
                            className="w-full rounded-full bg-vino text-white py-3.5 text-[15px] font-medium hover:bg-vino-deep transition-colors disabled:opacity-50">
                            {processing ? 'Ingresando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-joya-gray mt-6">
                        ¿No tienes cuenta?{' '}
                        <Link href="/register" className="text-joya-gold font-medium hover:text-joya-gold-hover transition-colors">Crear cuenta</Link>
                    </p>
                </div>
            </div>
        </CatalogoLayout>
    );
}
