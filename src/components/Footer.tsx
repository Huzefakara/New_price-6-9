export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto py-4 px-3 sm:px-4 lg:px-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-4">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors duration-150"
            >
              <span className="sr-only">About</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Price Comparison Tool. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}