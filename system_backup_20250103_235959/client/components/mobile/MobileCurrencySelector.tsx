import React, { useState } from "react";
import { Globe, Check, ChevronDown, Search, X } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number;
  popular?: boolean;
}

const currencies: Currency[] = [
  {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    flag: "🇮🇳",
    rate: 1,
    popular: true,
  },
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    rate: 0.012,
    popular: true,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    rate: 0.011,
    popular: true,
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    rate: 0.0095,
    popular: true,
  },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", rate: 0.044 },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س", flag: "🇸🇦", rate: 0.045 },
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
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", rate: 0.43 },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    flag: "🇲🇾",
    rate: 0.055,
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    flag: "🇭🇰",
    rate: 0.094,
  },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", rate: 0.086 },
];

interface MobileCurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

const MobileCurrencySelector: React.FC<MobileCurrencySelectorProps> = ({
  className = "",
  compact = true,
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

  const popularCurrencies = currencies.filter((c) => c.popular);

  const handleCurrencySelect = (currencyCode: string) => {
    setCurrency(currencyCode);
    setShowModal(false);
    setSearchTerm("");
  };

  const formatPrice = (
    amount: number,
    fromCurrency: string = "INR",
    toCurrency: string = currency,
  ): string => {
    const fromRate = currencies.find((c) => c.code === fromCurrency)?.rate || 1;
    const toRate = currencies.find((c) => c.code === toCurrency)?.rate || 1;
    const convertedAmount = amount * (toRate / fromRate);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: toCurrency,
      minimumFractionDigits: toCurrency === "JPY" ? 0 : 2,
      maximumFractionDigits: toCurrency === "JPY" ? 0 : 2,
    }).format(convertedAmount);
  };

  if (compact) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors ${className}`}
        >
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {currentCurrency.code}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>

        {showModal && (
          <CurrencyModal
            currencies={filteredCurrencies}
            popularCurrencies={popularCurrencies}
            currentCurrency={currentCurrency}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCurrencySelect={handleCurrencySelect}
            onClose={() => setShowModal(false)}
            formatPrice={formatPrice}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-lg border border-gray-200 ${className}`}
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
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span className="text-lg">{currentCurrency.flag}</span>
                <span>{currentCurrency.name}</span>
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
          popularCurrencies={popularCurrencies}
          currentCurrency={currentCurrency}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCurrencySelect={handleCurrencySelect}
          onClose={() => setShowModal(false)}
          formatPrice={formatPrice}
        />
      )}
    </>
  );
};

interface CurrencyModalProps {
  currencies: Currency[];
  popularCurrencies: Currency[];
  currentCurrency: Currency;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCurrencySelect: (code: string) => void;
  onClose: () => void;
  formatPrice: (amount: number, from?: string, to?: string) => string;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  currencies,
  popularCurrencies,
  currentCurrency,
  searchTerm,
  onSearchChange,
  onCurrencySelect,
  onClose,
  formatPrice,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-xl max-h-[85vh] sm:max-h-[70vh] flex flex-col rounded-t-xl sm:rounded-t-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Select Currency</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              style={{ fontSize: "16px" }} // Prevent zoom on iOS
            />
          </div>
        </div>

        {/* Popular Currencies */}
        {!searchTerm && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-600 mb-3">
              Popular Currencies
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {popularCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => onCurrencySelect(currency.code)}
                  className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                    currentCurrency.code === currency.code
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{currency.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{currency.code}</div>
                    <div className="text-xs text-gray-500">
                      {currency.symbol}
                    </div>
                  </div>
                  {currentCurrency.code === currency.code && (
                    <Check className="w-4 h-4 text-blue-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Currency List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {currencies.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Globe className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No currencies found</p>
                <p className="text-sm">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-1">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => onCurrencySelect(currency.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      currentCurrency.code === currency.code
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{currency.flag}</span>
                      <div className="text-left">
                        <div
                          className={`font-medium ${
                            currentCurrency.code === currency.code
                              ? "text-blue-700"
                              : "text-gray-800"
                          }`}
                        >
                          {currency.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {currency.code} • {currency.symbol}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Sample conversion */}
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">
                          {formatPrice(1000, "INR", currency.code)}
                        </div>
                        <div className="text-xs text-gray-400">per ₹1,000</div>
                      </div>

                      {currentCurrency.code === currency.code && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600">Current Currency</div>
            <div className="font-semibold text-gray-800 flex items-center justify-center space-x-2">
              <span className="text-lg">{currentCurrency.flag}</span>
              <span>
                {currentCurrency.name} ({currentCurrency.code})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MobileCurrencySelector, type Currency };
export default MobileCurrencySelector;
