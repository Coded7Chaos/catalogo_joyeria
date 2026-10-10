export const slugify = (texto = '') =>
    texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 160);

const input = 'w-full rounded-lg border border-joya-border px-4 py-2.5 text-sm focus:border-vino focus:ring-1 focus:ring-vino/25';

function Contador({ valor = '', ideal, max }) {
    const n = valor.length;
    const color = n === 0 ? 'text-joya-gray' : n > max ? 'text-red-600' : n >= ideal[0] && n <= ideal[1] ? 'text-emerald-600' : 'text-champan-deep';
    return (
        <span className={`text-[11px] ${color}`}>
            {n}/{max}
        </span>
    );
}

/**
 * Google fields of a product or category: its URL, the title and the description
 * shown in search results, with a preview of how the result will look.
 */
export default function CamposSeo({ datos, onChange, errors = {}, tituloBase = '', descripcionBase = '', prefijoUrl }) {
    const slug = datos.slug || slugify(tituloBase);
    const titulo = datos.meta_titulo || tituloBase || 'Título de la página';
    const descripcion = (datos.meta_descripcion || descripcionBase || 'Descripción que verá la gente en Google…').replace(/\s+/g, ' ');
    const dominio = typeof window !== 'undefined' ? window.location.host : 'tutienda.com';

    return (
        <div className="rounded-[18px] border border-joya-border bg-humo/60 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-joya-black">Google (SEO)</h4>
                    <p className="mt-1 text-xs text-joya-gray">
                        Si los dejas vacíos se usan el nombre y la descripción. Escribirlos con palabras que la gente busca ayuda a aparecer en Google.
                    </p>
                </div>
            </div>

            {/* Search result preview */}
            <div className="mb-5 rounded-xl bg-white p-4 shadow-sm ring-1 ring-joya-border">
                <p className="truncate text-xs text-[#202124]">
                    {dominio} › {prefijoUrl.replaceAll('/', ' ').trim()} › {slug || '…'}
                </p>
                <p className="mt-1 truncate text-lg leading-snug text-[#1a0dab]">{titulo}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">{descripcion}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-joya-black">URL</label>
                    <div className="flex items-center rounded-lg border border-joya-border bg-white focus-within:border-vino focus-within:ring-1 focus-within:ring-vino/25">
                        <span className="whitespace-nowrap pl-4 text-sm text-joya-gray">{prefijoUrl}</span>
                        <input
                            type="text"
                            value={datos.slug ?? ''}
                            onChange={(e) => onChange('slug', slugify(e.target.value))}
                            placeholder={slugify(tituloBase) || 'se-genera-sola'}
                            className="w-full border-0 bg-transparent py-2.5 pl-0.5 pr-4 text-sm focus:ring-0"
                        />
                    </div>
                    <p className="mt-1 text-[11px] text-joya-gray">Corta y con palabras clave. Evita cambiarla después de publicada.</p>
                    {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug}</p>}
                </div>
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-joya-black">Título para Google</label>
                        <Contador valor={datos.meta_titulo ?? ''} ideal={[30, 60]} max={70} />
                    </div>
                    <input
                        type="text"
                        value={datos.meta_titulo ?? ''}
                        onChange={(e) => onChange('meta_titulo', e.target.value)}
                        placeholder={tituloBase}
                        maxLength={70}
                        className={input}
                    />
                    {errors.meta_titulo && <p className="mt-1 text-xs text-red-500">{errors.meta_titulo}</p>}
                </div>
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-joya-black">Descripción para Google</label>
                        <Contador valor={datos.meta_descripcion ?? ''} ideal={[120, 160]} max={170} />
                    </div>
                    <textarea
                        rows={2}
                        value={datos.meta_descripcion ?? ''}
                        onChange={(e) => onChange('meta_descripcion', e.target.value)}
                        placeholder="Ej: Collar de plata 925 con dije de luna. Envíos a todo el país y atención por WhatsApp."
                        maxLength={170}
                        className={input}
                    />
                    {errors.meta_descripcion && <p className="mt-1 text-xs text-red-500">{errors.meta_descripcion}</p>}
                </div>
            </div>
        </div>
    );
}
