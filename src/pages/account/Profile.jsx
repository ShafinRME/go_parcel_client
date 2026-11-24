import { useState } from 'react';
import toast from 'react-hot-toast';
import { updateProfile } from 'firebase/auth';
import { api, errorMessage } from '../../lib/api';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Button, Field } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { useTitle } from '../../hooks/useCommon';

export default function Profile() {
    useTitle('Profile');
    const { profile, setProfile, user, resetPassword } = useAuth();
    const [f, setF] = useState({ name: profile?.name || '', phone: profile?.phone || '', photo: profile?.photo || '' });
    const [saving, setSaving] = useState(false);
    const isPasswordUser = user?.providerData?.some((p) => p.providerId === 'password');

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch('/users/me', f);
            setProfile(data);
            if (auth.currentUser) await updateProfile(auth.currentUser, { displayName: f.name, photoURL: f.photo || null });
            toast.success('Profile updated');
        } catch (err) {
            toast.error(errorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold">Profile</h1>
            <form onSubmit={save} className="card grid gap-5 p-6 sm:grid-cols-2">
                <Field label="Full name" required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <Field label="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
                <Field className="sm:col-span-2" label="Photo URL" type="url" value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} hint="Link to a square image. Leave empty to use your initials." />
                <Field className="sm:col-span-2" label="Email" value={user?.email || ''} disabled hint={`Member since ${formatDate(profile?.createdAt)}`} />
                <div className="sm:col-span-2">
                    <Button type="submit" loading={saving}>Save changes</Button>
                </div>
            </form>
            {isPasswordUser && (
                <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
                    <div>
                        <p className="font-bold">Password</p>
                        <p className="text-sm text-muted">We'll email you a secure link to set a new password.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() =>
                            resetPassword(user.email)
                                .then(() => toast.success('Reset link sent to your email'))
                                .catch((e) => toast.error(errorMessage(e)))
                        }
                    >
                        Send reset link
                    </Button>
                </div>
            )}
        </div>
    );
}
