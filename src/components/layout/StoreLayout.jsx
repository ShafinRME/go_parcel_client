import { Outlet, ScrollRestoration } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import QuickView from '../product/QuickView';

export default function StoreLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <QuickView />
            <ScrollRestoration />
        </div>
    );
}
