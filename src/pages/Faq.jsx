import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/ui';
import { useTitle } from '../hooks/useCommon';
import { cn } from '../lib/utils';

export default function Faq() {
    const { settings, money } = useStore();
    useTitle('FAQ');
    const [open, setOpen] = useState(0);
    const faqs = [
        ['How long does delivery take?', 'Most orders are dispatched within 48 hours and arrive in 2–5 business days. You will get tracking details as soon as your order ships.'],
        ['How much is shipping?', settings.freeShippingThreshold ? `Shipping is ${money(settings.shippingFee)} and free on orders over ${money(settings.freeShippingThreshold)}.` : `Shipping is a flat ${money(settings.shippingFee)}.`],
        ['Which payment methods do you accept?', `We accept all major credit and debit cards through Stripe${settings.codEnabled !== false ? ', and cash on delivery' : ''}. Card details never touch our servers.`],
        ['Can I cancel my order?', 'Yes — you can cancel from your account while the order is placed or processing. Card payments are refunded automatically to the original card.'],
        ['What is your return policy?', 'Unused items in original packaging can be returned within 30 days of delivery. Contact us and we will send a prepaid label.'],
        ['How do I track my order?', 'Sign in and open Account → Orders, or use the Track order page with your order number and email.'],
        ['How do discount codes work?', 'Enter your code in the summary at checkout. Some codes have a minimum spend or can be used once per customer.'],
        ['How is my data protected?', 'Accounts are secured with Firebase Authentication, all traffic is encrypted, and we never sell your data.'],
    ];
    return (
        <div className="container-x max-w-3xl pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Help centre</p>
            <h1 className="mt-3 text-5xl font-extrabold">Frequently asked questions</h1>
            <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-surface">
                {faqs.map(([q, a], i) => (
                    <div key={q}>
                        <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold" aria-expanded={open === i}>
                            {q}
                            <LuChevronDown className={cn('h-5 w-5 shrink-0 transition', open === i && 'rotate-180')} />
                        </button>
                        <div className={cn('grid transition-all duration-300', open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                            <p className="overflow-hidden px-6 text-muted">
                                <span className="block pb-5 leading-relaxed">{a}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-soft p-6">
                <p className="font-semibold">Still need help?</p>
                <Button to="/contact">Contact support</Button>
            </div>
        </div>
    );
}
