import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Configure for Node.js runtime to support external libraries (required for Vercel)
export const runtime = 'nodejs';
export const maxDuration = 300; // Maximum duration for Vercel Pro (5 minutes)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Product {
  name: string;
  url: string;
  price?: string;
  error?: string;
}

async function scrapePrice(url: string): Promise<{ price: string | null; error?: string }> {
  try {
    console.log(`Attempting to scrape: ${url}`);

    // Use fetch with timeout (reduced for Vercel reliability)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // Reduced to 12 seconds for Vercel

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Referer': 'https://www.google.com/',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = `HTTP ${response.status}: ${response.statusText}`;
      console.error(`Failed to fetch ${url}: ${error}`);
      return { price: null, error };
    }

    const html = await response.text();
    console.log(`Successfully fetched HTML for ${url}, length: ${html.length}`);

    const $ = cheerio.load(html);

    // Enhanced price selectors for global e-commerce sites
    const priceSelectors = [
      // General price selectors
      '.price', '.product-price', '.offer-price', '.current-price', '.price-value',
      '.price-current', '.price-now', '.sale-price', '.regular-price', '.final-price',
      '.selling-price', '.list-price', '.special-price', '.discount-price',

      // Common e-commerce patterns
      '.price-large', '.price__large', '.price-current__large', '.product-price__large',
      '.price-display', '.price-wrapper', '.pdp-price', '.current-price-wrapper',
      '.price-component', '.price-info', '.price-section', '.price-box', '.price-container',
      '.price-holder', '.price-content', '.price-text', '.price-display-value',

      // Attribute-based selectors
      '[data-component="price"]', '[data-testid="large-price"]', '[data-testid="current-price"]',
      '[data-price]', '[itemprop="price"]', '[data-testid*="price"]', '[class*="price"]',
      '[data-cy*="price"]', '[data-automation*="price"]', '[data-qa*="price"]',
      '[aria-label*="price"]', '[title*="price"]',

      // Amazon-specific
      '#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen',
      '.a-price-whole', '.a-price .a-price-whole', '.a-price-current',

      // International and diverse patterns
      '.cost', '.amount', '.money', '.currency', '.value', '.pricing', '.rate',
      '.product_price', '.product-price-value', '.offer-price-current',

      // Thai/Asian e-commerce patterns
      '.price_value', '.price-amount', '.product-cost', '.item-price', '.sale_price',
      '.current_price', '.display-price', '.show-price', '.main-price', '.big-price',

      // Additional international patterns
      '.precio', '.preis', '.prix', '.prezzo', '.цена', '.价格', '.가격', '.ราคา',
      '[class*="precio"]', '[class*="preis"]', '[class*="prix"]', '[class*="prezzo"]',
      '[class*="ราคา"]', '[data-price-value]', '[data-cost]', '[data-amount]',

      // Mobile/responsive selectors
      '.mobile-price', '.responsive-price', '.m-price', '.sm-price',

      // Shopify patterns
      '.price--highlight', '.price--regular', '.price--sale', '.price__regular',
      '.price__sale', '.product-form__price', '.product__price',

      // WooCommerce patterns
      '.woocommerce-Price-amount', '.amount', '.price .amount',

      // Magento patterns
      '.price-wrapper .price', '.regular-price .price', '.special-price .price',

      // Additional Thai patterns
      '.price-th', '.baht-price', '.thb-price', '.thai-price',

      // More generic patterns for international sites
      '[class*="baht"]', '[class*="thb"]', '[class*="currency"]',
      '.product-price-wrap', '.product-pricing', '.item-pricing'
    ];

    for (const selector of priceSelectors) {
      const priceElements = $(selector);

      if (priceElements.length > 0) {
        console.log(`Found ${priceElements.length} elements for selector: ${selector}`);

        for (let i = 0; i < priceElements.length; i++) {
          const element = priceElements.eq(i);

          // Try different ways to extract price
          let price = element.text().trim();

          if (!price && element.attr('content')) {
            price = element.attr('content') || '';
          }
          if (!price && element.attr('data-price')) {
            price = element.attr('data-price') || '';
          }
          if (!price && element.attr('value')) {
            price = element.attr('value') || '';
          }

          // Clean and validate price
          if (price) {
            // Remove extra whitespace and clean up
            price = price.replace(/\s+/g, ' ').trim();

            // Check if it looks like a price (contains currency symbols, numbers, or Thai characters)
            if (/[\$£€¥₹฿บาท]|\d+[.,]\d+|\d+/.test(price)) {
              console.log(`Found potential price: "${price}" using selector: ${selector}`);
              return { price };
            }
          }
        }
      }
    }

    // If no price found with selectors, try to find any text that looks like a price
    console.log('No price found with selectors, trying regex pattern matching...');
    const bodyText = $('body').text();

    // Enhanced price patterns to catch more formats
    const pricePatterns = [
      // Currency symbols with numbers
      /[\$£€¥₹฿]\s*\d+(?:[.,]\d{2,3})?/g,
      /\d+(?:[.,]\d{2,3})?\s*[\$£€¥₹฿]/g,
      // Thai Baht specific
      /\b\d+(?:[.,]\d{2})?\s*บาท/g,
      /บาท\s*\d+(?:[.,]\d{2})?/g,
      // Numbers with decimal points (common price format)
      /\b\d{1,6}[.,]\d{2}\b/g,
      // Large whole numbers (for expensive items)
      /\b\d{3,6}\b/g,
      // Comma-separated thousands
      /\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g
    ];

    for (const pattern of pricePatterns) {
      const priceMatches = bodyText.match(pattern);
      if (priceMatches && priceMatches.length > 0) {
        // Filter out obviously wrong prices (like years, phone numbers, etc.)
        const validPrices = priceMatches.filter(price => {
          const numericValue = parseFloat(price.replace(/[^\d.,]/g, '').replace(',', '.'));
          return numericValue > 1 && numericValue < 100000; // Reasonable price range
        });

        if (validPrices.length > 0) {
          console.log(`Found price via pattern matching: ${validPrices[0]}`);
          return { price: validPrices[0].trim() };
        }
      }
    }

    console.log(`No price found for ${url}`);
    return { price: null, error: 'No price selectors matched' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error scraping ${url}:`, errorMessage);
    return { price: null, error: errorMessage };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { products } = await request.json() as { products: Product[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Please provide an array of products.' },
        { status: 400 }
      );
    }

    console.log(`Received request to scrape ${products.length} products`);

    // Limit batch size for Vercel reliability (max 10 products per request)
    if (products.length > 10) {
      return NextResponse.json(
        {
          error: 'Too many products. Please limit to 10 products per batch for optimal performance.',
          maxAllowed: 10,
          received: products.length
        },
        { status: 400 }
      );
    }

    // Process all selected products sequentially to avoid rate limiting
    const results = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Processing product ${i + 1}/${products.length}: ${product.name}`);

      const result = await scrapePrice(product.url);
      results.push({
        ...product,
        price: result.price || 'Price not found',
        error: result.error
      });

      // Add delay between requests to avoid triggering anti-bot protection
      if (i < products.length - 1) {
        console.log('Adding 2-second delay before next request...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`Scraping completed. Results:`, results.map(r => ({ name: r.name, price: r.price, error: r.error })));

    return NextResponse.json({
      products: results,
      message: `Successfully processed ${results.length} products sequentially`,
      totalProcessed: results.length,
      successful: results.filter(r => r.price && r.price !== 'Price not found').length,
      errors: results.filter(r => r.error).map(r => ({ name: r.name, error: r.error }))
    });
  } catch (error) {
    console.error('Error processing scrape request:', error);
    return NextResponse.json(
      {
        error: 'Failed to process scraping request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}