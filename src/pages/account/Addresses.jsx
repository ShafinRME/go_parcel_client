import { useState } from 'react';
import toast from 'react-hot-toast';
import { LuMapPin, LuPlus } from 'react-icons/lu';
import { api, errorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Badge, Button, Confirm, Empty, Field, Modal } from '../../components/ui';
import { useTitle } from '../../hooks/useCommon';

const EMPTY = { label: 'Home', fullName: '', phone: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false };

export default function Addresses() {
    useTitle('Addresses');
    const { profile, setProfile } = useAuth();
    const list = profile?.addresses || [];
    const [edit, setEdit] = useState(null); // address object or EMPTY
    const [del, setDel] = useState(null);
    const [saving, setSaving] = useState(false);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { _id, ...body } = edit;
            const { data } = _id ? await api.put(`/users/me/addresses/${_id}`, body) : await api.post('/users/me/addresses', body);
            setProfile((p) => ({ ...p, addresses: data }));
            toast.success('Address saved');
            setEdit(null);
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };
    const remove = async () => {
        const { data } = await api.delete(`/users/me/addresses/${del._id}`);
        setProfile((p) => ({ ...p, addresses: data }));
        setDel(null);
        toast.success('Address removed');
    };
    const makeDefault = async (a) => {
        const { _id, ...body } = a;
        const { data } = await api.put(`/users/me/addresses/${_id}`, { ...body, isDefault: true });
        setProfile((p) => ({ ...p, addresses: data }));
    };
    const set = (k) => (e) => setEdit((x) => ({ ...x, [k]: e.target.value }));

    return (
        <div>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-extrabold">Addresses</h1>
                <Button onClick={() => setEdit(EMPTY)} disabled={list.length >= 10}><LuPlus className="h-4 w-4" /> Add address</Button>
            </div>
            {list.length === 0 ? (
                <div className="card mt-6"><Empty icon={LuMapPin} title="No saved addresses" text="Save an address for faster checkout." /></div>
            ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {list.map((a) => (
                        <div key={a._id} className="card flex flex-col p-5 text-sm">
                            <div className="flex items-center justify-between">
                                <p className="font-bold">{a.label}</p>
                                {a.isDefault && <Badge tone="dark">Default</Badge>}
                            </div>
                            <p className="mt-3">{a.fullName}</p>
                            <p className="text-muted">{a.line1}{a.line2 && `, ${a.line2}`}</p>
                            <p className="text-muted">{a.city}{a.state && `, ${a.state}`} {a.postalCode}, {a.country}</p>
                            <p className="text-muted">{a.phone}</p>
                            <div className="mt-4 flex gap-3 border-t border-line pt-4 font-semibold">
                                <button onClick={() => setEdit(a)} className="hover:text-accent">Edit</button>
                                {!a.isDefault && <button onClick={() => makeDefault(a)} className="hover:text-accent">Set default</button>}
                                <button onClick={() => setDel(a)} className="ml-auto text-danger">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._id ? 'Edit address' : 'New address'}>
                {edit && (
                    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                        <Field label="Label" value={edit.label} onChange={set('label')} placeholder="Home, Office…" />
                        <Field label="Full name" required value={edit.fullName} onChange={set('fullName')} />
                        <Field className="sm:col-span-2" label="Phone" required value={edit.phone} onChange={set('phone')} />
                        <Field className="sm:col-span-2" label="Street address" required value={edit.line1} onChange={set('line1')} />
                        <Field className="sm:col-span-2" label="Apartment, suite" value={edit.line2} onChange={set('line2')} />
                        <Field label="City" required value={edit.city} onChange={set('city')} />
                        <Field label="State / region" value={edit.state} onChange={set('state')} />
                        <Field label="Postal code" required value={edit.postalCode} onChange={set('postalCode')} />
                        <Field label="Country" required value={edit.country} onChange={set('country')} />
                        <label className="flex items-center gap-2 text-sm sm:col-span-2">
                            <input type="checkbox" checked={!!edit.isDefault} onChange={(e) => setEdit((x) => ({ ...x, isDefault: e.target.checked }))} className="h-4 w-4 accent-[var(--ink)]" /> Use as default address
                        </label>
                        <div className="flex justify-end gap-2 sm:col-span-2">
                            <Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button>
                            <Button type="submit" loading={saving}>Save address</Button>
                        </div>
                    </form>
                )}
            </Modal>
            <Confirm open={!!del} onClose={() => setDel(null)} onConfirm={remove} title="Remove this address?" confirmText="Remove" />
        </div>
    );
}
