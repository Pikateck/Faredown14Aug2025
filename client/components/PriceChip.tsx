import React from 'react';

interface PriceChipProps {
  amount: number;
  variant?: 'emerald' | 'slate' | 'white';
  currency?: string;
}

export const PriceChip: React.FC<PriceChipProps> = ({ 
  amount, 
  variant = 'emerald',
  currency = '₹'
}) => {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-base ring-1 ring-inset";
  
  const variantClasses = {
    emerald: "bg-emerald-50 ring-emerald-200 text-emerald-700",
    slate: "bg-slate-50 ring-slate-200 text-slate-700"
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {currency}{amount.toLocaleString("en-IN")}
    </span>
  );
};

// Utility function to wrap price amounts in text with PriceChip
export const formatChatTextWithPrices = (text: string, variant: 'emerald' | 'slate' = 'emerald') => {
  // Regex to find ₹ followed by numbers (with optional commas)
  const priceRegex = /₹([\d,]+)/g;
  
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = priceRegex.exec(text)) !== null) {
    // Add text before the price
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    // Add the price chip
    const amount = parseInt(match[1].replace(/,/g, ''));
    parts.push(
      <PriceChip 
        key={key++} 
        amount={amount} 
        variant={variant}
      />
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 1 ? parts : text;
};

export default PriceChip;
