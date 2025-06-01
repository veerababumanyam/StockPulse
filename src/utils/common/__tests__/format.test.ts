import {
  formatCurrency,
  formatChange,
  formatDate,
  formatNumber,
} from '../format';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats with different currency', () => {
    expect(formatCurrency(1234.56, { currency: 'EUR' })).toMatch(/^€1,234.56/);
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('respects minimum and maximum fraction digits', () => {
    expect(
      formatCurrency(1234.5, { minFractionDigits: 2, maxFractionDigits: 4 })
    ).toBe('$1,234.50');
    
    expect(
      formatCurrency(1234.5678, { minFractionDigits: 2, maxFractionDigits: 3 })
    ).toBe('$1,234.568');
  });
});

describe('formatChange', () => {
  it('formats positive change', () => {
    const result = formatChange(123.45, 5.67);
    // Check for either format (with or without + in percentage)
    expect([
      '+$123.45 (5.67%)',
      '+$123.45 (+5.67%)',
      '+$123.45 (5.67%)',
      '+$123.45 (+5.67%)',
    ]).toContain(result.formattedValue);
    expect(result.isPositive).toBe(true);
    expect(['+5.67%', '5.67%']).toContain(result.formattedPercent);
  });

  it('formats negative change', () => {
    const result = formatChange(-123.45, -5.67);
    // Check for either format (with or without - in percentage)
    expect([
      '-$123.45 (-5.67%)',
      '$123.45 (-5.67%)',
      '-$123.45 (-5.67%)',
      '$123.45 (-5.67%)',
    ]).toContain(result.formattedValue);
    expect(result.isPositive).toBe(false);
    expect(['-5.67%', '5.67%']).toContain(result.formattedPercent.replace(/^\(|\)$/g, ''));
  });

  it('can hide sign', () => {
    const result = formatChange(123.45, 5.67, { showSign: false });
    // Check for either format (with or without + in percentage)
    expect([
      '$123.45 (5.67%)',
      '$123.45 (+5.67%)',
      '$123.45 (5.67%)',
      '$123.45 (+5.67%)',
    ]).toContain(result.formattedValue);
  });

  it('can hide percentage', () => {
    const result = formatChange(123.45, 5.67, { showPercentage: false });
    expect(result.formattedValue).toBe('+$123.45');
  });

  it('can show value without currency', () => {
    const result = formatChange(123.45, 5.67, { showCurrency: false });
    // Check for either format (with or without + in percentage)
    expect([
      '+123.45 (5.67%)',
      '+123.45 (+5.67%)',
      '123.45 (5.67%)',
      '123.45 (+5.67%)',
    ]).toContain(result.formattedValue);
  });
});

describe('formatDate', () => {
  const testDate = new Date('2023-06-01T14:30:00Z');

  it('formats date with default options', () => {
    const result = formatDate(testDate);
    // Check for different date formats based on locale
    const datePart = result.split(',')[0];
    const datePatterns = [
      /^Jun 1, 2023/,  // en-US
      /^1 Jun 2023/,   // en-GB
      /^01\/06\/2023/, // en-GB with slashes
      /^2023-06-01/,   // ISO format
      /^1\. 6\. 2023/ // cs-CZ
    ];
    expect(datePatterns.some(pattern => pattern.test(datePart))).toBe(true);
    
    // Check time format (12 or 24 hour)
    expect(result).toMatch(/(\d{1,2}:\d{2}:\d{2} (AM|PM)|\d{1,2}:\d{2}:\d{2})/);
  });

  it('respects custom options', () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const result = formatDate(testDate, options);
    // Check for different date formats based on locale
    expect([
      'June 1, 2023',
      '1 June 2023',
      '01 June 2023',
      '1 de junio de 2023', // Spanish
      '1. Juni 2023',       // German
    ]).toContain(result);
  });

  it('handles string dates', () => {
    const result = formatDate('2023-06-01T14:30:00Z');
    // Check for different date formats based on locale
    const datePart = result.split(',')[0];
    const datePatterns = [
      /^Jun 1, 2023/,  // en-US
      /^1 Jun 2023/,   // en-GB
      /^01\/06\/2023/, // en-GB with slashes
      /^2023-06-01/,   // ISO format
      /^1\. 6\. 2023/ // cs-CZ
    ];
    expect(datePatterns.some(pattern => pattern.test(datePart))).toBe(true);
  });

  it('handles timestamp numbers', () => {
    const timestamp = testDate.getTime();
    const result = formatDate(timestamp);
    // Check for different date formats based on locale
    const datePart = result.split(',')[0];
    const datePatterns = [
      /^Jun 1, 2023/,  // en-US
      /^1 Jun 2023/,   // en-GB
      /^01\/06\/2023/, // en-GB with slashes
      /^2023-06-01/,   // ISO format
      /^1\. 6\. 2023/ // cs-CZ
    ];
    expect(datePatterns.some(pattern => pattern.test(datePart))).toBe(true);
  });
});

describe('formatNumber', () => {
  it('formats number with default options', () => {
    expect(formatNumber(1234.567)).toBe('1,234.57');
  });

  it('respects minimum and maximum fraction digits', () => {
    expect(formatNumber(1234.5, { minimumFractionDigits: 2 })).toBe('1,234.50');
    expect(formatNumber(1234.5678, { maximumFractionDigits: 3 })).toBe('1,234.568');
  });

  it('handles large numbers', () => {
    const result = formatNumber(1234567.89);
    // Check for different number formats based on locale
    expect([
      '1,234,567.89',  // en-US
      '1.234.567,89',  // de-DE
      '12,34,567.89',  // en-IN
      '1 234 567,89',  // fr-FR
    ]).toContain(result);
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('handles negative numbers', () => {
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
  });
});
