/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';

const AuthContext = createContext(null);
const google = new GoogleAuthProvider();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // Firebase user
    const [profile, setProfile] = useState(null); // our DB user (role, addresses…)
    const [loading, setLoading] = useState(true);
    const qc = useQueryClient();

    const sync = useCallback(async (extra = {}) => {
        const { data } = await api.post('/users/sync', extra);
        setProfile(data);
        return data;
    }, []);

    useEffect(() => {
        return onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                try {
                    await sync();
                } catch (e) {
                    // blocked accounts are signed out straight away
                    if (e?.response?.status === 403) await signOut(auth);
                    setProfile(null);
                }
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
    }, [sync]);

    const value = useMemo(
        () => ({
            user,
            profile,
            loading,
            isAdmin: profile?.role === 'admin',
            setProfile,
            refreshProfile: () => api.get('/users/me').then((r) => (setProfile(r.data), r.data)),
            login: (email, password) => signInWithEmailAndPassword(auth, email, password),
            loginWithGoogle: () => signInWithPopup(auth, google),
            register: async ({ name, email, password }) => {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });
                await sync({ name });
                const { data } = await api.patch('/users/me', { name });
                setProfile(data);
                return cred;
            },
            resetPassword: (email) => sendPasswordResetEmail(auth, email),
            logout: async () => {
                await signOut(auth);
                qc.clear();
            },
        }),
        [user, profile, loading, sync, qc]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const authErrorMessage = (err) => {
    const map = {
        'auth/invalid-credential': 'Email or password is incorrect',
        'auth/wrong-password': 'Email or password is incorrect',
        'auth/user-not-found': 'No account found with that email',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again',
        'auth/popup-closed-by-user': 'Sign in was cancelled',
        'auth/network-request-failed': 'Network error. Check your connection',
        'auth/invalid-email': 'Enter a valid email address',
    };
    return map[err?.code] || err?.response?.data?.message || err?.message || 'Something went wrong';
};
