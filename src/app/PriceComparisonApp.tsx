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
    } catch (err) {
      console.error('Scrape request failed:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
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