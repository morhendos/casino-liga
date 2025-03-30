/**
 * Formatting utilities for the application
 */

type Currency = string;

// Currency formatting configuration
const CURRENCIES: Record<Currency, {
  locale: string;
  decimalPlaces: number;
  symbol: string;
}> = {
  'USD': { locale: 'en-US', decimalPlaces: 2, symbol: '$' },
  'EUR': { locale: 'de-DE', decimalPlaces: 2, symbol: '€' },
  'GBP': { locale: 'en-GB', decimalPlaces: 2, symbol: '£' },
  'JPY': { locale: 'ja-JP', decimalPlaces: 0, symbol: '¥' },
  'CAD': { locale: 'en-CA', decimalPlaces: 2, symbol: '$' },
  'AUD': { locale: 'en-AU', decimalPlaces: 2, symbol: '$' },
};

/**
 * Format a number as currency
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (USD, EUR, etc)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | null | undefined, currency: Currency | null | undefined): string {
  // Default to USD if no currency provided
  const currencyCode = currency || 'USD';
  const config = CURRENCIES[currencyCode] || CURRENCIES['USD'];
  
  // Default to 0 if no amount provided
  const value = typeof amount === 'number' ? amount : 0;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces
  }).format(value);
}

/**
 * Format a date string to a human readable format
 * 
 * @param dateStr - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateStr: string) {
  try {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}
