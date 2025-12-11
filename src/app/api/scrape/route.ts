import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { appendFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Product = { name: string; url: string }

const PRICE_SELECTORS = [
  '.price',
  '.c-product-price',
  '.product-price',
  '.current-price',
  '.price-current',
  '[data-testid="price"]',
  '[data-test="price"]',
  '.price-value',
  '.price-now',
  '.c-price',
  '.pdp-price',
  '.offer-price',
  '.sale-price',
  '.regular-price',
  '.final-price',
  '.selling-price',
  '.list-price',
  '.price-large',
  '.price__large',
  '.price-wrapper',
  '.price-box',
  '[itemprop="price"]',
  '[data-price]',
  '[data-testid*="price"]',
  '#priceblock_ourprice',
  '#priceblock_dealprice',
  '.a-price .a-offscreen',
  '.a-price .a-price-whole',
  '.woocommerce-Price-amount',
  '.amount',
]

const PRICE_REGEX = [
  /[\$£€¥₹฿]\s*\d+(?:[.,]\d{2,3})?/g,
  /\d+(?:[.,]\d{2,3})?\s*[\$£€¥₹฿]/g,
  /\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b/g,
]

const LOG_PATHS = [
  'c:\\Users\\huzef\\OneDrive\\Desktop\\Full Stack\\Price\\.cursor\\debug.log',
  join(process.cwd(), 'debug.log'), // repo-local so we can read it in workspace
]

const appendLog = (payload: Record<string, unknown>) => {
  LOG_PATHS.forEach(path => {
    try {
      mkdirSync(dirname(path), { recursive: true })
      appendFileSync(path, JSON.stringify(payload) + '\n', { encoding: 'utf8' })
    } catch {
      // swallow logging errors
    }
  })
}

const extractPrice = (html: string): string | null => {
  const $ = cheerio.load(html)

  for (const selector of PRICE_SELECTORS) {
    const el = $(selector).first()
    if (el && el.text()) {
      const text = el.text().trim()
      if (text) return text
    }
  }

  const bodyText = $('body').text()
  for (const pattern of PRICE_REGEX) {
    const match = bodyText.match(pattern)
    if (match && match.length > 0) {
      return match[0]
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const { products } = (await request.json()) as { products: Product[] }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'products array is required' }, { status: 400 })
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3d20a0d2-d40c-4330-b22a-411e64753cac', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'debug-session',
        runId: 'pre-fix',
        hypothesisId: 'H5',
        location: 'api/scrape:POST',
        message: 'Received scrape request',
        data: { count: products.length },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    appendLog({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H5',
      location: 'api/scrape:POST',
      message: 'Received scrape request',
      data: { count: products.length },
      timestamp: Date.now(),
    })
    // #endregion

    const results: Array<Product & { price: string }> = []

    for (const product of products) {
      if (!product?.url) {
        results.push({ ...product, price: 'Invalid URL' })
        continue
      }

      try {
        const response = await fetch(product.url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
          },
        })

        if (!response.ok) {
          results.push({ ...product, price: `HTTP ${response.status}` })
          continue
        }

        const html = await response.text()
        const price = extractPrice(html) || 'Price not found'
        results.push({ ...product, price })

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3d20a0d2-d40c-4330-b22a-411e64753cac', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H6',
            location: 'api/scrape:loop',
            message: 'Scraped product',
            data: { productName: product.name, price },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        appendLog({
          sessionId: 'debug-session',
          runId: 'pre-fix',
          hypothesisId: 'H6',
          location: 'api/scrape:loop',
          message: 'Scraped product',
          data: { productName: product.name, price },
          timestamp: Date.now(),
        })
        // #endregion
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch'
        results.push({ ...product, price: message })
      }
    }

    // #region agent log
    appendLog({
      sessionId: 'debug-session',
      runId: 'pre-fix',
      hypothesisId: 'H7',
      location: 'api/scrape:POST:end',
      message: 'Completed scrape request',
      data: { requested: products.length, returned: results.length },
      timestamp: Date.now(),
    })
    // #endregion

    return NextResponse.json({ products: results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

