import { useState } from 'react';
import { Link } from 'react-router';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuEye, LuEyeOff, LuMessageSquare, LuReply, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { cn, formatDate, initials } from '../../lib/utils';
import { Badge, Button, Confirm, Empty, Modal, Pagination, Skeleton, Stars } from '../../components/ui';
import { PageHeader, Select } from '../components/shared';

export default function Reviews() {
    const qc = useQueryClient();
    const [status, setStatus] = useState('');
    const [rating, setRating] = useState('');
    const [page, setPage] = useState(1);
    const [replyTo, setReplyTo] = useState(null);
    const [reply, setReply] = useState('');
    const [toDelete, setToDelete] = useState(null);

    const params = { status, rating, page, limit: 15 };
    const { data, isLoading, isFetching } = useQuery({ queryKey: ['admin', 'reviews', params], queryFn: () => get('/admin/reviews', params), placeholderData: keepPreviousData });

    const done = (msg) => {
        toast.success(msg);
        qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    };
    const upd = useMutation({
        mutationFn: ({ id, body }) => api.patch(`/admin/reviews/${id}`, body),
        onSuccess: (_d, v) => {
            done(v.body.reply !== undefined ? 'Reply saved' : v.body.status === 'hidden' ? 'Review hidden' : 'Review published');
            setReplyTo(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });
    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/reviews/${id}`),
        onSuccess: () => {
            done('Review deleted');
            setToDelete(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    const items = data?.items || [];

    return (
        <div>
            <PageHeader
                title="Reviews"
                description="Moderate what customers say about your products."
                actions={
                    <>
                        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[{ value: '', label: 'All reviews' }, { value: 'published', label: 'Published' }, { value: 'hidden', label: 'Hidden' }]} />
                        <Select value={rating} onChange={(v) => { setRating(v); setPage(1); }} options={[{ value: '', label: 'Any rating' }, ...[5, 4, 3, 2, 1].map((r) => ({ value: String(r), label: `${r} star${r > 1 ? 's' : ''}` }))]} />
                    </>
                }
            />

            {isLoading ? (
                <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
            ) : items.length ? (
                <div className={cn('space-y-3 transition-opacity', isFetching && 'opacity-60')}>
                    {items.map((r) => (
                        <article key={r._id} className={cn('card p-5', r.status === 'hidden' && 'opacity-70')}>
                            <div className="flex flex-col gap-4 md:flex-row">
                                {r.product && (
                                    <Link to={`/admin/products/${r.product._id}`} className="flex shrink-0 items-center gap-3 md:w-56">
                                        <img src={r.product.images?.[0]} alt="" className="h-12 w-12 rounded-lg bg-soft object-cover" />
                                        <span className="line-clamp-2 text-sm font-semibold hover:underline">{r.product.title}</span>
                                    </Link>
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Stars value={r.rating} size="h-3.5 w-3.5" />
                                        {r.title && <span className="font-semibold">{r.title}</span>}
                                        {r.status === 'hidden' && <Badge tone="warning">Hidden</Badge>}
                                        {r.verified && <Badge tone="success">Verified buyer</Badge>}
                                    </div>
                                    <p className="mt-1.5 text-sm">{r.comment}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                                        {r.userPhoto ? <img src={r.userPhoto} alt="" className="h-5 w-5 rounded-full" referrerPolicy="no-referrer" /> : <span className="grid h-5 w-5 place-items-center rounded-full bg-soft text-[9px] font-bold">{initials(r.userName)}</span>}
                                        {r.userName} · {r.userEmail} · {formatDate(r.createdAt)}
                                    </div>
                                    {r.reply?.text && (
                                        <div className="mt-3 rounded-xl border-l-2 border-accent bg-soft p-3 text-sm">
                                            <p className="text-xs font-semibold text-muted">Store reply · {formatDate(r.reply.at)}</p>
                                            <p className="mt-0.5">{r.reply.text}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex shrink-0 gap-1 md:flex-col">
                                    <Button size="sm" variant="outline" onClick={() => upd.mutate({ id: r._id, body: { status: r.status === 'hidden' ? 'published' : 'hidden' } })}>
                                        {r.status === 'hidden' ? <><LuEye className="h-4 w-4" /> Publish</> : <><LuEyeOff className="h-4 w-4" /> Hide</>}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setReplyTo(r); setReply(r.reply?.text || ''); }}><LuReply className="h-4 w-4" /> Reply</Button>
                                    <Button size="sm" variant="ghost" className="text-danger hover:!bg-danger/10" onClick={() => setToDelete(r)}><LuTrash2 className="h-4 w-4" /> Delete</Button>
                                </div>
                            </div>
                        </article>
                    ))}
                    {data.pages > 1 && <div className="pt-3"><Pagination page={page} pages={data.pages} onChange={setPage} /></div>}
                </div>
            ) : (
                <div className="card"><Empty icon={LuMessageSquare} title="No reviews" text="Reviews from customers will show up here." /></div>
            )}

            <Modal open={!!replyTo} onClose={() => setReplyTo(null)} title="Reply to review">
                <p className="mb-3 rounded-xl bg-soft p-3 text-sm text-muted">“{replyTo?.comment}”</p>
                <textarea rows={4} value={reply} onChange={(e) => setReply(e.target.value)} className="input" placeholder="Write a public reply (leave empty to remove)" />
                <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReplyTo(null)}>Cancel</Button>
                    <Button loading={upd.isPending} onClick={() => upd.mutate({ id: replyTo._id, body: { status: replyTo.status, reply } })}>Save reply</Button>
                </div>
            </Modal>
            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Delete review?" message="The product rating will be recalculated." confirmText="Delete" />
        </div>
    );
}
