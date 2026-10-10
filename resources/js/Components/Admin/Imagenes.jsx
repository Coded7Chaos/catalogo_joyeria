import { useCallback, useRef, useState } from 'react';
import axios from 'axios';

const subir = async (file) => {
    const fd = new FormData();
    fd.append('image', file);
    const { data } = await axios.post('/admin/upload-image', fd);
    return data.url;
};

const iconoFoto = (
    <svg className="mb-1 h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

/** Single image: drop or click to upload, click again to replace. */
export function ImageDropZone({ value, onChange, className = '', alt = 'Vista previa' }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    const upload = useCallback(
        async (file) => {
            if (!file || !file.type.startsWith('image/')) return;
            setUploading(true);
            try {
                onChange(await subir(file));
            } catch {
                alert('Error al subir imagen');
            } finally {
                setUploading(false);
            }
        },
        [onChange],
    );

    return (
        <div
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                upload(e.dataTransfer.files?.[0]);
            }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            className={`relative cursor-pointer rounded-[14px] border-2 border-dashed transition-colors ${
                dragging ? 'border-vino bg-rosa/50' : 'border-joya-border hover:border-vino/40'
            } ${className}`}
        >
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => upload(e.target.files?.[0])}
            />
            {uploading ? (
                <div className="flex items-center justify-center py-6">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-vino border-t-transparent" />
                    <span className="ml-2 text-xs text-joya-gray">Subiendo...</span>
                </div>
            ) : value ? (
                <div className="group relative">
                    <img src={value} alt={alt} className="h-32 w-full rounded-[12px] object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center rounded-[12px] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-xs text-white">Click o arrastra para cambiar</span>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onChange('');
                        }}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Quitar imagen"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-joya-gray">
                    {iconoFoto}
                    <span className="text-xs">Arrastra una imagen o haz click</span>
                </div>
            )}
        </div>
    );
}

/**
 * Photo gallery of a variant: several photos at once (drop or pick many), reorder
 * with the arrows, remove, and an optional description (alt text) for Google and
 * screen readers. The first photo is the cover.
 */
export function GaleriaImagenes({ value = [], onChange, max = 12 }) {
    const [dragging, setDragging] = useState(false);
    const [subiendo, setSubiendo] = useState(0);
    const inputRef = useRef(null);
    const actual = useRef(value);
    actual.current = value;

    const agregar = async (files) => {
        const imagenes = [...(files ?? [])].filter((f) => f.type.startsWith('image/')).slice(0, max - value.length);
        if (!imagenes.length) return;
        setSubiendo(imagenes.length);
        for (const file of imagenes) {
            try {
                const url = await subir(file);
                actual.current = [...actual.current, { url, alt: '' }];
                onChange(actual.current);
            } catch {
                alert(`No se pudo subir ${file.name}`);
            } finally {
                setSubiendo((n) => n - 1);
            }
        }
    };

    const mover = (i, dir) => {
        const j = i + dir;
        if (j < 0 || j >= value.length) return;
        const copia = [...value];
        [copia[i], copia[j]] = [copia[j], copia[i]];
        onChange(copia);
    };

    const quitar = (i) => onChange(value.filter((_, k) => k !== i));
    const setAlt = (i, alt) => onChange(value.map((img, k) => (k === i ? { ...img, alt } : img)));

    return (
        <div>
            {value.length > 0 && (
                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {value.map((img, i) => (
                        <div key={`${img.url}-${i}`} className="overflow-hidden rounded-[14px] border border-joya-border bg-white">
                            <div className="group relative aspect-square">
                                <img src={img.url} alt={img.alt || ''} className="h-full w-full object-cover" />
                                {i === 0 && (
                                    <span className="absolute left-1.5 top-1.5 rounded-full bg-vino px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">
                                        Portada
                                    </span>
                                )}
                                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                                    <span className="flex gap-1">
                                        <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover antes" className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm text-tinta disabled:opacity-30">
                                            ←
                                        </button>
                                        <button type="button" onClick={() => mover(i, 1)} disabled={i === value.length - 1} aria-label="Mover después" className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm text-tinta disabled:opacity-30">
                                            →
                                        </button>
                                    </span>
                                    <button type="button" onClick={() => quitar(i)} aria-label="Quitar foto" className="grid h-7 w-7 place-items-center rounded-full bg-red-500 text-sm text-white">
                                        ×
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={img.alt || ''}
                                onChange={(e) => setAlt(i, e.target.value)}
                                placeholder="Descripción (opcional)"
                                maxLength={180}
                                className="w-full border-0 border-t border-joya-border px-2 py-1.5 text-[11px] focus:ring-0"
                            />
                        </div>
                    ))}
                </div>
            )}

            {value.length < max && (
                <div
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        agregar(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => inputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed py-5 text-joya-gray transition-colors ${
                        dragging ? 'border-vino bg-rosa/50' : 'border-joya-border hover:border-vino/40'
                    }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                            agregar(e.target.files);
                            e.target.value = '';
                        }}
                    />
                    {subiendo > 0 ? (
                        <span className="flex items-center gap-2 text-xs">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-vino border-t-transparent" />
                            Subiendo {subiendo} {subiendo === 1 ? 'foto' : 'fotos'}…
                        </span>
                    ) : (
                        <>
                            {iconoFoto}
                            <span className="text-xs">Arrastra una o varias fotos, o haz click</span>
                            <span className="mt-0.5 text-[11px] text-joya-gray/70">
                                {value.length}/{max} · la primera es la portada
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
