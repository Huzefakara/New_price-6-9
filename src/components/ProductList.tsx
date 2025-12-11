'use client';

import { useState, useEffect } from 'react';

interface Product {
  name: string;
  url: string;
  price?: string;
  [key: string]: string | undefined;
}

interface ProductListProps {
  products: Product[];
  onScrapeRequest: (products: Product[]) => void;
  isLoading: boolean;
}

export default function ProductList({ products, onScrapeRequest, isLoading }: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const toggleProductSelection = (product: Product) => {
    if (selectedProducts.some(p => p.name === product.name && p.url === product.url)) {
      setSelectedProducts(selectedProducts.filter(
        p => !(p.name === product.name && p.url === product.url)
      ));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts([...products]);
    }
  };

  const handleScrapeClick = () => {
    if (selectedProducts.length > 0) {
      onScrapeRequest(selectedProducts);
    }
  };

  if (products.length === 0) {
    return null;
  }

  // Add animation effect when prices are updated
  useEffect(() => {
    const priceElements = document.querySelectorAll('.price-value');
    priceElements.forEach(element => {
      element.classList.add('animate-fadeIn');
      setTimeout(() => {
        element.classList.remove('animate-fadeIn');
      }, 500);
    });
  }, [products]);

  return (
    <div className="w-full bg-white rounded-lg shadow-sm dark:bg-gray-800 overflow-hidden transition-colors duration-200">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">Products ({products.length})</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="py-1 px-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium rounded transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
          </button>
          <button
            onClick={handleScrapeClick}
            disabled={selectedProducts.length === 0 || isLoading}
            className={`py-1 px-2 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
              selectedProducts.length === 0 || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Scraping...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Scrape Prices
              </>
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700 transition-colors duration-200">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 w-16">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Product Name
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300 hidden md:table-cell">
                URL
              </th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 transition-colors duration-200">
            {products.map((product, index) => (
              <tr key={`${product.name}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedProducts.some(
                      p => p.name === product.name && p.url === product.url
                    )}
                    onChange={() => toggleProductSelection(product)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">{product.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 md:hidden truncate max-w-[200px]">
                    {product.url}
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <div className="text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                      {product.url}
                    </a>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {product.price ? (
                      <span className="price-value transition-colors duration-200">{product.price}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 transition-colors duration-200">Not scraped</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}