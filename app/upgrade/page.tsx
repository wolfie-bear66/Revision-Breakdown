'use client';

import { useState } from 'react';

const PROMO_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PROMO!;
const LIFETIME_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_LIFETIME!;
const SIX_MONTH_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_6MONTH!;

const INCLUDED = 'Full access to all 33 subjects, all question types, unlimited revision';

interface PricingCard {
  priceId: string;
  name: string;
  price: string;
  prominent: boolean;
}

function getCards(today: Date): PricingCard[] {
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-indexed

  const beforeJuly2026 = today < new Date('2026-07-01');
  const jan2027toJune2027 = year === 2027 && month >= 1 && month <= 6;

  if (beforeJuly2026) {
    return [
      { priceId: PROMO_PRICE_ID, name: 'Early Access', price: '£5', prominent: true },
      { priceId: LIFETIME_PRICE_ID, name: 'Lifetime Access', price: '£20', prominent: false },
    ];
  }

  const cards: PricingCard[] = [
    { priceId: LIFETIME_PRICE_ID, name: 'Lifetime Access', price: '£20', prominent: true },
  ];

  if (jan2027toJune2027) {
    cards.push({ priceId: SIX_MONTH_PRICE_ID, name: '6-Month Access', price: '£10', prominent: false });
  }

  return cards;
}

function PricingCardComponent({ card }: { card: PricingCard }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: card.priceId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-4 ${
        card.prominent
          ? 'border-indigo-500 bg-indigo-50 shadow-lg'
          : 'border-gray-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-baseline justify-between">
        <h2 className={`text-lg font-semibold ${card.prominent ? 'text-indigo-700' : 'text-gray-800'}`}>
          {card.name}
        </h2>
        <span className={`text-3xl font-bold ${card.prominent ? 'text-indigo-600' : 'text-gray-900'}`}>
          {card.price}
        </span>
      </div>
      <p className="text-sm text-gray-600">{INCLUDED}</p>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`mt-auto rounded-xl py-2.5 px-4 text-sm font-medium transition-colors disabled:opacity-60 ${
          card.prominent
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-900 text-white hover:bg-gray-700'
        }`}
      >
        {loading ? 'Redirecting…' : 'Unlock full access'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function UpgradePage() {
  const cards = getCards(new Date());

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Unlock Revision Breakdown</h1>
          <p className="mt-2 text-gray-500">One payment. Every subject. No subscription traps.</p>
        </div>
        <div className="flex flex-col gap-4">
          {cards.map((card) => (
            <PricingCardComponent key={card.priceId} card={card} />
          ))}
        </div>
      </div>
    </main>
  );
}
