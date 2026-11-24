import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuArrowLeft, LuCheck, LuInbox, LuMailOpen, LuReply, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { useStore } from '../../context/StoreContext';
import { cn, formatDateTime, initials } from '../../lib/utils';
import { Badge, Button, Confirm, Empty, Skeleton } from '../../components/ui';
import { PageHeader } from '../components/shared';

const FILTERS = [
    ['', 'All'],
    ['new', 'New'],
    ['read', 'Read'],
    ['replied', 'Replied'],
];
const TONE = { new: 'accent', read: 'neutral', replied: 'success' };

export default function Messages() {
    const qc = useQueryClient();
    const { settings } = useStore();
    const [filter, setFilter] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [toDelete, setToDelete] = useState(null);
    const { data: messages = [], isLoading } = useQuery({ queryKey: ['admin', 'messages', filter], queryFn: () => get('/admin/messages', filter ? { status: filter } : {}) });
    const active = messages.find((m) => m._id === activeId);

    const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
    const setStatus = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/admin/messages/${id}`, { status }),
        onSuccess: refresh,
        onError: (e) => toast.error(errorMessage(e)),
    });
    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/messages/${id}`),
        onSuccess: () => {
            toast.success('Message deleted');
            setToDelete(null);
            setActiveId(null);
            refresh();
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    // opening a new message marks it as read
    const { mutate: markStatus } = setStatus;
    useEffect(() => {
        if (active?.status === 'new') markStatus({ id: active._id, status: 'read' });
    }, [active?._id, active?.status, markStatus]);

    const mailto = (m) =>
        `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || `Your message to ${settings.storeName || 'us'}`}`)}&body=${encodeURIComponent(`Hi ${m.name},\n\n\n\n— ${settings.storeName || ''}\n\n> ${m.message.split('\n').join('\n> ')}`)}`;

    return (
        <div>
            <PageHeader title="Messages" description="Questions sent through the contact form." />
            <div className="card grid min-h-[560px] overflow-hidden lg:grid-cols-[380px_1fr]">
                <div className={cn('flex flex-col border-line lg:border-r', active && 'hidden lg:flex')}>
                    <div className="flex gap-1 border-b border-line p-3">
                        {FILTERS.map(([v, l]) => (
                            <button key={v} onClick={() => setFilter(v)} className={cn('h-8 rounded-lg px-3 text-sm font-semibold', filter === v ? 'bg-ink text-bg' : 'text-muted hover:bg-soft')}>{l}</button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="space-y-2 p-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                        ) : messages.length ? (
                            <ul className="divide-y divide-line">
                                {messages.map((m) => (
                                    <li key={m._id}>
                                        <button onClick={() => setActiveId(m._id)} className={cn('flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-soft/50', activeId === m._id && 'bg-soft')}>
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft text-xs font-bold">{initials(m.name)}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-2">
                                                    <span className={cn('truncate text-sm', m.status === 'new' ? 'font-bold' : 'font-medium')}>{m.name}</span>
                                                    <span className="shrink-0 text-[11px] text-muted">{formatDateTime(m.createdAt).split(',')[0]}</span>
                                                </span>
                                                <span className="block truncate text-sm">{m.subject || '(no subject)'}</span>
                                                <span className="block truncate text-xs text-muted">{m.message}</span>
                                            </span>
                                            {m.status === 'new' && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Empty icon={LuInbox} title="Inbox zero" text="No messages here." />
                        )}
                    </div>
                </div>

                <div className={cn('flex-col', active ? 'flex' : 'hidden lg:flex')}>
                    {active ? (
                        <>
                            <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
                                <Button variant="ghost" size="iconSm" className="lg:hidden" onClick={() => setActiveId(null)} aria-label="Back"><LuArrowLeft className="h-4 w-4" /></Button>
                                <Badge tone={TONE[active.status]}>{active.status}</Badge>
                                <div className="ml-auto flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: active._id, status: 'new' })}><LuMailOpen className="h-4 w-4" /> Mark unread</Button>
                                    <Button size="sm" variant="outline" onClick={() => setStatus.mutate({ id: active._id, status: 'replied' })}><LuCheck className="h-4 w-4" /> Mark replied</Button>
                                    <Button size="sm" variant="ghost" className="text-danger hover:!bg-danger/10" onClick={() => setToDelete(active)}><LuTrash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6">
                                <h2 className="text-xl font-bold">{active.subject || '(no subject)'}</h2>
                                <div className="mt-3 flex items-center gap-3">
                                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-bg">{initials(active.name)}</span>
                                    <div>
                                        <p className="text-sm font-semibold">{active.name}</p>
                                        <p className="text-xs text-muted">{active.email} · {formatDateTime(active.createdAt)}</p>
                                    </div>
                                </div>
                                <p className="mt-6 text-sm leading-relaxed whitespace-pre-wrap">{active.message}</p>
                                <Button
                                    as="a"
                                    href={mailto(active)}
                                    className="mt-8"
                                    onClick={() => setStatus.mutate({ id: active._id, status: 'replied' })}
                                >
                                    <LuReply className="h-4 w-4" /> Reply by email
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="grid flex-1 place-items-center"><Empty icon={LuInbox} title="Select a message" text="Choose a conversation to read it." /></div>
                    )}
                </div>
            </div>
            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Delete message?" message="This cannot be undone." confirmText="Delete" />
        </div>
    );
}
