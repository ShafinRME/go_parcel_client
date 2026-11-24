import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { LuDownload, LuMail, LuSearch, LuTrash2 } from 'react-icons/lu';
import { api, errorMessage, get } from '../../lib/api';
import { downloadBlob, formatDate } from '../../lib/utils';
import { Button, Confirm, Empty } from '../../components/ui';
import { PageHeader, SkeletonRows, Table, Td, Th } from '../components/shared';

export default function Subscribers() {
    const qc = useQueryClient();
    const [search, setSearch] = useState('');
    const [toDelete, setToDelete] = useState(null);
    const [exporting, setExporting] = useState(false);
    const { data = [], isLoading } = useQuery({ queryKey: ['admin', 'subscribers'], queryFn: () => get('/admin/subscribers') });
    const list = useMemo(() => data.filter((s) => s.email.includes(search.trim().toLowerCase())), [data, search]);
    const thisMonth = data.filter((s) => new Date(s.createdAt) > new Date(Date.now() - 30 * 86400000)).length;

    const del = useMutation({
        mutationFn: (id) => api.delete(`/admin/subscribers/${id}`),
        onSuccess: () => {
            toast.success('Subscriber removed');
            qc.invalidateQueries({ queryKey: ['admin', 'subscribers'] });
            setToDelete(null);
        },
        onError: (e) => toast.error(errorMessage(e)),
    });

    const exportCsv = async () => {
        setExporting(true);
        try {
            const r = await api.get('/admin/subscribers', { params: { format: 'csv' }, responseType: 'blob' });
            downloadBlob(r.data, 'subscribers.csv');
        } catch (e) {
            toast.error(errorMessage(e));
        } finally {
            setExporting(false);
        }
    };

    return (
        <div>
            <PageHeader
                title="Newsletter subscribers"
                description={`${data.length} subscribers · ${thisMonth} joined in the last 30 days`}
                actions={<Button variant="outline" onClick={exportCsv} loading={exporting} disabled={!data.length}><LuDownload className="h-4 w-4" /> Export CSV</Button>}
            />
            <div className="card overflow-hidden">
                <div className="border-b border-line p-4">
                    <div className="relative max-w-md">
                        <LuSearch className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email" className="input h-10 pl-9" />
                    </div>
                </div>
                <Table className="min-w-[480px]">
                    <thead>
                        <tr>
                            <Th>Email</Th>
                            <Th>Subscribed</Th>
                            <Th className="text-right">Actions</Th>
                        </tr>
                    </thead>
                    {isLoading ? (
                        <SkeletonRows cols={3} />
                    ) : (
                        <tbody>
                            {list.map((s) => (
                                <tr key={s._id} className="hover:bg-soft/40">
                                    <Td><a href={`mailto:${s.email}`} className="font-medium hover:underline">{s.email}</a></Td>
                                    <Td className="text-muted">{formatDate(s.createdAt)}</Td>
                                    <Td className="text-right">
                                        <Button variant="ghost" size="iconSm" className="hover:!bg-danger/10 hover:!text-danger" onClick={() => setToDelete(s)} aria-label="Remove"><LuTrash2 className="h-4 w-4" /></Button>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </Table>
                {!isLoading && !list.length && <Empty icon={LuMail} title="No subscribers yet" text="People who join the newsletter in the footer will appear here." />}
            </div>
            <Confirm open={!!toDelete} onClose={() => setToDelete(null)} onConfirm={() => del.mutate(toDelete._id)} loading={del.isPending} title="Remove subscriber?" message={toDelete?.email} confirmText="Remove" />
        </div>
    );
}
