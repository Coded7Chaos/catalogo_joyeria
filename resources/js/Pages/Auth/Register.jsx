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

            <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <img src="/images/logo.png" alt="Gilded" className="h-20 w-20 object-contain rounded-full mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-joya-black">Crea tu cuenta</h1>
                        <p className="text-joya-gray text-sm mt-1">Únete a la familia Gilded</p>
                    </div>

                    <form onSubmit={submit} className="bg-white border border-joya-border rounded-lg p-8 space-y-5">
                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Nombre</label>
                            <input type="text" value={data.nombre} onChange={(e) => setData('nombre', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="Tu nombre completo" autoFocus />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Correo electrónico</label>
                            <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="tu@email.com" />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Contraseña</label>
                            <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="Mínimo 8 caracteres" />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium text-joya-black block mb-1.5">Confirmar contraseña</label>
                            <input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-joya-gold focus:ring-1 focus:ring-joya-gold"
                                placeholder="Repite tu contraseña" />
                            {errors.password_confirmation && <p className="text-red-500 text-xs mt-1">{errors.password_confirmation}</p>}
                        </div>

                        <button type="submit" disabled={processing}
                            className="w-full bg-joya-gold text-joya-black py-3 text-sm font-semibold uppercase tracking-wider hover:bg-joya-gold-hover transition-colors disabled:opacity-50">
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
