import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { Toaster } from 'react-hot-toast';
import './index.css';
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: (count, err) => count < 2 && !(err?.response?.status >= 400 && err?.response?.status < 500),
        },
    },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <StoreProvider>
                        <RouterProvider router={router} />
                        <Toaster
                            position="bottom-center"
                            toastOptions={{
                                className: '!rounded-xl !bg-ink !text-bg !text-sm !font-medium !shadow-xl',
                                success: { iconTheme: { primary: 'var(--accent)', secondary: '#fff' } },
                            }}
                        />
                    </StoreProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    </StrictMode>
);
