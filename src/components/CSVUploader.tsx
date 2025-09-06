'use client';

import { useState, useRef, ChangeEvent, useCallback } from 'react';
import Papa from 'papaparse';

interface CSVRow {
  product_name: string;
  our_price?: string;
  competitor_url_1?: string;
  competitor_url_2?: string;
  competitor_url_3?: string;
  [key: string]: string | undefined;
}

interface CSVUploaderProps {
  onDataParsed: (data: CSVRow[]) => void;
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
        if (!headers.includes('product_name')) {
          setError('CSV must include "product_name" column');
          return;
        }

        // Check if there are any rows with competitor URLs
        const csvRows = results.data as CSVRow[];
        const hasValidData = csvRows.some(row =>
          row.product_name && (
            row.competitor_url_1 ||
            row.competitor_url_2 ||
            row.competitor_url_3
          )
        );

        if (!hasValidData) {
          setError('CSV must contain products with at least one competitor URL');
          return;
        }

        // Type assertion since we validated the structure
        onDataParsed(csvRows);
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
    <div className="card-premium animate-scaleIn">
      <div className="p-3">
        <div className="flex items-center mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md blur opacity-60"></div>
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-500 p-1 rounded-md">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="ml-2">
            <h2 className="text-base font-bold gradient-text">Upload Product CSV</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">Import your product list for price comparison</p>
          </div>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 group ${isDragging
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Upload Icon with Animation */}
          <div className="relative mb-3">
            <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging
              ? 'bg-indigo-100 dark:bg-indigo-900/50 scale-110'
              : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'
              }`}>
              <svg
                className={`h-4 w-4 transition-all duration-300 ${isDragging
                  ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                  : 'text-gray-400 dark:text-gray-500 group-hover:text-indigo-500'
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {isDragging && (
              <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20"></div>
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isDragging ? 'Drop your CSV file here' : 'Drag and drop your CSV file'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs">
              or
              <button
                onClick={handleButtonClick}
                className="mx-1.5 font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline transition-colors duration-150"
                type="button"
              >
                browse files
              </button>
              from your computer
            </p>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-2.5 flex items-center justify-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>CSV must include "product_name" column and competitor URLs</span>
          </div>
        </div>

        {fileName && (
          <div className={`mt-4 p-3 rounded-xl animate-fadeIn ${isSuccess
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800'
            }`}>
            <div className="flex items-center">
              <div className={`rounded-lg p-1.5 ${isSuccess
                ? 'bg-green-100 dark:bg-green-800'
                : 'bg-blue-100 dark:bg-blue-800'
                }`}>
                {isSuccess ? (
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div className="ml-2">
                <p className={`text-sm font-semibold ${isSuccess
                  ? 'text-green-800 dark:text-green-300'
                  : 'text-blue-800 dark:text-blue-300'
                  }`}>
                  {isSuccess ? 'CSV successfully processed!' : `File uploaded: ${fileName}`}
                </p>
                {!isSuccess && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Processing your file...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-2.5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-800 rounded-lg animate-fadeIn">
          <div className="flex items-center">
            <div className="rounded-md p-1 bg-red-100 dark:bg-red-800">
              <svg className="h-3 w-3 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300">Upload Error</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 card-compact p-3">
        <div className="flex items-center mb-2">
          <div className="rounded-md bg-indigo-100 dark:bg-indigo-900 p-1">
            <svg className="h-3 w-3 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="ml-2 text-sm font-semibold text-gray-800 dark:text-white">Sample Format</h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 mb-2.5">
          <div className="font-mono text-xs text-gray-800 dark:text-gray-300">
            <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-1.5 text-xs">product_name,our_price,competitor_url_1,competitor_url_2,competitor_url_3</div>
            <div className="space-y-0.5 text-gray-600 dark:text-gray-400 text-[10px]">
              <div>"iPhone 15 Pro","£999","https://amazon.co.uk/...","https://currys.co.uk/...","https://argos.co.uk/..."</div>
              <div>"Samsung Galaxy S24","£799","https://amazon.co.uk/...","https://currys.co.uk/...","https://very.co.uk/..."</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <a
            href="/sample.csv"
            download
            className="btn-primary px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all duration-150"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download Sample</span>
          </a>
        </div>
      </div>
    </div>
  );
}