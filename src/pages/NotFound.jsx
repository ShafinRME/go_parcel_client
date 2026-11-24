import { LuSearchX, LuShieldAlert } from 'react-icons/lu';
import { Button } from '../components/ui';
import { useTitle } from '../hooks/useCommon';

export default function NotFound({ forbidden }) {
    useTitle(forbidden ? 'Access denied' : 'Page not found');
    const Icon = forbidden ? LuShieldAlert : LuSearchX;
    return (
        <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
            <div>
                <p className="font-display text-[120px] font-extrabold leading-none text-line sm:text-[180px]">{forbidden ? '403' : '404'}</p>
                <span className="mx-auto -mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-ink text-bg"><Icon className="h-6 w-6" /></span>
                <h1 className="mt-6 text-3xl font-bold">{forbidden ? "You don't have access to this page" : "We couldn't find that page"}</h1>
                <p className="mx-auto mt-2 max-w-md text-muted">{forbidden ? 'This area is for store administrators only.' : 'The link may be broken or the page may have moved.'}</p>
                <div className="mt-8 flex justify-center gap-3">
                    <Button to="/">Go home</Button>
                    <Button to="/shop" variant="outline">Browse products</Button>
                </div>
            </div>
        </div>
    );
}
