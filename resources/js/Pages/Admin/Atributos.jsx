import { useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from './AdminLayout';

const input = 'w-full border border-joya-border rounded-lg px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';
const opts = { preserveScroll: true };

/** One value of an attribute: click to edit it in place, × to delete it. */
function ValorChip({ atributo, valor }) {
    const [editando, setEditando] = useState(false);
    const [datos, setDatos] = useState({ valor: valor.valor, cod_hex: valor.cod_hex || '#c9a46a' });
    const [confirmar, setConfirmar] = useState(false);
    const esColor = atributo.tipo === 'color';

    const guardar = (e) => {
        e.preventDefault();
        router.put(`/admin/valores/${valor.id}`, { valor: datos.valor, cod_hex: esColor ? datos.cod_hex : null }, { ...opts, onSuccess: () => setEditando(false) });
    };

    if (editando) {
        return (
            <form onSubmit={guardar} className="inline-flex items-center gap-1.5 rounded-full border border-vino bg-white py-1 pl-3 pr-1">
                {esColor && <input type="color" value={datos.cod_hex} onChange={(e) => setDatos({ ...datos, cod_hex: e.target.value })} className="h-6 w-6 cursor-pointer rounded-full border-0 p-0" />}
                <input value={datos.valor} onChange={(e) => setDatos({ ...datos, valor: e.target.value })} className="w-28 border-0 p-0 text-sm focus:ring-0" autoFocus />
                <button type="submit" className="rounded-full bg-vino px-2.5 py-0.5 text-xs text-white">Guardar</button>
                <button type="button" onClick={() => setEditando(false)} className="px-1.5 text-joya-gray">×</button>
            </form>
        );
    }

    return (
        <span className="group inline-flex items-center gap-1.5 rounded-full border border-joya-border bg-white py-1 pl-3 pr-1 text-sm">
            {esColor && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ backgroundColor: valor.cod_hex || '#ccc' }} />}
            <button type="button" onClick={() => setEditando(true)} className="hover:text-vino" title="Editar">
                {valor.valor}
            </button>
            <span className="text-[11px] text-joya-gray" title="Variantes que lo usan">{valor.variantes_count}</span>
            {confirmar ? (
                <span className="inline-flex gap-1">
                    <button type="button" onClick={() => router.delete(`/admin/valores/${valor.id}`, opts)} className="rounded-full bg-red-500 px-2 text-xs text-white">Si</button>
                    <button type="button" onClick={() => setConfirmar(false)} className="rounded-full bg-gray-200 px-2 text-xs text-gray-600">No</button>
                </span>
            ) : (
                <button type="button" onClick={() => setConfirmar(true)} aria-label={`Eliminar ${valor.valor}`} className="grid h-6 w-6 place-items-center rounded-full text-joya-gray hover:bg-red-50 hover:text-red-500">
                    ×
                </button>
            )}
        </span>
    );
}

function NuevoValor({ atributo }) {
    const form = useForm({ valor: '', cod_hex: '#c9a46a' });
    const esColor = atributo.tipo === 'color';

    const enviar = (e) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, cod_hex: esColor ? d.cod_hex : null }));
        form.post(`/admin/atributos/${atributo.id}/valores`, { ...opts, onSuccess: () => form.reset('valor') });
    };

    return (
        <form onSubmit={enviar} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-joya-border py-1 pl-3 pr-1">
            {esColor && <input type="color" value={form.data.cod_hex} onChange={(e) => form.setData('cod_hex', e.target.value)} className="h-6 w-6 cursor-pointer rounded-full border-0 p-0" />}
            <input value={form.data.valor} onChange={(e) => form.setData('valor', e.target.value)} placeholder="Nuevo valor" className="w-28 border-0 bg-transparent p-0 text-sm focus:ring-0" />
            <button type="submit" disabled={!form.data.valor || form.processing} className="rounded-full bg-vino px-2.5 py-0.5 text-xs text-white disabled:opacity-40">
                Agregar
            </button>
            {form.errors.valor && <span className="pr-2 text-xs text-red-500">{form.errors.valor}</span>}
        </form>
    );
}

