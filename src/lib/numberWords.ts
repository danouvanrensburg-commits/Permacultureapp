/**
 * Utility to convert numbers into natural language words.
 * E.g. 20 -> "twenty", 40 -> "forty", 100 -> "one hundred", 500 -> "five hundred"
 */
export const numberToWords = (num: number): string => {
  if (num === 0) return 'zero';
  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
    'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertGroup = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? '-' + a[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    const rem = num % 1000;
    return `${convertGroup(thousands)} thousand${rem > 0 ? ' ' + convertGroup(rem) : ''}`.trim();
  }

  return convertGroup(num);
};
