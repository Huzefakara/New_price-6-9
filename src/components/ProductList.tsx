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

  // Add animation effect when prices are updated
  useEffect(() => {
    if (products.length === 0) return;

    const priceElements = document.querySelectorAll('.price-value');
    priceElements.forEach(element => {
      element.classList.add('animate-fadeIn');
      setTimeout(() => {
        element.classList.remove('animate-fadeIn');
      }, 500);
    });
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="card-premium animate-scaleIn">
      <div className="p-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
          <div className="flex items-center">
            <div className="rounded-md bg-indigo-100 dark:bg-indigo-900 p-1">
              <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-2">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Product List</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{products.length} products loaded</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md transition-all duration-150 border border-gray-200 dark:border-gray-600"
            >
              {selectedProducts.length === products.length ? (
                <>
                  <svg className="h-3 w-3 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Deselect All
                </>
              ) : (
                <>
                  <svg className="h-3 w-3 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Select All
                </>
              )}
            </button>

            <button
              onClick={handleScrapeClick}
              disabled={selectedProducts.length === 0 || isLoading}
              className={`btn-primary px-4 py-1.5 text-xs font-medium rounded-lg flex items-center space-x-1.5 transition-all duration-200 ${selectedProducts.length === 0 || isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-lg'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Scraping {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}...</span>
                </>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Scrape Prices ({selectedProducts.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 w-10">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-150"
                    />
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Product Information
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 hidden lg:table-cell">
                    Website URL
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Price Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {products.map((product, index) => (
                  <tr
                    key={`${product.name}-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-150 group"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.some(
                          p => p.name === product.name && p.url === product.url
                        )}
                        onChange={() => toggleProductSelection(product)}
                        className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors duration-150"
                      />
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6">
                          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-2">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-150">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 lg:hidden mt-0.5">
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 truncate block max-w-[200px]"
                            >
                              {product.url}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap hidden lg:table-cell">
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150 max-w-xs truncate block"
                      >
                        {product.url}
                      </a>
                    </td>

                    <td className="px-3 py-2 whitespace-nowrap">
                      {product.price ? (
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                          </div>
                          <div className="ml-1.5">
                            <span className="price-value text-sm font-semibold text-gray-900 dark:text-white">
                              {product.price}
                            </span>
                            <div className="text-xs text-green-600 dark:text-green-400">Successfully scraped</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
                          </div>
                          <div className="ml-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Not scraped</span>
                            <div className="text-xs text-gray-400 dark:text-gray-500">Pending scrape</div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}