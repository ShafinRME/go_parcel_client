/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, useLocation, useParams } from 'react-router';
import StoreLayout from './components/layout/StoreLayout';
import { PageLoader } from './components/ui';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';

const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Track = lazy(() => import('./pages/Track'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const AccountLayout = lazy(() => import('./pages/account/AccountLayout'));
const AccountOverview = lazy(() => import('./pages/account/Overview'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));
const AccountOrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const AccountAddresses = lazy(() => import('./pages/account/Addresses'));
const AccountProfile = lazy(() => import('./pages/account/Profile'));

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./admin/pages/Dashboard'));
const AdminProducts = lazy(() => import('./admin/pages/Products'));
const AdminProductForm = lazy(() => import('./admin/pages/ProductForm'));
const AdminCategories = lazy(() => import('./admin/pages/Categories'));
const AdminOrders = lazy(() => import('./admin/pages/Orders'));
const AdminOrderDetail = lazy(() => import('./admin/pages/OrderDetail'));
const AdminCustomers = lazy(() => import('./admin/pages/Customers'));
const AdminReviews = lazy(() => import('./admin/pages/Reviews'));
const AdminCoupons = lazy(() => import('./admin/pages/Coupons'));
const AdminBanners = lazy(() => import('./admin/pages/Banners'));
const AdminMessages = lazy(() => import('./admin/pages/Messages'));
const AdminSubscribers = lazy(() => import('./admin/pages/Subscribers'));
const AdminSettings = lazy(() => import('./admin/pages/Settings'));

const S = (El) => (
    <Suspense fallback={<PageLoader />}>
        <El />
    </Suspense>
);

export function RequireAuth({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    return children;
}

function RequireAdmin({ children }) {
    const { user, profile, loading } = useAuth();
    const location = useLocation();
    if (loading || (user && !profile)) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    if (profile?.role !== 'admin') return <Navigate to="/403" replace />;
    return children;
}

function GuestOnly({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <PageLoader />;
    if (user) return <Navigate to={location.state?.from || '/account'} replace />;
    return children;
}

function CategoryRedirect() {
    const { slug } = useParams();
    return <Navigate to={`/shop?category=${encodeURIComponent(slug)}`} replace />;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <StoreLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: 'shop', element: S(Shop) },
            { path: 'category/:slug', element: <CategoryRedirect /> },
            { path: 'product/:slug', element: S(Product) },
            { path: 'cart', element: S(Cart) },
            { path: 'checkout', element: <RequireAuth>{S(Checkout)}</RequireAuth> },
            { path: 'order/:id/success', element: <RequireAuth>{S(OrderSuccess)}</RequireAuth> },
            { path: 'wishlist', element: S(Wishlist) },
            { path: 'track', element: S(Track) },
            { path: 'about', element: S(About) },
            { path: 'contact', element: S(Contact) },
            { path: 'faq', element: S(Faq) },
            { path: 'login', element: <GuestOnly>{S(Login)}</GuestOnly> },
            { path: 'register', element: <GuestOnly>{S(Register)}</GuestOnly> },
            { path: 'forgot-password', element: S(ForgotPassword) },
            {
                path: 'account',
                element: <RequireAuth>{S(AccountLayout)}</RequireAuth>,
                children: [
                    { index: true, element: S(AccountOverview) },
                    { path: 'orders', element: S(AccountOrders) },
                    { path: 'orders/:id', element: S(AccountOrderDetail) },
                    { path: 'addresses', element: S(AccountAddresses) },
                    { path: 'profile', element: S(AccountProfile) },
                ],
            },
            { path: '403', element: <Suspense fallback={<PageLoader />}><NotFound forbidden /></Suspense> },
            { path: '*', element: S(NotFound) },
        ],
    },
    {
        path: '/admin',
        element: <RequireAdmin>{S(AdminLayout)}</RequireAdmin>,
        children: [
            { index: true, element: S(AdminDashboard) },
            { path: 'products', element: S(AdminProducts) },
            { path: 'products/new', element: S(AdminProductForm) },
            { path: 'products/:id', element: S(AdminProductForm) },
            { path: 'categories', element: S(AdminCategories) },
            { path: 'orders', element: S(AdminOrders) },
            { path: 'orders/:id', element: S(AdminOrderDetail) },
            { path: 'customers', element: S(AdminCustomers) },
            { path: 'reviews', element: S(AdminReviews) },
            { path: 'coupons', element: S(AdminCoupons) },
            { path: 'banners', element: S(AdminBanners) },
            { path: 'messages', element: S(AdminMessages) },
            { path: 'subscribers', element: S(AdminSubscribers) },
            { path: 'settings', element: S(AdminSettings) },
        ],
    },
]);
