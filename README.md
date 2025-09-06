# 💰 Smart Price Comparison Tool

> **Advanced web scraping solution for competitive price monitoring and analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

A powerful web application that allows users to upload CSV files with product information and automatically scrape prices from competitor websites for comprehensive price comparison. Built with Next.js 15.5.2 and optimized for Vercel deployment with advanced anti-bot protection.

## 🚀 **Features**

### **Core Functionality**
- 📊 **CSV Upload & Processing** - Bulk product analysis with Papa Parse
- 🔍 **Smart Web Scraping** - 70+ price selectors for global e-commerce sites
- 🌐 **International Support** - Thai, Spanish, German, French price detection
- 🛡️ **Anti-Bot Protection** - Realistic browser headers and sequential processing
- 📱 **Real-time Progress** - Live scraping status and progress tracking
- 📈 **Export Results** - Download comparison data as CSV

### **Advanced Capabilities**
- 🔧 **Debug Mode** - Test individual URLs and troubleshoot scraping issues
- ⚡ **Sequential Processing** - Reliable scraping without triggering rate limits
- 🎯 **Platform-Specific** - Optimized for Amazon, Currys, Shopify, WooCommerce, Magento
- 🌏 **Global Reach** - Support for diverse international e-commerce patterns
- 💱 **Currency Support** - USD, GBP, EUR, THB, and more
- 🚀 **Vercel Optimized** - Serverless functions with proper timeouts and memory allocation

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Prepare a CSV file with the following columns:
   - `name`: Product name
   - `url`: URL of the competitor's product page

2. Upload the CSV file using the interface

3. Select products and click "Scrape Prices" to fetch current prices

4. View the comparison results in the table

## Sample CSV

A sample CSV file is included in the `/public` directory for testing purposes.

## Technical Details

- Built with Next.js and TypeScript
- Uses the App Router for routing
- Tailwind CSS for styling
- PapaParse for CSV parsing
- Cheerio for web scraping
- Vercel Edge Runtime for serverless functions

## Deploy on Vercel

This application is optimized for deployment on Vercel:

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Limitations

- Web scraping is limited to 10 products at a time to avoid timeouts
- Some websites may block scraping attempts
- The scraping logic uses generic selectors and may not work for all websites

## License

MIT
