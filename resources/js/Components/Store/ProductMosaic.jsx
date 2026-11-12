import { useLayoutEffect, useRef } from 'react';

/** Pack natural-height photos into a shared grid; featured pieces use two columns. */
export default function ProductMosaic({ items, children }) {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const grid = ref.current;
        let frame;
        const measure = () => {
            const gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
            for (const cell of grid.children) {
                const content = cell.firstElementChild;
                const image = content.querySelector('img');
                // Reserve space until lazy photos arrive, rather than collapsing their cells.
                const pending = image && !image.complete;
                const height = pending ? Math.max(content.getBoundingClientRect().height, cell.clientWidth) : content.getBoundingClientRect().height;
                // Round inside the gutter so fractional widths do not strand a filler tile.
                const span = `span ${Math.max(1, Math.floor(height + gap))}`;
                if (cell.style.gridRowEnd !== span) cell.style.gridRowEnd = span;
            }
        };
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };
        const observer = new ResizeObserver(schedule);
        observer.observe(grid);
        for (const cell of grid.children) observer.observe(cell.firstElementChild);
        grid.addEventListener('load', schedule, true);
        grid.addEventListener('error', schedule, true);
        measure();
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            grid.removeEventListener('load', schedule, true);
            grid.removeEventListener('error', schedule, true);
        };
    }, [items]);

    return (
        <div ref={ref} className="product-mosaic mt-8">
            {items.map((item) => (
                <div key={item.key} className={item.featured || item.wide ? 'min-w-0 col-span-2' : 'min-w-0'}>
                    {children(item)}
                </div>
            ))}
        </div>
    );
}
