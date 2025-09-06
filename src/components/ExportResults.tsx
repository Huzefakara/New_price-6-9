'use client';

import { useState } from 'react';

interface Product {
  name: string;
  url: string;
  price?: string;
  [key: string]: string | undefined;
}

interface ExportResultsProps {
  products: Product[];
}

export default function ExportResults({ products }: ExportResultsProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = () => {
    if (products.length === 0) return;

    let content: string = '';
    let filename: string = '';
    let contentType: string = '';

    if (exportFormat === 'csv') {
      // Get all possible headers from all products
      const headers = ['name', 'url', 'price'];
      products.forEach(product => {
        Object.keys(product).forEach(key => {
          if (!headers.includes(key)) {
            headers.push(key);
          }
        });
      });

      // Create CSV content
      content = headers.join(',') + '\n';
      products.forEach(product => {
        const row = headers.map(header => {
          const value = product[header] || '';
          // Escape commas and quotes in CSV
          return `"${value.toString().replace(/"/g, '""')}"`;
        });
        content += row.join(',') + '\n';
      });

      filename = 'price-comparison-results.csv';
      contentType = 'text/csv';
    } else {
      // JSON format
      content = JSON.stringify(products, null, 2);
      filename = 'price-comparison-results.json';
      contentType = 'application/json';
    }

    // Create and download the file
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center space-x-1.5">
      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors duration-150"
      >
        <option value="csv">CSV Format</option>
        <option value="json">JSON Format</option>
      </select>

      <button
        onClick={handleExport}
        disabled={products.length === 0}
        className={`text-xs px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-150 flex items-center gap-1.5 ${products.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800'
          }`}
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
    </div>
  );
}