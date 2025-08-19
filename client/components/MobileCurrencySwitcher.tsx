import React, { useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
}

const currencies: Currency[] = [
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", rate: 1 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", rate: 0.012 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", rate: 0.011 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", rate: 0.0095 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", rate: 0.044 },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    flag: "🇸🇬",
    rate: 0.016,
  },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", rate: 1.8 },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    flag: "🇨🇦",
    rate: 0.016,
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    flag: "🇦🇺",
    rate: 0.018,
  },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", rate: 0.011 },
];

interface MobileCurrencySwitcherProps {
  className?: string;
  showInHeader?: boolean;
}

const MobileCurrencySwitcher: React.FC<MobileCurrencySwitcherProps> = ({
  className = "",
  showInHeader = false,
}) => {
  const { currency, setCurrency } = useCurrency();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const currentCurrency =
    currencies.find((c) => c.code === currency) || currencies[0];

  const filteredCurrencies = currencies.filter(
    (curr) =>
      curr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curr.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCurrencySelect = (currencyCode: string) => {
    setCurrency(currencyCode);
    setShowModal(false);
    setSearchTerm("");
  };

  const convertPrice = (
    amount: number,
    fromCurrency: string = "INR",
    toCurrency: string = currency,
  ): number => {
    const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
    return amount * (toRate / fromRate);
  };

  const formatPrice = (
    amount: number,
    currencyCode: string = currency,
  ): string => {
    const curr =
      currencies.find((c) => c.code === currencyCode) || currentCurrency;
    const convertedAmount = convertPrice(amount, "INR", currencyCode);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: currencyCode === "JPY" ? 0 : 2,
      maximumFractionDigits: currencyCode === "JPY" ? 0 : 2,
    }).format(convertedAmount);
  };

  if (showInHeader) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${className}`}
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {currentCurrency.flag} {currentCurrency.code}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>

        {showModal && (
          <CurrencyModal
            currencies={filteredCurrencies}
            currentCurrency={currentCurrency}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCurrencySelect={handleCurrencySelect}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
      >
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-800">Currency</div>
              <div className="text-sm text-gray-500">
                {currentCurrency.flag} {currentCurrency.name}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-800">
              {currentCurrency.code}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {showModal && (
        <CurrencyModal
          currencies={filteredCurrencies}
          currentCurrency={currentCurrency}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCurrencySelect={handleCurrencySelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

interface CurrencyModalProps {
  currencies: Currency[];
  currentCurrency: Currency;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCurrencySelect: (code: string) => void;
  onClose: () => void;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  currencies,
  currentCurrency,
  searchTerm,
  onSearchChange,
  onCurrencySelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Select Currency
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-xl">��</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search currencies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Currency List */}
        <div className="flex-1 overflow-y-auto">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => onCurrencySelect(currency.code)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{currency.flag}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-800">
                    {currency.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {currency.code} • {currency.symbol}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {currentCurrency.code === currency.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {currencies.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No currencies found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { MobileCurrencySwitcher, type Currency };
export default MobileCurrencySwitcher;
