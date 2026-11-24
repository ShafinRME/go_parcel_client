import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuChevronLeft, LuChevronRight, LuExternalLink, LuImagePlus, LuLink, LuLoaderCircle, LuPlus, LuSave, LuTrash2, LuX } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { cn } from '../../lib/utils';
import { Badge, Button, Field, PageLoader, Toggle } from '../../components/ui';
import { ChipsInput, fieldErrors, PageHeader, uploadImage } from '../components/shared';

const EMPTY = {
    title: '', slug: '', shortDescription: '', description: '', brand: '', category: '', images: [],
    price: '', compareAtPrice: '', costPrice: '', stock: 0, sku: '', tags: [], colors: [], sizes: [], specs: [],
    featured: false, status: 'active', shippingInfo: '', warranty: '', returnPolicy: '',
};

function Section({ title, description, children }) {
    return (
        <section className="card p-5 sm:p-6">
            <h3 className="font-bold">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            <div className="mt-5 space-y-4">{children}</div>
        </section>
    );
}

function ImageManager({ images, onChange, error }) {
    const ref = useRef(null);
    const [uploading, setUploading] = useState(0);
    const [url, setUrl] = useState('');

    const onFiles = async (files) => {
        const list = Array.from(files || []).slice(0, 10 - images.length);
        if (!list.length) return;
        setUploading(list.length);
        const added = [];
        for (const f of list) {
            try {
                added.push(await uploadImage(f));
            } catch (e) {
                toast.error(`${f.name}: ${errorMessage(e)}`);
            }
            setUploading((n) => n - 1);
        }
        if (added.length) onChange([...images, ...added]);
    };
    const move = (i, d) => {
        const next = [...images];
        [next[i], next[i + d]] = [next[i + d], next[i]];
        onChange(next);
    };

    return (
        <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {images.map((src, i) => (
                    <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-soft">
                        <img src={src} alt="" className="h-full w-full object-cover" />
                        {i === 0 && <span className="absolute top-1.5 left-1.5 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-bg">COVER</span>}
                        <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            <div className="flex gap-1">
                                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-black disabled:opacity-30" aria-label="Move left"><LuChevronLeft className="h-4 w-4" /></button>
                                <button type="button" disabled={i === images.length - 1} onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-black disabled:opacity-30" aria-label="Move right"><LuChevronRight className="h-4 w-4" /></button>
                            </div>
                            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))} className="grid h-7 w-7 place-items-center rounded-md bg-white/90 text-danger" aria-label="Remove image"><LuTrash2 className="h-4 w-4" /></button>
                        </div>
                    </div>
                ))}
                {Array.from({ length: uploading }).map((_, i) => (
                    <div key={`u${i}`} className="skeleton grid aspect-square place-items-center">
                        <LuLoaderCircle className="h-6 w-6 animate-spin text-muted" />
                    </div>
                ))}
                {images.length + uploading < 10 && (
                    <button
                        type="button"
                        onClick={() => ref.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            onFiles(e.dataTransfer.files);
                        }}
                        className={cn('flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-xs font-medium text-muted transition hover:border-ink/40 hover:text-ink', error ? 'border-danger' : 'border-line')}
                    >
                        <LuImagePlus className="h-6 w-6" />
                        Upload
                    </button>
                )}
            </div>
            <input
                ref={ref}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = '';
                }}
            />
            <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                    <LuLink className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste an image URL" className="input h-10 pl-9" />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={() => {
                        if (!/^https?:\/\//.test(url.trim())) return toast.error('Enter a valid http(s) URL');
                        onChange([...images, url.trim()].slice(0, 10));
                        setUrl('');
                    }}
                >
                    Add URL
                </Button>
            </div>
            <p className={cn('mt-2 text-xs', error ? 'text-danger' : 'text-muted')}>{error || 'Up to 10 images, 5 MB each. Drag & drop supported. First image is the cover.'}</p>
        </div>
    );
}

