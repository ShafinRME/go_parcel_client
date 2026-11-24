import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { authErrorMessage, useAuth } from '../../context/AuthContext';
import { Button, Field } from '../../components/ui';
import { useTitle } from '../../hooks/useCommon';
import AuthShell from './AuthShell';

export function GoogleButton({ label = 'Continue with Google' }) {
    const { loginWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <Button
            variant="outline"
            size="lg"
            className="w-full"
            loading={loading}
            onClick={async () => {
                setLoading(true);
                try {
                    await loginWithGoogle();
                    toast.success('Welcome!');
                    navigate(location.state?.from || '/account', { replace: true });
                } catch (e) {
                    toast.error(authErrorMessage(e));
                } finally {
                    setLoading(false);
                }
            }}
        >
            {!loading && <FcGoogle className="h-5 w-5" />} {label}
        </Button>
    );
}

export default function Login() {
    useTitle('Sign in');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [f, setF] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(f.email.trim(), f.password);
            toast.success('Welcome back!');
            navigate(location.state?.from || '/account', { replace: true });
        } catch (err) {
            toast.error(authErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell title="Welcome back" subtitle="Sign in to your account to continue.">
            <GoogleButton />
            <div className="my-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-muted">
                <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
            </div>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                <div>
                    <Field label="Password" type="password" autoComplete="current-password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                    <Link to="/forgot-password" className="mt-2 inline-block text-sm font-semibold text-muted hover:text-ink">Forgot password?</Link>
                </div>
                <Button type="submit" size="lg" className="w-full" loading={loading}>Sign in</Button>
            </form>
            <p className="mt-6 text-sm text-muted">
                New here? <Link to="/register" state={location.state} className="font-semibold text-ink hover:text-accent">Create an account</Link>
            </p>
        </AuthShell>
    );
}
