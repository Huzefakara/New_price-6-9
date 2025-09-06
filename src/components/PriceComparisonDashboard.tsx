'use client';

import { useMemo } from 'react';

interface Product {
  name: string;
  url: string;
  price?: string;
  [key: string]: string | undefined;
}

interface PriceComparisonDashboardProps {
  products: Product[];
}

export default function PriceComparisonDashboard({ products }: PriceComparisonDashboardProps) {
  // Only show products with prices
  const productsWithPrices = useMemo(() => {
    return products.filter(product => product.price && product.price !== 'Price not found');
  }, [products]);

  // Extract numeric values from price strings for comparison
  const extractNumericPrice = (priceStr: string): number => {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const numericStr = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(numericStr) || 0;
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (productsWithPrices.length === 0) return null;

    const numericPrices = productsWithPrices.map(p => extractNumericPrice(p.price || '0'));

    // Find min and max prices
    const minPrice = Math.min(...numericPrices);
    const maxPrice = Math.max(...numericPrices);

    // Find products with min and max prices
    const cheapestProduct = productsWithPrices.find(p => extractNumericPrice(p.price || '0') === minPrice);
    const mostExpensiveProduct = productsWithPrices.find(p => extractNumericPrice(p.price || '0') === maxPrice);

    // Calculate average price
    const avgPrice = numericPrices.reduce((sum, price) => sum + price, 0) / numericPrices.length;

    return {
      totalProducts: productsWithPrices.length,
      cheapestProduct,
      mostExpensiveProduct,
      minPrice,
      maxPrice,
      avgPrice,
      priceDifference: maxPrice - minPrice,
      percentageDifference: ((maxPrice - minPrice) / minPrice) * 100
    };
  }, [productsWithPrices]);

  if (!stats || productsWithPrices.length < 2) {
    return (
      <div className="card-premium p-3 animate-scaleIn">
        <div className="flex items-center mb-3">
          <div className="rounded-md bg-indigo-100 dark:bg-indigo-900 p-1">
            <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="ml-2">
            <h2 className="text-base font-bold gradient-text">Price Analytics</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Get insights from your price data</p>
          </div>
        </div>

        <div className="text-center py-4">
          <div className="mx-auto h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
            <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">Waiting for Price Data</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            {products.length === 0
              ? 'Upload a CSV file and scrape prices to see detailed analytics and insights.'
              : productsWithPrices.length === 0
                ? 'No valid prices found yet. Try scraping prices to see comparison data.'
                : 'Need at least 2 products with valid prices to generate meaningful comparisons.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-3 animate-scaleIn">
      <div className="flex items-center mb-3">
        <div className="rounded-md bg-indigo-100 dark:bg-indigo-900 p-1">
          <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className="ml-2">
          <h2 className="text-base font-bold gradient-text">Price Analytics Dashboard</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Insights from {stats.totalProducts} products</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* Total Products */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 p-2.5 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <div className="rounded-md bg-blue-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
              </svg>
            </div>
            <div className="ml-1.5">
              <p className="text-xs font-medium text-blue-800 dark:text-blue-300">Products</p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-2.5 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <div className="rounded-md bg-green-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="ml-1.5">
              <p className="text-xs font-medium text-green-800 dark:text-green-300">Range</p>
              <p className="text-sm font-bold text-green-900 dark:text-green-100">
                ${stats.minPrice.toFixed(0)} - ${stats.maxPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center">
            <div className="rounded-md bg-purple-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-1.5">
              <p className="text-xs font-medium text-purple-800 dark:text-purple-300">Average</p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                ${stats.avgPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        {/* Savings Potential */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 p-2.5 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center">
            <div className="rounded-md bg-orange-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-1.5">
              <p className="text-xs font-medium text-orange-800 dark:text-orange-300">Max Savings</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                ${stats.priceDifference.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Best Deal and Price Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Best Deal Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <div className="flex items-center mb-2">
            <div className="rounded-md bg-green-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="ml-1.5 text-sm font-bold text-green-800 dark:text-green-300">🏆 Best Deal</h3>
          </div>

          {stats.cheapestProduct && (
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-0.5 text-sm">{stats.cheapestProduct.name}</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400 mb-1">{stats.cheapestProduct.price}</p>
                <div className="flex items-center space-x-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                    <svg className="h-2 w-2 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-4 4" />
                    </svg>
                    Best Price
                  </span>
                </div>
              </div>

              <a
                href={stats.cheapestProduct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center justify-center space-x-1 transition-all duration-150"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>View Product</span>
              </a>
            </div>
          )}
        </div>

        {/* Price Analysis Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center mb-2">
            <div className="rounded-md bg-indigo-500 p-1">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="ml-1.5 text-sm font-bold text-indigo-800 dark:text-indigo-300">📊 Price Analysis</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Price Difference</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">${stats.priceDifference.toFixed(0)}</span>
            </div>

            <div className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Variation</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{stats.percentageDifference.toFixed(1)}%</span>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>Lowest</span>
                <span>Highest</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span>${stats.minPrice.toFixed(0)}</span>
                <span>${stats.maxPrice.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}