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

            <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo.png" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-joya-black">Bienvenido de vuelta</h1>
                        <p className="text-joya-gray text-sm mt-1">Inicia sesión en tu cuenta de Gilded</p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 text-center bg-green-50 py-2 rounded-lg">{status}</div>
                    )}

                    <form onSubmit={submit} className="bg-white border border-joya-border rounded-lg p-8 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="tu@email.com" autoFocus />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Contraseña</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="Tu contraseña" />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-joya-border text-joya-gold focus:ring-joya-gold" />
                            <span className="text-sm text-joya-gray">Recordarme</span>
                        </label>

                        <button type="submit" disabled={processing}
                            className="w-full bg-joya-black text-white py-3 text-sm font-semibold uppercase tracking-wider hover:bg-joya-dark transition-colors disabled:opacity-50">
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
