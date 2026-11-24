import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { authErrorMessage, useAuth } from '../../context/AuthContext';
import { Button, Field } from '../../components/ui';
import { useTitle } from '../../hooks/useCommon';
import { cn } from '../../lib/utils';
import AuthShell from './AuthShell';
import { GoogleButton } from './Login';

const strength = (p) => [p.length >= 8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;

export default function Register() {
    useTitle('Create account');
    const { register } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const s = strength(f.password);

    const submit = async (e) => {
        e.preventDefault();
        if (f.password.length < 8) return toast.error('Use at least 8 characters for your password');
        if (s < 3) return toast.error('Add an uppercase letter, a number or a symbol to your password');
        if (f.password !== f.confirm) return toast.error('Passwords do not match');
        setLoading(true);
        try {
            await register({ name: f.name.trim(), email: f.email.trim(), password: f.password });
            toast.success('Account created — welcome!');
            navigate(location.state?.from || '/account', { replace: true });
        } catch (err) {
            toast.error(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell title="Create your account" subtitle="Save your bag, track orders and check out faster.">
            <GoogleButton label="Sign up with Google" />
            <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-muted">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Full name" autoComplete="name" required minLength={2} maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
                <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <div>
                    <Field label="Password" type="password" autoComplete="new-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                    <div className="mt-2 flex gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                            <span key={i} className={cn('h-1 flex-1 rounded-full transition', i <= s ? (s < 3 ? 'bg-warning' : 'bg-success') : 'bg-line')} />
                        ))}
                    </div>
                    <p className="mt-1.5 text-xs text-muted">8+ characters with a mix of uppercase, numbers or symbols.</p>
                </div>
                <Field label="Confirm password" type="password" autoComplete="new-password" required value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={f.confirm && f.confirm !== f.password ? 'Passwords do not match' : ''} />
                <Button type="submit" size="lg" className="w-full" loading={loading}>Create account</Button>
            </form>
            <p className="mt-6 text-sm text-muted">
                Already have an account? <Link to="/login" state={location.state} className="font-semibold text-ink hover:text-accent">Sign in</Link>
            </p>
        </AuthShell>
    );
}
