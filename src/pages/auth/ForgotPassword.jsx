import { useState } from 'react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';
import { authErrorMessage, useAuth } from '../../context/AuthContext';
import { Button, Field } from '../../components/ui';
import { useTitle } from '../../hooks/useCommon';
import AuthShell from './AuthShell';

export default function ForgotPassword() {
    useTitle('Reset password');
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
        <AuthShell title="Reset your password" subtitle="We'll email you a secure link to choose a new one.">
            {sent ? (
                <div className="rounded-2xl bg-success/10 p-5 text-sm text-success">
                    If an account exists for <b>{email}</b>, a reset link is on its way. Check your inbox and spam folder.
                </div>
            ) : (
                <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setLoading(true);
                        try {
                            await resetPassword(email.trim());
                            setSent(true);
                        } catch (err) {
                            // don't reveal whether the email exists
                            if (err?.code === 'auth/user-not-found') setSent(true);
                            else toast.error(authErrorMessage(err));
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <Field label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Button type="submit" size="lg" className="w-full" loading={loading}>Send reset link</Button>
                </form>
            )}
            <p className="mt-6 text-sm text-muted">
                Remembered it? <Link to="/login" className="font-semibold text-ink hover:text-accent">Back to sign in</Link>
            </p>
        </AuthShell>
    );
}
