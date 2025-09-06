import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Debug endpoint for testing specific URLs (Vercel optimized)
export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json() as { url: string };

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`DEBUG: Testing URL: ${url}`);

        // Fetch the page
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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
            return NextResponse.json({
                error: `HTTP ${response.status}: ${response.statusText}`,
                status: response.status
            });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        console.log(`DEBUG: HTML length: ${html.length}`);

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

        const debugResults: Array<{
            selector: string;
            text?: string;
            content?: string;
            dataPrice?: string;
            value?: string;
            html?: string;
        }> = [];
        let foundPrice: string | null = null;

        for (const selector of priceSelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                console.log(`DEBUG: Found ${elements.length} elements for selector: ${selector}`);

                elements.each((i, el) => {
                    const element = $(el);
                    const text = element.text().trim();
                    const content = element.attr('content');
                    const dataPrice = element.attr('data-price');
                    const value = element.attr('value');

                    debugResults.push({
                        selector,
                        text: text.substring(0, 100), // Limit text length
                        content,
                        dataPrice,
                        value,
                        html: element.html()?.substring(0, 200) // Limit HTML length
                    });

                    if (!foundPrice && text && /[\$£€¥₹฿]|\d+[.,]\d+|\d+/.test(text)) {
                        foundPrice = text;
                    }
                });
            }
        }

        // Also try regex patterns on body text
        const bodyText = $('body').text();
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

        const regexMatches: Array<{
            pattern: string;
            matches: string[];
        }> = [];
        for (const pattern of pricePatterns) {
            const matches = bodyText.match(pattern);
            if (matches) {
                regexMatches.push({
                    pattern: pattern.toString(),
                    matches: matches.slice(0, 10) // Limit matches
                });
            }
        }

        return NextResponse.json({
            url,
            status: 'success',
            foundPrice,
            debugResults: debugResults.slice(0, 50), // Limit debug results
            regexMatches,
            htmlPreview: html.substring(0, 1000) // First 1000 chars of HTML
        });

    } catch (error) {
        console.error('DEBUG endpoint error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Unknown error',
            details: 'Debug endpoint failed'
        }, { status: 500 });
    }
}