import { useEffect, useState } from 'react';
import { imageFallbacks } from '@/lib/catalogo';
import { GemIcon } from './Icons';

/**
 * <img> that swaps a missing design photo for its stand-in and, if a photo
 * still can't load (or there is none), shows a soft placeholder instead.
 */
export default function StoreImage({ src, alt = '', className = '', style, ...props }) {
    const fallbackSrc = imageFallbacks[src];
    const [stage, setStage] = useState(src ? 'src' : 'error');

    useEffect(() => {
        setStage(src ? 'src' : 'error');
    }, [src]);

    if (stage === 'error') {
        return (
            <div
                role="img"
                aria-label={alt}
                className={`grid place-items-center bg-gradient-to-br from-rosa-deep to-rosa text-vino/30 ${className}`}
                style={style}
            >
                <GemIcon width={40} height={40} />
            </div>
        );
    }

    return (
        <img
            src={stage === 'fallback' ? fallbackSrc : src}
            alt={alt}
            className={className}
            style={style}
            onError={() => setStage((s) => (s === 'src' && fallbackSrc ? 'fallback' : 'error'))}
            {...props}
        />
    );
}
