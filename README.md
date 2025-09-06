# Price Comparison Tool

A web application that allows users to upload a CSV file with product information and scrape prices from competitor websites for comparison. This project is built with [Next.js](https://nextjs.org) and optimized for Vercel deployment.

## Features

- CSV upload and parsing for product data
- Web scraping functionality to extract prices from competitor websites
- Price comparison and visualization
- Responsive UI with a dashboard for comparison results
- Export functionality for comparison results
- Optimized for Vercel deployment

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
