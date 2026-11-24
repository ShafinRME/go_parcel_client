import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    if (id.includes('firebase')) return 'firebase';
                    if (id.includes('recharts') || id.includes('d3-')) return 'charts';
                    if (id.includes('framer-motion') || id.includes('motion-dom')) return 'motion';
                    if (id.includes('@stripe')) return 'stripe';
                    if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/') || id.includes('scheduler')) return 'react';
                    return 'vendor';
                },
            },
        },
    },
});
