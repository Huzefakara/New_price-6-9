import { useState } from 'react'
import CSVUploader from '@/components/CSVUploader'
import PriceComparisonDashboard from '@/components/PriceComparisonDashboard'
import ProductList from '@/components/ProductList'

interface Product {
  name: string
  url: string
  price?: string
}

export default function PriceComparisonApp() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [scrapingProgress, setScrapingProgress] = useState<{ current: number; total: number; currentProduct: string }>({ current: 0, total: 0, currentProduct: '' })

  const handleDataParsed = (parsedProducts: Product[]) => {
    setProducts(parsedProducts)
    setError('')
  }

  // Scrape selected products sequentially with optional pauses so we cover everything
  const handleScrapeRequest = async (productsToScrape: Product[]) => {
    if (!productsToScrape || productsToScrape.length === 0) {
      setError('Please select at least one product to scrape')
      return
    }

    setIsLoading(true)
    setError('')
    setScrapingProgress({ current: 0, total: productsToScrape.length, currentProduct: '' })

    const pauseEvery = 15 // after this many requests, take a breather
    const pauseMs = 1500 // pause duration to ease rate limits
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    for (let index = 0; index < productsToScrape.length; index++) {
      const product = productsToScrape[index]

      // Show which product is being processed
      setScrapingProgress(prev => ({ ...prev, currentProduct: product?.name ?? '' }))

      try {
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ products: [product] }),
        })

        if (!response.ok) {
          // Don't stop on errors; collect and continue
          let errorMessage = 'Failed to scrape price for current product'
          try {
            const errorData = await response.json()
            errorMessage = errorData.error || errorMessage
          } catch {}
          setError(errorMessage)
        } else {
          const data = await response.json()
          // Update this product with the scraped price
          setProducts(prevProducts => {
            return prevProducts.map(product => {
              const scrapedProduct = data.products?.find((p: Product) => p.name === product.name && p.url === product.url)
              if (scrapedProduct) {
                return { ...product, price: scrapedProduct.price }
              }
              return product
            })
          })
        }
      } catch (err) {
        // Network or unexpected error; do not stop scanning
        setError(err instanceof Error ? err.message : 'An unknown error occurred during scraping')
      }

      // Increment progress by 1 product
      setScrapingProgress(prev => ({
        ...prev,
        current: Math.min(prev.current + 1, prev.total),
      }))

      // Take a short break periodically but keep going automatically
      if ((index + 1) % pauseEvery === 0 && index + 1 < productsToScrape.length) {
        await sleep(pauseMs)
      }
    }

    setIsLoading(false)
    setScrapingProgress({ current: 0, total: 0, currentProduct: '' })
  }

  return (
    <div className="flex flex-col gap-8">
      <CSVUploader onDataParsed={handleDataParsed} />
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Progress UI */}
      {isLoading && scrapingProgress.total > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏳ Scraping Progress</h3>
          </div>
          <div>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <div style={{
                background: 'var(--gray-200)',
                borderRadius: 'var(--radius-md)',
                height: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'var(--primary)',
                  height: '100%',
                  width: `${(scrapingProgress.current / scrapingProgress.total) * 100}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <p style={{ marginTop: 'var(--space-sm)', margin: 0, fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Processing {scrapingProgress.current} of {scrapingProgress.total} products
                {scrapingProgress.currentProduct && (
                  <><br />Current: {scrapingProgress.currentProduct}</>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Product Comparison</h2>
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
  )
}