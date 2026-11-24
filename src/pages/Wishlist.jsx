import { useQuery } from '@tanstack/react-query';
import { LuHeart } from 'react-icons/lu';
import { useStore } from '../context/StoreContext';
import { get } from '../lib/api';
import { Button, Empty } from '../components/ui';
import { ProductGrid } from '../components/product/ProductCard';
import { useTitle } from '../hooks/useCommon';

export default function Wishlist() {
    const { wishlist } = useStore();
    useTitle('Wishlist');
    const { data, isLoading } = useQuery({
        queryKey: ['products', 'wishlist', wishlist.join(',')],
        queryFn: () => get('/products', { ids: wishlist.join(','), limit: 60 }),
        enabled: wishlist.length > 0,
    });
    return (
        <div className="container-x pt-8">
            <h1 className="text-4xl font-extrabold">Wishlist <span className="text-muted">({wishlist.length})</span></h1>
            <p className="mt-2 text-muted">Items you've saved for later. Sign in to keep them across devices.</p>
            <div className="mt-10">
                {wishlist.length === 0 ? (
                    <Empty icon={LuHeart} title="Nothing saved yet" text="Tap the heart on any product to save it here." action={<Button to="/shop">Discover products</Button>} />
                ) : (
                    <ProductGrid products={data?.items || []} loading={isLoading} count={Math.min(wishlist.length, 8)} />
                )}
            </div>
        </div>
    );
}