export default function ProductForm() {
    const { id } = useParams();
    const isNew = !id;
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { money } = useStore();
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => get('/categories') });
    const { data: product, isLoading } = useQuery({ queryKey: ['admin', 'product', id], queryFn: () => get(`/admin/products/${id}`), enabled: !isNew });

    useEffect(() => {
        if (product) {
            setForm({
                ...EMPTY,
                ...product,
                compareAtPrice: product.compareAtPrice ?? '',
                costPrice: product.costPrice ?? '',
                specs: product.specs || [],
            });
        }
    }, [product]);

    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? (v.target.type === 'checkbox' ? v.target.checked : v.target.value) : v }));

    const price = Number(form.price) || 0;
    const cost = Number(form.costPrice) || 0;
    const compare = Number(form.compareAtPrice) || 0;
    const margin = price && cost ? ((price - cost) / price) * 100 : null;
    const discount = compare > price && price ? Math.round(((compare - price) / compare) * 100) : 0;

    const submit = async (e) => {
        e.preventDefault();
        setErrors({});
        const body = {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
            compareAtPrice: form.compareAtPrice === '' ? null : Number(form.compareAtPrice),
            costPrice: form.costPrice === '' ? null : Number(form.costPrice),
            specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
            slug: form.slug?.trim() || undefined,
        };
        ['_id', 'createdAt', 'updatedAt', 'ratingAvg', 'ratingCount', 'soldCount', 'discountPercent'].forEach((k) => delete body[k]);
        if (!body.category) return setErrors({ category: 'Choose a category' });
        if (!body.images.length) return setErrors({ images: 'Add at least one image' });
        setSaving(true);
        try {
            const { data } = isNew ? await api.post('/admin/products', body) : await api.patch(`/admin/products/${id}`, body);
            toast.success(isNew ? 'Product created' : 'Changes saved');
            qc.invalidateQueries({ queryKey: ['admin', 'products'] });
            qc.invalidateQueries({ queryKey: ['products'] });
            qc.setQueryData(['admin', 'product', data._id], data);
            if (isNew) navigate(`/admin/products/${data._id}`, { replace: true });
        } catch (err) {
            setErrors(fieldErrors(err));
            toast.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (!isNew && isLoading) return <PageLoader />;

    return (
        <form onSubmit={submit}>
            <PageHeader
                back={
                    <Link to="/admin/products" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
                        <LuArrowLeft className="h-4 w-4" /> Products
                    </Link>
                }
                title={isNew ? 'New product' : form.title || 'Edit product'}
                actions={
                    <>
                        {!isNew && form.status === 'active' && (
                            <Button variant="outline" as="a" href={`/product/${product?.slug}`} target="_blank" rel="noreferrer">
                                <LuExternalLink className="h-4 w-4" /> View
                            </Button>
                        )}
                        <Button type="submit" loading={saving}>
                            <LuSave className="h-4 w-4" /> {isNew ? 'Create product' : 'Save changes'}
                        </Button>
                    </>
                }
            />

            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <div className="space-y-6">
                    <Section title="Basic information">
                        <Field label="Title" value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Linen Lounge Chair" required />
                        <Field label="Short description" value={form.shortDescription} onChange={set('shortDescription')} error={errors.shortDescription} placeholder="One line shown on cards and at the top of the page" />
                        <Field label="Description" error={errors.description}>
                            <textarea rows={7} value={form.description} onChange={set('description')} className={cn('input', errors.description && 'border-danger')} placeholder="Tell shoppers what makes it special…" required />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Brand" value={form.brand} onChange={set('brand')} error={errors.brand} />
                            <Field label="Category" error={errors.category}>
                                <select value={form.category} onChange={set('category')} className={cn('input', errors.category && 'border-danger')}>
                                    <option value="">Select a category</option>
                                    {categories.map((c) => (
                                        <option key={c._id} value={c.slug}>{c.name}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="Media">
                        <ImageManager images={form.images} onChange={set('images')} error={errors.images || errors['images.0']} />
                    </Section>

                    <Section title="Pricing">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Field label="Price" type="number" step="0.01" min="0" value={form.price} onChange={set('price')} error={errors.price} required />
                            <Field label="Compare-at price" type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={set('compareAtPrice')} error={errors.compareAtPrice} hint={discount ? `Shows ${discount}% off` : 'Original price, for sales'} />
                            <Field label="Cost per item" type="number" step="0.01" min="0" value={form.costPrice} onChange={set('costPrice')} error={errors.costPrice} hint="Hidden from customers" />
                        </div>
                        {margin != null && (
                            <div className="flex flex-wrap gap-6 rounded-xl bg-soft px-4 py-3 text-sm">
                                <span>Profit <b className="tabular-nums">{money(price - cost)}</b></span>
                                <span>Margin <b className={cn('tabular-nums', margin < 0 && 'text-danger')}>{margin.toFixed(1)}%</b></span>
                            </div>
                        )}
                    </Section>

                    <Section title="Inventory">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Stock quantity" type="number" min="0" step="1" value={form.stock} onChange={set('stock')} error={errors.stock} required />
                            <Field label="SKU" value={form.sku} onChange={set('sku')} error={errors.sku} />
                        </div>
                    </Section>

                    <Section title="Variants & attributes" description="Options the shopper can pick, and searchable tags.">
                        <Field label="Colors"><ChipsInput value={form.colors} onChange={set('colors')} placeholder="e.g. Black, Sand" max={12} /></Field>
                        <Field label="Sizes"><ChipsInput value={form.sizes} onChange={set('sizes')} placeholder="e.g. S, M, L" max={12} /></Field>
                        <Field label="Tags"><ChipsInput value={form.tags} onChange={(v) => set('tags')(v.map((t) => t.toLowerCase()))} placeholder="e.g. summer, gift" /></Field>
                    </Section>

                    <Section title="Specifications">
                        {form.specs.map((s, i) => (
                            <div key={i} className="flex gap-2">
                                <input value={s.label} onChange={(e) => set('specs')(form.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Label (e.g. Material)" className="input w-2/5" />
                                <input value={s.value} onChange={(e) => set('specs')(form.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="Value (e.g. Solid oak)" className="input flex-1" />
                                <Button variant="ghost" size="icon" onClick={() => set('specs')(form.specs.filter((_, j) => j !== i))} aria-label="Remove spec"><LuX className="h-4 w-4" /></Button>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => set('specs')([...form.specs, { label: '', value: '' }])} disabled={form.specs.length >= 30}>
                            <LuPlus className="h-4 w-4" /> Add specification
                        </Button>
                    </Section>

                    <Section title="Shipping & policies">
                        <Field label="Shipping info" value={form.shippingInfo} onChange={set('shippingInfo')} placeholder="Ships in 2–4 business days" />
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Warranty" value={form.warranty} onChange={set('warranty')} placeholder="1 year warranty" />
                            <Field label="Return policy" value={form.returnPolicy} onChange={set('returnPolicy')} placeholder="30 days return policy" />
                        </div>
                    </Section>
                </div>

                <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                    <section className="card space-y-4 p-5">
                        <h3 className="font-bold">Visibility</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['active', 'draft'].map((s) => (
                                <button key={s} type="button" onClick={() => set('status')(s)} className={cn('h-10 rounded-xl border text-sm font-semibold capitalize transition', form.status === s ? 'border-ink bg-ink text-bg' : 'border-line hover:border-ink/40')}>
                                    {s}
                                </button>
                            ))}
                        </div>
                        <Toggle checked={form.featured} onChange={set('featured')} label="Featured" description="Show on the home page" />
                        <Field label="URL handle" value={form.slug} onChange={set('slug')} placeholder="auto-generated from title" hint={form.slug ? `/product/${form.slug}` : undefined} />
                    </section>

                    <section className="card overflow-hidden">
                        <p className="border-b border-line px-5 py-3 text-xs font-semibold tracking-wider text-muted uppercase">Live preview</p>
                        <div className="p-5">
                            <div className="relative aspect-square overflow-hidden rounded-2xl bg-soft">
                                {form.images[0] ? <img src={form.images[0]} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-sm text-muted">No image</div>}
                                {discount > 0 && <span className="absolute top-3 left-3 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-ink">-{discount}%</span>}
                                {form.status === 'draft' && <span className="absolute top-3 right-3"><Badge tone="dark">Draft</Badge></span>}
                            </div>
                            <p className="mt-3 text-xs text-muted">{form.brand || categories.find((c) => c.slug === form.category)?.name || 'Brand'}</p>
                            <p className="line-clamp-2 font-semibold">{form.title || 'Product title'}</p>
                            <div className="mt-1 flex items-baseline gap-2">
                                <span className="font-bold">{money(price)}</span>
                                {discount > 0 && <span className="text-sm text-muted line-through">{money(compare)}</span>}
                            </div>
                            <p className="mt-2 text-xs text-muted">{Number(form.stock) > 0 ? `${form.stock} in stock` : 'Out of stock'}</p>
                        </div>
                    </section>
                </aside>
            </div>
        </form>
    );
}