export default function Atributos({ atributos }) {
    const { flash, errors } = usePage().props;
    const [modal, setModal] = useState(false);
    const [editando, setEditando] = useState(null);
    const [borrar, setBorrar] = useState(null);
    const form = useForm({ nombre: '', tipo: 'texto', filtrable: true, orden: 0 });

    const abrir = (atributo = null) => {
        setEditando(atributo);
        form.setData(atributo ? { nombre: atributo.nombre, tipo: atributo.tipo, filtrable: atributo.filtrable, orden: atributo.orden } : { nombre: '', tipo: 'texto', filtrable: true, orden: atributos.length });
        form.clearErrors();
        setModal(true);
    };

    const guardar = (e) => {
        e.preventDefault();
        const o = { ...opts, onSuccess: () => setModal(false) };
        editando ? form.put(`/admin/atributos/${editando.id}`, o) : form.post('/admin/atributos', o);
    };

    return (
        <AdminLayout title="Atributos" active="atributos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-display text-[40px] font-normal leading-none text-tinta">Atributos</h1>
                        <p className="mt-1 max-w-2xl text-sm text-joya-gray">
                            Las propiedades de tus variantes: Talla, Color, Material, Capacidad… Crea los que necesites y úsalos al editar cada producto.
                            Los marcados como filtro aparecen en el panel de filtros de la tienda.
                        </p>
                    </div>
                    <button onClick={() => abrir()} className="inline-flex items-center gap-2 rounded-full bg-vino px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-vino-deep">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo atributo
                    </button>
                </div>

                {flash?.status && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">{flash.status}</div>}
                {(errors?.error || errors?.valor || errors?.cod_hex) && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{errors.error || errors.valor || errors.cod_hex}</div>
                )}

                {atributos.length === 0 ? (
                    <div className="rounded-[18px] border border-dashed border-joya-border bg-white py-16 text-center">
                        <p className="font-display text-2xl text-joya-gray">Todavía no hay atributos</p>
                        <button onClick={() => abrir()} className="mt-4 text-sm text-vino underline underline-offset-4">Crear el primero (por ejemplo, Talla)</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {atributos.map((a) => (
                            <div key={a.id} className="rounded-[18px] border border-joya-border bg-white p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-display text-[26px] leading-none text-tinta">{a.nombre}</h2>
                                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.12em]">
                                            <span className="rounded-full bg-humo px-2.5 py-1 text-joya-gray">{a.tipo === 'color' ? 'Muestras de color' : 'Texto'}</span>
                                            <span className={`rounded-full px-2.5 py-1 ${a.filtrable ? 'bg-rosa text-vino' : 'bg-humo text-joya-gray'}`}>
                                                {a.filtrable ? 'Filtro en la tienda' : 'Sin filtro'}
                                            </span>
                                            <span className="rounded-full bg-humo px-2.5 py-1 text-joya-gray">Orden {a.orden}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => abrir(a)} className="rounded-full border border-joya-border px-3.5 py-1.5 text-xs text-joya-gray hover:border-vino hover:text-vino">Editar</button>
                                        {borrar === a.id ? (
                                            <span className="flex items-center gap-1">
                                                <button onClick={() => router.delete(`/admin/atributos/${a.id}`, { ...opts, onFinish: () => setBorrar(null) })} className="rounded bg-red-500 px-2 py-1 text-xs text-white">Si</button>
                                                <button onClick={() => setBorrar(null)} className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600">No</button>
                                            </span>
                                        ) : (
                                            <button onClick={() => setBorrar(a.id)} className="rounded-full border border-joya-border px-3.5 py-1.5 text-xs text-joya-gray hover:border-red-300 hover:text-red-500">Eliminar</button>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {a.valores.map((v) => (
                                        <ValorChip key={`${v.id}-${v.valor}-${v.cod_hex}`} atributo={a} valor={v} />
                                    ))}
                                    <NuevoValor atributo={a} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(false)}>
                    <div className="w-full max-w-md rounded-[28px] bg-white" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-joya-border px-6 py-4">
                            <h3 className="font-semibold text-joya-black">{editando ? 'Editar atributo' : 'Nuevo atributo'}</h3>
                            <button onClick={() => setModal(false)} className="text-joya-gray hover:text-joya-black">×</button>
                        </div>
                        <form onSubmit={guardar} className="space-y-5 p-6">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-joya-black">Nombre</label>
                                <input value={form.data.nombre} onChange={(e) => form.setData('nombre', e.target.value)} placeholder="Ej: Material, Largo, Capacidad" className={input} autoFocus required />
                                {form.errors.nombre && <p className="mt-1 text-xs text-red-500">{form.errors.nombre}</p>}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-joya-black">Cómo se muestra</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[['texto', 'Texto', 'Botones con el nombre (16, M, Plata…)'], ['color', 'Color', 'Muestras de color']].map(([valor, titulo, ayuda]) => (
                                        <button key={valor} type="button" onClick={() => form.setData('tipo', valor)}
                                            className={`rounded-xl border p-3 text-left transition-colors ${form.data.tipo === valor ? 'border-vino bg-rosa/40' : 'border-joya-border hover:border-vino/40'}`}>
                                            <span className="block text-sm font-medium text-joya-black">{titulo}</span>
                                            <span className="text-xs text-joya-gray">{ayuda}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <label className="flex items-center gap-2 text-sm text-joya-black">
                                    <input type="checkbox" checked={form.data.filtrable} onChange={(e) => form.setData('filtrable', e.target.checked)} className="rounded border-joya-border text-vino focus:ring-vino" />
                                    Usar como filtro en la tienda
                                </label>
                                <label className="flex items-center gap-2 text-sm text-joya-black">
                                    Orden
                                    <input type="number" min="0" value={form.data.orden} onChange={(e) => form.setData('orden', e.target.value)} className="w-20 rounded-lg border border-joya-border px-3 py-1.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25" />
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={form.processing} className="flex-1 rounded-full bg-vino py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-vino-deep disabled:opacity-50">
                                    {form.processing ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
                                </button>
                                <button type="button" onClick={() => setModal(false)} className="rounded-full border border-joya-border px-5 py-2.5 text-sm text-joya-gray hover:bg-gray-50">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
