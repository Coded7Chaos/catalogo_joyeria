import { Head, Link, useForm } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <CatalogoLayout>
            <Head title="Recuperar contraseña" />

            <div className="min-h-[70vh] flex items-center justify-center bg-rosa py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo-192.webp" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">¿Olvidaste tu contraseña?</h1>
                        <p className="text-tinta/60 text-[15px] mt-3">
                            Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-700 text-center bg-green-50 border border-green-200 py-3 px-4 rounded-lg">{status}</div>
                    )}

                    <form onSubmit={submit} className="bg-white rounded-[28px] p-8 sm:p-9 space-y-5 shadow-[0_24px_60px_-30px_rgba(83,19,30,0.45)]">
                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25"
                                placeholder="tu@email.com" autoComplete="email" autoFocus required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full rounded-full bg-vino text-white py-3.5 text-[15px] font-medium hover:bg-vino-deep transition-colors disabled:opacity-50">
                            {processing ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-joya-gray mt-6">
                        ¿Ya la recordaste?{' '}
                        <Link href="/login" className="text-joya-gold font-medium hover:text-joya-gold-hover transition-colors">Volver a iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </CatalogoLayout>
    );
}
