const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

const scales = [
  '',
  'Thousand',
  'Million',
  'Billion',
  'Trillion',
];

function convertHundreds(num: number): string {
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred';
    num %= 100;
    if (num > 0) result += ' ';
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    num %= 10;
    if (num > 0) result += ' ' + ones[num];
  } else if (num > 0) {
    result += ones[num];
  }
  
  return result;
}

export function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
  
  let result = '';
  let scaleIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const chunkWords = convertHundreds(chunk);
      if (scaleIndex > 0) {
        result = chunkWords + ' ' + scales[scaleIndex] + (result ? ' ' + result : '');
      } else {
        result = chunkWords;
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  return result.trim();
}

export function formatNumberWithCommas(num: number | string): string {
  const numStr = typeof num === 'string' ? num : num.toString();
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
