import { cn } from '../../lib/utils';

const SWATCH = {
    black: '#111', white: '#f5f5f5', silver: '#c9ccd1', graphite: '#3a3a3c', 'space gray': '#5b5d62', gold: '#d4af37', rose: '#e8b4b8',
    'ocean blue': '#2b5d8a', tan: '#c19a6b', cream: '#efe6d2', olive: '#6b7040', tortoise: '#7a4b2a', red: '#c0392b', blue: '#2e5aac', green: '#2f7d4f',
};

export default function ProductOptions({ product, color, size, setColor, setSize }) {
    return (
        <div className="space-y-5">
            {product.colors?.length > 0 && (
                <div>
                    <p className="mb-2.5 text-sm">
                        <span className="font-semibold">Color:</span> <span className="text-muted">{color || 'Select a color'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                        {product.colors.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                title={c}
                                aria-label={c}
                                aria-pressed={color === c}
                                className={cn('h-9 w-9 rounded-full border-2 p-0.5 transition', color === c ? 'border-ink' : 'border-transparent hover:border-line')}
                            >
                                <span className="block h-full w-full rounded-full border border-black/10" style={{ background: SWATCH[c.toLowerCase()] || c }} />
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {product.sizes?.length > 0 && (
                <div>
                    <p className="mb-2.5 text-sm">
                        <span className="font-semibold">Size:</span> <span className="text-muted">{size || 'Select a size'}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {product.sizes.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSize(s)}
                                aria-pressed={size === s}
                                className={cn('h-10 min-w-12 rounded-xl border px-3 text-sm font-semibold transition', size === s ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink/40')}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
