import { Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from './AdminLayout';
import { ImageDropZone } from '@/Components/Admin/Imagenes';

const input = 'w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';

function Contador({ valor = '', max }) {
    return <span className={`text-[11px] ${valor.length > max ? 'text-red-600' : 'text-joya-gray'}`}>{valor.length}/{max}</span>;
}

function Pendiente({ n, texto, textoOk, href }) {
    const ok = n === 0;
    return (
        <li className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-3 text-sm">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${ok ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>{ok ? '✓' : n}</span>
                {ok ? textoOk : texto.replace('{n}', n)}
            </span>
            {!ok && (
                <Link href={href} className="shrink-0 text-xs text-vino underline underline-offset-4">
                    Completar
                </Link>
            )}
        </li>
    );
}

export default function Seo({ ajustes, porDefecto, urls, estadisticas }) {
    const { flash } = usePage().props;
    const form = useForm(ajustes);
    const d = form.data;

    const titulo = d.seo_titulo_inicio || porDefecto.seo_titulo_inicio;
    const descripcion = d.seo_descripcion || porDefecto.seo_descripcion;
    const dominio = urls.sitio.replace(/^https?:\/\//, '').replace(/\/$/, '');

    return (
        <AdminLayout title="SEO" active="seo">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="font-display text-[40px] font-normal leading-none text-tinta">SEO</h1>
                    <p className="mt-1 max-w-2xl text-sm text-joya-gray">
                        Cómo aparece tu tienda en Google y cuando alguien comparte un enlace. Cada producto y categoría también tiene su propio bloque
                        "Google (SEO)" al editarlo.
                    </p>
                </div>

                {flash?.status && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">{flash.status}</div>}

                <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.put('/admin/seo', { preserveScroll: true });
                        }}
                        className="space-y-6 rounded-[18px] border border-joya-border bg-white p-6"
                    >
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-joya-black">Nombre de la tienda</label>
                            <input value={d.seo_nombre_sitio} onChange={(e) => form.setData('seo_nombre_sitio', e.target.value)} placeholder={porDefecto.seo_nombre_sitio} maxLength={60} className={input} />
                            <p className="mt-1 text-[11px] text-joya-gray">Va al final del título de cada página: "Collar Luna | {d.seo_nombre_sitio || porDefecto.seo_nombre_sitio}".</p>
                            {form.errors.seo_nombre_sitio && <p className="mt-1 text-xs text-red-500">{form.errors.seo_nombre_sitio}</p>}
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-sm font-medium text-joya-black">Título de la página de inicio</label>
                                <Contador valor={d.seo_titulo_inicio} max={70} />
                            </div>
                            <input value={d.seo_titulo_inicio} onChange={(e) => form.setData('seo_titulo_inicio', e.target.value)} placeholder={porDefecto.seo_titulo_inicio} maxLength={70} className={input} />
                            <p className="mt-1 text-[11px] text-joya-gray">Incluye qué vendes y dónde, por ejemplo: "Gilded | Joyería en Santa Cruz, Bolivia".</p>
                            {form.errors.seo_titulo_inicio && <p className="mt-1 text-xs text-red-500">{form.errors.seo_titulo_inicio}</p>}
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-sm font-medium text-joya-black">Descripción de la tienda</label>
                                <Contador valor={d.seo_descripcion} max={170} />
                            </div>
                            <textarea rows={3} value={d.seo_descripcion} onChange={(e) => form.setData('seo_descripcion', e.target.value)} placeholder={porDefecto.seo_descripcion} maxLength={170} className={input} />
                            <p className="mt-1 text-[11px] text-joya-gray">Se usa en la página de inicio y en las páginas que no tienen descripción propia.</p>
                            {form.errors.seo_descripcion && <p className="mt-1 text-xs text-red-500">{form.errors.seo_descripcion}</p>}
                        </div>
                        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-joya-black">Imagen para compartir</label>
                                <ImageDropZone value={d.seo_imagen} onChange={(url) => form.setData('seo_imagen', url)} className="min-h-[128px]" />
                            </div>
                            <p className="self-end text-[11px] text-joya-gray">
                                Aparece al compartir tu tienda por WhatsApp, Facebook o Instagram. Ideal: 1200 × 630 px. Los productos usan su propia foto.
                            </p>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-joya-black">Verificación de Google Search Console</label>
                            <input value={d.seo_google_verificacion} onChange={(e) => form.setData('seo_google_verificacion', e.target.value)} placeholder="Ej: a1B2c3D4e5F6g7H8…" className={`${input} font-mono`} />
                            <p className="mt-1 text-[11px] text-joya-gray">
                                En Search Console elige el método "Etiqueta HTML" y pega solo el código que aparece dentro de <code>content="…"</code>.
                            </p>
                            {form.errors.seo_google_verificacion && <p className="mt-1 text-xs text-red-500">{form.errors.seo_google_verificacion}</p>}
                        </div>
                        <button type="submit" disabled={form.processing} className="rounded-full bg-vino px-7 py-3 text-sm font-medium text-white hover:bg-vino-deep disabled:opacity-50">
                            {form.processing ? 'Guardando…' : 'Guardar ajustes'}
                        </button>
                    </form>

                    <div className="space-y-6">
                        <div className="rounded-[18px] border border-joya-border bg-white p-5">
                            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-joya-gray">Así se verá en Google</p>
                            <p className="truncate text-xs text-[#202124]">{dominio}</p>
                            <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{titulo}</p>
                            <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{descripcion}</p>
                        </div>

                        <div className="overflow-hidden rounded-[18px] border border-joya-border bg-white">
                            <p className="px-5 pt-4 text-[11px] uppercase tracking-[0.2em] text-joya-gray">Al compartir el enlace</p>
                            <div className="m-4 overflow-hidden rounded-xl border border-joya-border">
                                <div className="aspect-[1200/630] bg-rosa">
                                    <img src={d.seo_imagen || '/images/logo-512.png'} alt="" className={`h-full w-full ${d.seo_imagen ? 'object-cover' : 'object-contain p-6'}`} />
                                </div>
                                <div className="bg-humo px-3 py-2">
                                    <p className="text-[11px] uppercase text-joya-gray">{dominio}</p>
                                    <p className="truncate text-sm font-medium text-tinta">{titulo}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[18px] border border-joya-border bg-white p-5">
                            <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-joya-gray">Pendientes</p>
                            <ul className="divide-y divide-joya-border">
                                <Pendiente n={estadisticas.productosSinDescripcion} texto="{n} productos sin descripción" textoOk="Todos los productos tienen descripción" href="/admin/productos" />
                                <Pendiente n={estadisticas.productosSinFoto} texto="{n} productos sin fotos" textoOk="Todos los productos tienen fotos" href="/admin/productos" />
                                <Pendiente n={estadisticas.categoriasSinDescripcion} texto="{n} categorías sin descripción" textoOk="Todas las categorías tienen descripción" href="/admin/categorias" />
                            </ul>
                        </div>

                        <div className="rounded-[18px] border border-joya-border bg-white p-5 text-sm">
                            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-joya-gray">Para que Google te encuentre</p>
                            <ol className="list-decimal space-y-2 pl-4 text-joya-gray">
                                <li>
                                    Entra a{' '}
                                    <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-vino underline">
                                        Google Search Console
                                    </a>{' '}
                                    y agrega <b className="text-tinta">{dominio}</b>.
                                </li>
                                <li>Verifica con "Etiqueta HTML" pegando el código aquí al lado.</li>
                                <li>
                                    En "Sitemaps" envía <code className="text-tinta">sitemap.xml</code>. Se actualiza solo con cada producto.
                                </li>
                            </ol>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <a href={urls.sitemap} target="_blank" rel="noopener noreferrer" className="rounded-full border border-joya-border px-3.5 py-1.5 text-xs text-joya-gray hover:border-vino hover:text-vino">
                                    Ver sitemap.xml
                                </a>
                                <a href={urls.robots} target="_blank" rel="noopener noreferrer" className="rounded-full border border-joya-border px-3.5 py-1.5 text-xs text-joya-gray hover:border-vino hover:text-vino">
                                    Ver robots.txt
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
