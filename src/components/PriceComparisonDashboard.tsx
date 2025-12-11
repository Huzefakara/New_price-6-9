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
      <div className="bg-white p-3 rounded-lg shadow-sm dark:bg-gray-800">
        <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-white">Price Comparison Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {products.length === 0 
            ? 'Upload a CSV file and scrape prices to see comparison data.'
            : productsWithPrices.length === 0
              ? 'No valid prices found. Try scraping prices first.'
              : 'Need at least 2 products with valid prices for comparison.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm dark:bg-gray-800">
      <h2 className="text-base font-semibold mb-2 text-gray-800 dark:text-white">Price Comparison Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-blue-50 p-2 rounded dark:bg-blue-900">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Products Compared</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalProducts}</p>
        </div>
        
        <div className="bg-green-50 p-2 rounded dark:bg-green-900">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Price Range</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            ${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-purple-50 p-2 rounded dark:bg-purple-900">
          <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200">Average Price</h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            ${stats.avgPrice.toFixed(2)}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Best Deal</h3>
          {stats.cheapestProduct && (
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">{stats.cheapestProduct.name}</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.cheapestProduct.price}</p>
              <a 
                href={stats.cheapestProduct.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400 mt-1 inline-block"
              >
                View Product
              </a>
            </div>
          )}
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Price Difference</h3>
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absolute Difference</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">${stats.priceDifference.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Percentage Difference</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.percentageDifference.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}