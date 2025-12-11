'use client';

import { useState } from 'react';
import CSVUploader from '@/components/CSVUploader';
import ProductList from '@/components/ProductList';
import ExportResults from '@/components/ExportResults';
import PriceComparisonDashboard from '@/components/PriceComparisonDashboard';

interface Product {
  name: string;
  url: string;
  price?: string;
  [key: string]: string | undefined;
}

interface CSVRow {
  product_name: string;
  our_price?: string;
  competitor_url_1?: string;
  competitor_url_2?: string;
  competitor_url_3?: string;
  [key: string]: string | undefined;
}

export default function PriceComparisonApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // Add state for progress tracking
  const [scrapingProgress, setScrapingProgress] = useState<{
    current: number;
    total: number;
    currentProduct: string;
    batch?: number;
    totalBatches?: number;
  }>({ current: 0, total: 0, currentProduct: '' });

  const handleDataParsed = (data: CSVRow[]) => {
    console.log('Raw CSV data:', data);

    // Transform CSV data into individual products for scraping
    const transformedProducts: Product[] = [];

    data.forEach(row => {
      const productName = row.product_name;
      if (!productName) return;

      // Add each competitor URL as a separate product
      [row.competitor_url_1, row.competitor_url_2, row.competitor_url_3]
        .filter(url => url && url.trim() !== '')
        .forEach((url, index) => {
          transformedProducts.push({
            name: `${productName} - Competitor ${index + 1}`,
            url: url!,
            originalProduct: productName,
            ourPrice: row.our_price
          });
        });
    });

    console.log('Transformed products:', transformedProducts);
    setProducts(transformedProducts);
    setError('');
  };

  const handleScrapeRequest = async (productsToScrape: Product[]) => {
    console.log('Starting scrape request for products:', productsToScrape);
    setIsLoading(true);
    setError('');
    // Initialize progress tracking
    setScrapingProgress({
      current: 0,
      total: productsToScrape.length,
      currentProduct: '',
      batch: 1,
      totalBatches: Math.ceil(productsToScrape.length / 15) // Based on our batch size of 15
    });

    try {
      console.log('Sending request to /api/scrape');
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: productsToScrape }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to scrape prices');
      }

      const data = await response.json();
      console.log('Scrape response data:', data);

      // Update products with scraped prices
      setProducts(prevProducts => {
        return prevProducts.map(product => {
          const scrapedProduct = data.products.find(
            (p: Product) => p.name === product.name && p.url === product.url
          );

          if (scrapedProduct) {
            console.log(`Updated price for ${product.name}: ${scrapedProduct.price}`);
            return { ...product, price: scrapedProduct.price };
          }

          return product;
        });
      });

      // Show completion message
      setScrapingProgress({
        current: productsToScrape.length,
        total: productsToScrape.length,
        currentProduct: 'All products processed!',
        batch: Math.ceil(productsToScrape.length / 15),
        totalBatches: Math.ceil(productsToScrape.length / 15)
      });
    } catch (err) {
      console.error('Scrape request failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      // Keep loading state for a bit to show completion
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <CSVUploader onDataParsed={handleDataParsed} />

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Show progress during scraping */}
      {isLoading && scrapingProgress.total > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-blue-800">Scraping Progress</h3>
            <span className="text-sm text-blue-600">
              {scrapingProgress.current} / {scrapingProgress.total} products
              {scrapingProgress.batch && scrapingProgress.totalBatches && (
                <> · Batch {scrapingProgress.batch} / {scrapingProgress.totalBatches}</>
              )}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(scrapingProgress.current / scrapingProgress.total) * 100}%` }}
            ></div>
          </div>
          {scrapingProgress.currentProduct && (
            <p className="mt-2 text-sm text-blue-700">
              Current: {scrapingProgress.currentProduct}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">Product Comparison</h2>
          {products.length > 0 && <ExportResults products={products} />}
        </div>

        {products.length > 0 && (
          <PriceComparisonDashboard products={products} />
        )}

        <ProductList
          products={products}
          onScrapeRequest={handleScrapeRequest}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}