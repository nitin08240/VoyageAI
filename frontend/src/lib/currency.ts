/**
 * Currency formatting utilities for VoyageAI
 * Handles proper currency symbol display using Intl.NumberFormat
 */

const CURRENCY_MAP: Record<string, { locale: string; symbol: string }> = {
  INR: { locale: 'en-IN', symbol: '₹' },
  USD: { locale: 'en-US', symbol: '$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' },
  JPY: { locale: 'ja-JP', symbol: '¥' },
  AUD: { locale: 'en-AU', symbol: 'A$' },
  CAD: { locale: 'en-CA', symbol: 'C$' },
  THB: { locale: 'th-TH', symbol: '฿' },
  SGD: { locale: 'en-SG', symbol: 'S$' },
};

/**
 * Get the currency symbol for a given currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const upper = currencyCode?.toUpperCase() || 'USD';
  return CURRENCY_MAP[upper]?.symbol || upper;
}

/**
 * Format a number as a currency string using Intl.NumberFormat
 * Returns formatted string like "₹45,000" or "$2,500"
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  currencyCode: string = 'USD',
  options?: { compact?: boolean; showDecimals?: boolean }
): string {
  if (amount === undefined || amount === null || amount === '') return '';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0 : amount;
  const upper = currencyCode?.toUpperCase() || 'USD';
  const info = CURRENCY_MAP[upper];

  if (numericAmount === 0) return 'Free';

  try {
    const formatter = new Intl.NumberFormat(info?.locale || 'en-US', {
      style: 'currency',
      currency: upper,
      minimumFractionDigits: options?.showDecimals ? 2 : 0,
      maximumFractionDigits: options?.showDecimals ? 2 : 0,
      ...(options?.compact ? { notation: 'compact', compactDisplay: 'short' } : {}),
    });
    return formatter.format(numericAmount);
  } catch {
    const symbol = info?.symbol || upper;
    return `${symbol}${numericAmount.toLocaleString()}`;
  }
}

/**
 * Format a price range string with correct currency symbol
 * Sanitizes symbolic dollar tiers ($, $$, $$$$) into real currency formatted ranges
 */
export function formatPriceRange(priceRange: string | undefined, currencyCode: string): string {
  if (!priceRange) return '';
  const symbol = getCurrencySymbol(currencyCode);
  const trimmed = priceRange.trim();

  // If priceRange is just symbolic tiers like "$", "$$", "$$$", "$$$$"
  if (/^[\$\s\-\/tier]+$/i.test(trimmed) || trimmed === '$$' || trimmed === '$$$' || trimmed === '$$$$') {
    if (currencyCode?.toUpperCase() === 'INR') {
      return `${symbol}3,500 - ${symbol}6,500 / night`;
    }
    return `${symbol}120 - ${symbol}220 / night`;
  }

  // Replace any stray $ with the actual user currency symbol
  return priceRange.replace(/\$/g, symbol);
}

