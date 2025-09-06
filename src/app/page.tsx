'use client';

import PriceComparison from './components/PriceComparison';
import DebugScraper from './components/DebugScraper';
import { useState } from 'react';

export default function Home() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <div className="container">
          <div className="nav-container">
            <a href="#" className="nav-brand">💰 PriceTracker</a>
            <ul className="nav-links">
              <li><a href="#" className="nav-link">Home</a></li>
              <li><a href="#" className="nav-link">Features</a></li>
              <li><a href="#" className="nav-link">About</a></li>
              <li><a href="#" className="nav-link">Contact</a></li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero animate-fadeIn">
        <div className="container">
          <h1>🎯 Smart Price Comparison Tool</h1>
          <p>
            Upload your product CSV and automatically scrape competitor prices
            to make informed business decisions with real-time pricing data.
          </p>
          <div className="flex justify-center gap-md" style={{ marginTop: 'var(--space-lg)' }}>
            <a href="#price-tool" className="btn btn-primary">Start Comparing</a>
            <a href="/sample.csv" download className="btn btn-outline">📥 Download Sample</a>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="btn btn-secondary"
            >
              🔧 Debug Mode
            </button>
          </div>
        </div>
      </section>

      {/* Debug Section */}
      {showDebug && (
        <div style={{ background: 'var(--gray-50)', padding: 'var(--space-xl) 0' }}>
          <DebugScraper />
        </div>
      )}

      {/* Main Price Comparison Tool */}
      <div id="price-tool">
        <PriceComparison />
      </div>

      {/* Features Section */}
      <section className="container">
        <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
          <h2>🚀 Powerful Features</h2>
          <p className="text-gray-600">Everything you need for comprehensive price analysis</p>
        </div>

        <div className="grid grid-3">
          <div className="card hover-lift animate-slideIn">
            <div className="card-header">
              <h3 className="card-title text-primary">🔍 Smart Scraping</h3>
            </div>
            <p className="text-gray-600">
              Advanced web scraping with 20+ price selectors and fallback
              regex patterns to capture prices from any e-commerce site.
            </p>
          </div>

          <div className="card hover-lift animate-slideIn">
            <div className="card-header">
              <h3 className="card-title text-secondary">📊 Batch Processing</h3>
            </div>
            <p className="text-gray-600">
              Process up to 5 products simultaneously with smart timeout
              handling and error recovery for reliable results.
            </p>
          </div>

          <div className="card hover-lift animate-slideIn">
            <div className="card-header">
              <h3 className="card-title text-success">📈 Export & Analysis</h3>
            </div>
            <p className="text-gray-600">
              Export comparison results to CSV format with detailed
              pricing data for further analysis and reporting.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container">
        <div className="card bg-gray-50">
          <div className="text-center" style={{ marginBottom: 'var(--space-lg)' }}>
            <h2>⚡ How It Works</h2>
            <p className="text-gray-600">Simple 4-step process to get competitor pricing</p>
          </div>

          <div className="grid grid-4">
            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto var(--space-md)'
              }}>1</div>
              <h4>📤 Upload CSV</h4>
              <p className="text-gray-600">Upload your product list with competitor URLs</p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto var(--space-md)'
              }}>2</div>
              <h4>✅ Select Products</h4>
              <p className="text-gray-600">Choose which products to scrape prices for</p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--accent)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto var(--space-md)'
              }}>3</div>
              <h4>🔍 Auto Scrape</h4>
              <p className="text-gray-600">Our system automatically extracts prices</p>
            </div>

            <div className="text-center">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'var(--success)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: 'white',
                margin: '0 auto var(--space-md)'
              }}>4</div>
              <h4>📊 Export Results</h4>
              <p className="text-gray-600">Download detailed comparison report</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--gray-800)', color: 'var(--white)', padding: 'var(--space-xl) 0', marginTop: 'var(--space-2xl)' }}>
        <div className="container">
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ color: 'var(--white)', marginBottom: 'var(--space-sm)' }}>💰 PriceTracker</h3>
              <p style={{ color: 'var(--gray-400)', margin: 0 }}>Smart price comparison for competitive advantage</p>
            </div>
            <div className="flex gap-lg">
              <a href="#" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>Terms</a>
              <a href="#" style={{ color: 'var(--gray-400)', textDecoration: 'none' }}>Support</a>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--gray-600)' }}>
            <p style={{ color: 'var(--gray-400)', margin: 0 }}>
              © 2024 PriceTracker. Built with advanced scraping technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
