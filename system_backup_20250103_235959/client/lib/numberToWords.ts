// Function to convert numbers to words
const ones = [
  "",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const tens = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const scales = ["", "thousand", "million", "billion", "trillion"];

function convertHundreds(num: number): string {
  let result = "";

  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + " hundred ";
    num %= 100;
  }

  if (num >= 20) {
    result += tens[Math.floor(num / 10)];
    if (num % 10 !== 0) {
      result += "-" + ones[num % 10];
    }
  } else if (num > 0) {
    result += ones[num];
  }

  return result.trim();
}

export function numberToWords(num: number): string {
  if (num === 0) return "zero";
  if (num < 0) return "negative " + numberToWords(-num);

  let result = "";
  let scaleIndex = 0;

  while (num > 0) {
    if (num % 1000 !== 0) {
      const chunk = convertHundreds(num % 1000);
      result =
        chunk +
        (scales[scaleIndex] ? " " + scales[scaleIndex] : "") +
        (result ? " " + result : "");
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return result.trim();
}

// Format amount in Indian numbering system (lakhs, crores)
export function formatPriceInWords(amount: number): string {
  if (amount === 0) return "zero rupees";

  let result = "";

  // Handle crores (10,000,000)
  if (amount >= 10000000) {
    const crores = Math.floor(amount / 10000000);
    result += numberToWords(crores) + " crore";
    if (crores > 1) result += "s";
    amount %= 10000000;
    if (amount > 0) result += " ";
  }

  // Handle lakhs (100,000)
  if (amount >= 100000) {
    const lakhs = Math.floor(amount / 100000);
    result += numberToWords(lakhs) + " lakh";
    if (lakhs > 1) result += "s";
    amount %= 100000;
    if (amount > 0) result += " ";
  }

  // Handle thousands
  if (amount >= 1000) {
    const thousands = Math.floor(amount / 1000);
    result += numberToWords(thousands) + " thousand";
    amount %= 1000;
    if (amount > 0) result += " ";
  }

  // Handle remaining amount
  if (amount > 0) {
    result += numberToWords(amount);
  }

  return result.trim() + " rupees";
}

// Short format for display (e.g., "40 thousand", "2 lakh")
export function formatPriceInWordsShort(amount: number): string {
  if (amount === 0) return "zero";
  if (amount < 1000) return numberToWords(amount);

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    if (crores >= 1) {
      return crores % 1 === 0
        ? `${Math.floor(crores)} crore${Math.floor(crores) > 1 ? "s" : ""}`
        : `${Math.floor(crores)} crore${crores > 1 ? "s" : ""}`;
    }
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    if (lakhs >= 1) {
      return lakhs % 1 === 0
        ? `${Math.floor(lakhs)} lakh${Math.floor(lakhs) > 1 ? "s" : ""}`
        : `${Math.floor(lakhs)} lakh${lakhs > 1 ? "s" : ""}`;
    }
  }

  if (amount >= 1000) {
    const thousands = amount / 1000;
    if (thousands >= 1) {
      return thousands % 1 === 0
        ? `${Math.floor(thousands)} thousand`
        : `${Math.floor(thousands)} thousand`;
    }
  }

  return numberToWords(amount);
}

// Format with currency symbol and remove decimals
export function formatPriceWithoutDecimals(
  amount: number,
  symbol: string = "₹",
): string {
  const roundedAmount = Math.round(amount);
  return `${symbol}${roundedAmount.toLocaleString()}`;
}
