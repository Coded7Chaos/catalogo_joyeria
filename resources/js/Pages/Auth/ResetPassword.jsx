import { Head, Link, useForm } from '@inertiajs/react';
import CatalogoLayout from '@/Layouts/CatalogoLayout';
import PasswordInput from '@/Components/PasswordInput';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputClass = 'w-full rounded-xl border border-joya-border px-4 py-3 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';

    return (
        <CatalogoLayout>
            <Head title="Nueva contraseña" />

            <div className="min-h-[70vh] flex items-center justify-center bg-rosa py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo-192.webp" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Crea una nueva contraseña</h1>
                        <p className="text-tinta/60 text-[15px] mt-3">Elige una contraseña que no hayas usado antes.</p>
                    </div>

                    <form onSubmit={submit} className="bg-white rounded-[28px] p-8 sm:p-9 space-y-5 shadow-[0_24px_60px_-30px_rgba(83,19,30,0.45)]">
                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className={inputClass} placeholder="tu@email.com" autoComplete="username" required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Nueva contraseña</label>
                            <PasswordInput value={data.password} onChange={(e) => setData('password', e.target.value)}
                                className={inputClass} placeholder="Mínimo 8 caracteres" autoComplete="new-password" autoFocus required />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-tinta/60">Confirmar contraseña</label>
                            <PasswordInput value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={inputClass} placeholder="Repite tu nueva contraseña" autoComplete="new-password" required />
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full rounded-full bg-vino text-white py-3.5 text-[15px] font-medium hover:bg-vino-deep transition-colors disabled:opacity-50">
                            {processing ? 'Guardando...' : 'Cambiar contraseña'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-joya-gray mt-6">
                        ¿El enlace venció?{' '}
                        <Link href="/forgot-password" className="text-joya-gold font-medium hover:text-joya-gold-hover transition-colors">Pedir uno nuevo</Link>
                    </p>
                </div>
            </div>
        </CatalogoLayout>
    );
}
