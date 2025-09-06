'use client';

import { useState } from 'react';

interface Product {
    name: string;
    url: string;
    price?: string;
    originalProduct?: string;
    ourPrice?: string;
    error?: string;
}

interface CSVRow {
    product_name: string;
    our_price: string;
    competitor_url_1: string;
    competitor_url_2: string;
    competitor_url_3: string;
}

export default function PriceComparison() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [scrapingProgress, setScrapingProgress] = useState({ current: 0, total: 0, currentProduct: '' });

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

            const transformedProducts: Product[] = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const row: any = {};

                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });

                const productName = row.product_name;
                if (!productName) continue;

                // Add each competitor URL as a separate product
                [row.competitor_url_1, row.competitor_url_2, row.competitor_url_3]
                    .filter(url => url && url.trim() !== '')
                    .forEach((url, index) => {
                        transformedProducts.push({
                            name: `${productName} - Competitor ${index + 1}`,
                            url: url,
                            originalProduct: productName,
                            ourPrice: row.our_price
                        });
                    });
            }

            setProducts(transformedProducts);
            setError('');
        } catch (err) {
            setError('Failed to parse CSV file');
            console.error('CSV parsing error:', err);
        }
    };

    const handleProductSelection = (index: number) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedProducts(newSelected);
    };

    const handleScrapeSelected = async () => {
        const productsToScrape = products.filter((_, index) => selectedProducts.has(index));

        if (productsToScrape.length === 0) {
            setError('Please select at least one product to scrape');
            return;
        }

        console.log('Starting scrape request for products:', productsToScrape);
        setIsLoading(true);
        setError('');
        setScrapingProgress({ current: 0, total: productsToScrape.length, currentProduct: '' });

        try {
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products: productsToScrape }),
            });

            if (!response.ok) {
                const errorData = await response.json();
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
            setScrapingProgress({ current: 0, total: 0, currentProduct: '' });
        }
    };

    const exportToCSV = () => {
        if (products.length === 0) return;

        const headers = ['name', 'url', 'price', 'original_product', 'our_price'];
        const csvContent = [
            headers.join(','),
            ...products.map(product => [
                `"${product.name}"`,
                `"${product.url}"`,
                `"${product.price || 'Not scraped'}"`,
                `"${product.originalProduct || ''}"`,
                `"${product.ourPrice || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'price-comparison-results.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const stats = {
        total: products.length,
        scraped: products.filter(p => p.price).length,
        selected: selectedProducts.size
    };

    return (
        <div className="container" style={{ marginTop: 'var(--space-lg)' }}>
            {/* Header */}
            <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
                <h1>Price Comparison Tool</h1>
                <p className="text-gray-600">
                    Upload a CSV file with product URLs and scrape competitor prices automatically
                </p>
            </div>

            {/* Upload Section */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">📤 Upload CSV File</h3>
                </div>

                <div className="form-group">
                    <label className="form-label">Choose CSV File</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="form-input"
                    />
                    <p className="text-gray-500" style={{ fontSize: '0.875rem', marginTop: 'var(--space-sm)' }}>
                        Upload a CSV with columns: product_name, our_price, competitor_url_1, competitor_url_2, competitor_url_3
                    </p>
                </div>

                <div className="flex gap-md" style={{ marginTop: 'var(--space-lg)' }}>
                    <a
                        href="/sample.csv"
                        download
                        className="btn btn-outline"
                        style={{ textDecoration: 'none' }}
                    >
                        📥 Download Sample CSV
                    </a>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="card" style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Statistics */}
            {products.length > 0 && (
                <div className="grid grid-3">
                    <div className="card text-center">
                        <h3 className="text-primary" style={{ fontSize: '2rem', margin: 0 }}>
                            {stats.total}
                        </h3>
                        <p className="text-gray-600" style={{ margin: 0 }}>Total Products</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-success" style={{ fontSize: '2rem', margin: 0 }}>
                            {stats.scraped}
                        </h3>
                        <p className="text-gray-600" style={{ margin: 0 }}>Prices Scraped</p>
                    </div>
                    <div className="card text-center">
                        <h3 className="text-secondary" style={{ fontSize: '2rem', margin: 0 }}>
                            {stats.selected}
                        </h3>
                        <p className="text-gray-600" style={{ margin: 0 }}>Selected</p>
                    </div>
                </div>
            )}

            {/* Progress Display */}
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

            {/* Actions */}
            {products.length > 0 && (
                <div className="card">
                    <div className="flex justify-between items-center gap-md">
                        <h3 className="card-title" style={{ margin: 0 }}>🎯 Actions</h3>
                        <div className="flex gap-md">
                            <button
                                onClick={handleScrapeSelected}
                                disabled={selectedProducts.size === 0 || isLoading}
                                className={`btn ${selectedProducts.size === 0 || isLoading ? 'btn-outline' : 'btn-primary'}`}
                            >
                                {isLoading ? '⏳ Scraping...' : '🔍 Scrape Selected'}
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="btn btn-secondary"
                            >
                                📊 Export Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table */}
            {products.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">📋 Product List</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.size === products.length && products.length > 0}
                                            onChange={() => {
                                                if (selectedProducts.size === products.length) {
                                                    setSelectedProducts(new Set());
                                                } else {
                                                    setSelectedProducts(new Set(products.map((_, i) => i)));
                                                }
                                            }}
                                            style={{ marginRight: 'var(--space-sm)' }}
                                        />
                                        Select All
                                    </th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Our Price</th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Competitor URL</th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Scraped Price</th>
                                    <th style={{ padding: 'var(--space-sm)', textAlign: 'left' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr
                                        key={index}
                                        style={{
                                            borderBottom: '1px solid var(--gray-200)',
                                            background: selectedProducts.has(index) ? 'var(--gray-50)' : 'transparent'
                                        }}
                                    >
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.has(index)}
                                                onChange={() => handleProductSelection(index)}
                                            />
                                        </td>
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{product.originalProduct}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                    {product.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            <span className="text-primary" style={{ fontWeight: '600' }}>
                                                {product.ourPrice}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            <a
                                                href={product.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary"
                                                style={{
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    maxWidth: '200px',
                                                    display: 'block',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                🔗 {product.url}
                                            </a>
                                        </td>
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            {product.price ? (
                                                <span className="text-success" style={{ fontWeight: '600' }}>
                                                    {product.price}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td style={{ padding: 'var(--space-sm)' }}>
                                            {product.price ? (
                                                <span style={{
                                                    background: 'var(--success)',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    ✅ Scraped
                                                </span>
                                            ) : (
                                                <span style={{
                                                    background: 'var(--gray-400)',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem'
                                                }}>
                                                    ⏸️ Pending
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="card bg-gray-50">
                <div className="card-header">
                    <h3 className="card-title">📖 How to Use</h3>
                </div>
                <ol style={{ paddingLeft: 'var(--space-lg)', margin: 0 }}>
                    <li style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Upload CSV:</strong> Use the upload button to select your CSV file
                    </li>
                    <li style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Review Products:</strong> Check the parsed products in the table below
                    </li>
                    <li style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Select Products:</strong> Choose which products you want to scrape prices for
                    </li>
                    <li style={{ marginBottom: 'var(--space-sm)' }}>
                        <strong>Scrape Prices:</strong> Click "Scrape Selected" to fetch current prices
                    </li>
                    <li>
                        <strong>Export Results:</strong> Download the comparison results as CSV
                    </li>
                </ol>
            </div>
        </div>
    );
}