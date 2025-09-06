async function scrapePrice(url: string): Promise<{ price: string | null; error?: string }> {
  try {
    console.log(`Attempting to scrape: ${url}`);

    // Use fetch with timeout (increased back to 15 seconds for better success rate)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased back to 15 seconds

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

    // STRATEGY 1: Try comprehensive price selectors
    console.log('STRATEGY 1: Comprehensive selector search...');
    const priceSelectors = [
      // === MOST COMMON PATTERNS FIRST ===
      '.price', '.product-price', '.current-price', '.price-current', '.price-value',
      '.price-now', '.sale-price', '.offer-price', '.final-price', '.selling-price',

      // === UK RETAILER SPECIFIC PATTERNS ===
      '.now-price', '.was-price', '.c-product-price', '.pdp-product-price',
      '.price-current-value', '.product-price-current', '.price-range', '.price-value-current',

      // === ATTRIBUTE-BASED SELECTORS ===
      '[data-price]', '[itemprop="price"]', '[data-testid*="price"]', '[class*="price"]',
      '[data-component="price"]', '[data-testid="large-price"]', '[data-testid="current-price"]',
      '[data-test="price"]', '[data-testid="price-display"]', '[aria-label*="price"]',

      // === AMAZON SPECIFIC ===
      '#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen',
      '.a-price-whole', '.a-price .a-price-whole', '.a-price-current',

      // === GENERIC PATTERNS ===
      '.cost', '.amount', '.money', '.currency', '.value', '.pricing',
      '.product_price', '.product-price-value', '.price-display', '.price-wrapper',
      '.price-container', '.price-holder', '.price-content', '.price-text'
    ];

    let foundPrice = null;

    for (const selector of priceSelectors) {
      const elements = $(selector);

      if (elements.length > 0) {
        console.log(`Found ${elements.length} elements for selector: ${selector}`);

        for (let i = 0; i < elements.length; i++) {
          const element = elements.eq(i);

          // Try multiple extraction methods
          let priceText = element.text().trim();
          if (!priceText) priceText = element.attr('content') || '';
          if (!priceText) priceText = element.attr('data-price') || '';
          if (!priceText) priceText = element.attr('value') || '';
          if (!priceText) priceText = element.attr('title') || '';

          if (priceText) {
            priceText = priceText.replace(/\s+/g, ' ').trim();

            // Enhanced price validation
            if (isValidPrice(priceText)) {
              console.log(`✅ FOUND PRICE: "${priceText}" using selector: ${selector}`);
              foundPrice = priceText;
              break;
            }
          }
        }
        if (foundPrice) break;
      }
    }

    if (foundPrice) return { price: foundPrice };

    // STRATEGY 2: Text content analysis with currency symbols
    console.log('STRATEGY 2: Currency symbol search in text...');
    const pageText = $('body').text();
    const currencyPatterns = [
      /£\s*\d+(?:[.,]\d{1,3})?/g,
      /\d+(?:[.,]\d{1,3})?\s*£/g,
      /€\s*\d+(?:[.,]\d{1,3})?/g,
      /\d+(?:[.,]\d{1,3})?\s*€/g,
      /\$\s*\d+(?:[.,]\d{1,3})?/g,
      /\d+(?:[.,]\d{1,3})?\s*\$/g,
      /\b\d{1,4}[.,]\d{2}\b/g,
      /\b\d{2,6}\b(?=\s*(?:pounds?|euros?|dollars?|gbp|eur|usd))/gi
    ];

    for (const pattern of currencyPatterns) {
      const matches = pageText.match(pattern);
      if (matches && matches.length > 0) {
        const validMatches = matches.filter(match => {
          const numericValue = parseFloat(match.replace(/[^\d.,]/g, '').replace(',', '.'));
          return numericValue >= 1 && numericValue <= 50000;
        });

        if (validMatches.length > 0) {
          console.log(`✅ FOUND PRICE via pattern: "${validMatches[0]}"`);
          return { price: validMatches[0].trim() };
        }
      }
    }

    // STRATEGY 3: Look for JSON-LD structured data
    console.log('STRATEGY 3: JSON-LD structured data search...');
    const jsonLdScripts = $('script[type="application/ld+json"]');

    jsonLdScripts.each((_, script) => {
      try {
        const jsonData = JSON.parse($(script).html() || '');
        const price = extractPriceFromJsonLd(jsonData);
        if (price) {
          console.log(`✅ FOUND PRICE in JSON-LD: "${price}"`);
          foundPrice = price;
          return false; // Break the loop
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
    });

    if (foundPrice) return { price: foundPrice };

    // STRATEGY 4: Look for meta tags with price information
    console.log('STRATEGY 4: Meta tag search...');
    const metaTags = [
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="price"]',
      'meta[itemprop="price"]'
    ];

    for (const metaSelector of metaTags) {
      const metaElement = $(metaSelector);
      if (metaElement.length > 0) {
        const priceContent = metaElement.attr('content');
        if (priceContent && isValidPrice(priceContent)) {
          console.log(`✅ FOUND PRICE in meta tag: "${priceContent}"`);
          return { price: priceContent };
        }
      }
    }

    console.log(`❌ No price found for ${url} after trying all strategies`);
    return { price: null, error: 'No price found with any detection strategy' };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error scraping ${url}:`, errorMessage);
    return { price: null, error: errorMessage };
  }
}

// Helper function to validate if text contains a valid price
function isValidPrice(text: string): boolean {
  if (!text || text.length > 50) return false;

  // Check for currency symbols or price patterns
  const hasValidPattern = /[\$£€¥₹฿]|\d+[.,]\d+|\d+/.test(text) ||
    /baht|บาท|thb|pounds?|euros?|dollars?/i.test(text);

  if (!hasValidPattern) return false;

  // Extract numeric value for validation
  const numericValue = parseFloat(text.replace(/[^\d.,]/g, '').replace(',', '.'));

  // Must be a reasonable price range
  return numericValue >= 0.01 && numericValue <= 100000;
}

// Helper function to extract price from JSON-LD structured data
function extractPriceFromJsonLd(data: any): string | null {
  if (!data) return null;

  // Handle arrays
  if (Array.isArray(data)) {
    for (const item of data) {
      const price = extractPriceFromJsonLd(item);
      if (price) return price;
    }
    return null;
  }

  // Look for price in various JSON-LD structures
  if (data.offers) {
    const offers = Array.isArray(data.offers) ? data.offers : [data.offers];
    for (const offer of offers) {
      if (offer.price) return String(offer.price);
      if (offer.priceSpecification?.price) return String(offer.priceSpecification.price);
    }
  }

  if (data.price) return String(data.price);
  if (data.priceRange) return String(data.priceRange);

  return null;
}