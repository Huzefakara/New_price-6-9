'use client';

import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Header'), {
  ssr: false
});

const PriceComparisonApp = dynamic(() => import('./PriceComparisonApp'), {
  ssr: false
});

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#3D5361' }}>
      <Header />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          <PriceComparisonApp />
        </div>
      </main>
    </div>
  );
}
