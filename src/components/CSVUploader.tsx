'use client';

import { useState, useRef, ChangeEvent, useCallback } from 'react';
import Papa from 'papaparse';

interface Product {
  name: string;
  url: string;
  [key: string]: string; // For any additional columns
}

interface CSVUploaderProps {
  onDataParsed: (data: Product[]) => void;
}

export default function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((file: File) => {
    // Reset states
    setError('');
    setIsSuccess(false);
    
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setFileName(file.name);
    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsUploading(false);
        
        // Validate required columns
        const headers = results.meta.fields || [];
        if (!headers.includes('name') || !headers.includes('url')) {
          setError('CSV must include "name" and "url" columns');
          return;
        }
        
        // Check if there's data
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }
        
        // Type assertion since we validated the structure
        const products = results.data as Product[];
        onDataParsed(products);
        setIsSuccess(true);
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      },
      error: (error) => {
        setIsUploading(false);
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  }, [onDataParsed]);
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-card dark:bg-gray-800 transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white transition-colors duration-200">Upload Product CSV</h2>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
          Drag and drop your CSV file here, or
          <button 
            onClick={handleButtonClick}
            className="mx-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer focus:outline-none focus:underline transition-colors duration-200"
            type="button"
          >
            browse
          </button>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </p>
        
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 transition-colors duration-200">
          CSV must include "name" and "url" columns
        </p>
        
        {fileName && (
          <div className={`mt-4 p-3 rounded-md ${isSuccess ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'} transition-colors duration-200 animate-fadeIn`}>
            <div className="flex items-center">
              {isSuccess ? (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              <p className="text-sm">
                {isSuccess ? 'CSV successfully processed!' : `File: ${fileName}`}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md dark:bg-red-900/30 dark:text-red-400 transition-colors duration-200 animate-fadeIn">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-gray-50 p-4 rounded-md dark:bg-gray-900/50 transition-colors duration-200">
        <div className="flex items-center mb-2">
          <svg className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">Sample Format</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md overflow-x-auto border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <pre className="text-xs text-gray-800 dark:text-gray-300 transition-colors duration-200">name,url
Product 1,https://example.com/product1
Product 2,https://example.com/product2</pre>
        </div>
        <div className="mt-3 flex justify-end">
          <a 
            href="/sample.csv" 
            download 
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center transition-colors duration-200"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download sample CSV
          </a>
        </div>
      </div>
    </div>
  );
}