import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatDateToDDMMMYYYY,
  formatDateToDisplayString,
} from "@/lib/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  BookOpen,
  Award,
  CreditCard,
  Settings,
  Heart,
  LogOut,
  Shield,
  Users,
  Bell,
  Lock,
  X,
  Globe,
  ChevronDown,
} from "lucide-react";

export default function PaymentMethods() {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [cardholderName, setCardholderName] = useState("Test User");
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [expirationDate, setExpirationDate] = useState("12/30");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              faredown.com
            </Link>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>🌐</span>
                  <span>English (UK)</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>🇬🇧 English (UK)</DropdownMenuItem>
                  <DropdownMenuItem>🇺🇸 English (US)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm hover:text-blue-200">
                  <span>INR</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem>₹ INR - Indian Rupee</DropdownMenuItem>
                  <DropdownMenuItem>$ USD - US Dollar</DropdownMenuItem>
                  <DropdownMenuItem>€ EUR - Euro</DropdownMenuItem>
                  <DropdownMenuItem>£ GBP - British Pound</DropdownMenuItem>
                  <DropdownMenuItem>¥ JPY - Japanese Yen</DropdownMenuItem>
                  <DropdownMenuItem>C$ CAD - Canadian Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    A$ AUD - Australian Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>CHF - Swiss Franc</DropdownMenuItem>
                  <DropdownMenuItem>¥ CNY - Chinese Yuan</DropdownMenuItem>
                  <DropdownMenuItem>kr SEK - Swedish Krona</DropdownMenuItem>
                  <DropdownMenuItem>kr NOK - Norwegian Krone</DropdownMenuItem>
                  <DropdownMenuItem>kr DKK - Danish Krone</DropdownMenuItem>
                  <DropdownMenuItem>₩ KRW - South Korean Won</DropdownMenuItem>
                  <DropdownMenuItem>S$ SGD - Singapore Dollar</DropdownMenuItem>
                  <DropdownMenuItem>
                    HK$ HKD - Hong Kong Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    NZ$ NZD - New Zealand Dollar
                  </DropdownMenuItem>
                  <DropdownMenuItem>₽ RUB - Russian Ruble</DropdownMenuItem>
                  <DropdownMenuItem>
                    R ZAR - South African Rand
                  </DropdownMenuItem>
                  <DropdownMenuItem>₺ TRY - Turkish Lira</DropdownMenuItem>
                  <DropdownMenuItem>R$ BRL - Brazilian Real</DropdownMenuItem>
                  <DropdownMenuItem>Mex$ MXN - Mexican Peso</DropdownMenuItem>
                  <DropdownMenuItem>₪ ILS - Israeli Shekel</DropdownMenuItem>
                  <DropdownMenuItem>₦ NGN - Nigerian Naira</DropdownMenuItem>
                  <DropdownMenuItem>EGP - Egyptian Pound</DropdownMenuItem>
                  <DropdownMenuItem>₨ PKR - Pakistani Rupee</DropdownMenuItem>
                  <DropdownMenuItem>৳ BDT - Bangladeshi Taka</DropdownMenuItem>
                  <DropdownMenuItem>₨ LKR - Sri Lankan Rupee</DropdownMenuItem>
                  <DropdownMenuItem>
                    Rp IDR - Indonesian Rupiah
                  </DropdownMenuItem>
                  <DropdownMenuItem>₱ PHP - Philippine Peso</DropdownMenuItem>
                  <DropdownMenuItem>₫ VND - Vietnamese Dong</DropdownMenuItem>
                  <DropdownMenuItem>฿ THB - Thai Baht</DropdownMenuItem>
                  <DropdownMenuItem>
                    RM MYR - Malaysian Ringgit
                  </DropdownMenuItem>
                  <DropdownMenuItem>AED - UAE Dirham</DropdownMenuItem>
                  <DropdownMenuItem>SAR - Saudi Riyal</DropdownMenuItem>
                  <DropdownMenuItem>QAR - Qatari Riyal</DropdownMenuItem>
                  <DropdownMenuItem>KWD - Kuwaiti Dinar</DropdownMenuItem>
                  <DropdownMenuItem>BHD - Bahraini Dinar</DropdownMenuItem>
                  <DropdownMenuItem>OMR - Omani Rial</DropdownMenuItem>
                  <DropdownMenuItem>zł PLN - Polish Zloty</DropdownMenuItem>
                  <DropdownMenuItem>Kč CZK - Czech Koruna</DropdownMenuItem>
                  <DropdownMenuItem>Ft HUF - Hungarian Forint</DropdownMenuItem>
                  <DropdownMenuItem>RON - Romanian Leu</DropdownMenuItem>
                  <DropdownMenuItem>BGN - Bulgarian Lev</DropdownMenuItem>
                  <DropdownMenuItem>kn HRK - Croatian Kuna</DropdownMenuItem>
                  <DropdownMenuItem>₴ UAH - Ukrainian Hryvnia</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-sm">?</span>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-3 py-2 hover:bg-blue-800">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">Z</span>
                  </div>
                  <span className="text-sm">Zubin A</span>
                  <span className="text-xs text-yellow-300">
                    Loyalty Level 1
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    My account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Bookings & Trips
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Award className="w-4 h-4 mr-2" />
                    Loyalty program
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Rewards & Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Heart className="w-4 h-4 mr-2" />
                    Saved
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3 text-sm text-gray-600">
        <Link to="/account" className="hover:underline">
          My account
        </Link>
        <span className="mx-2">&gt;</span>
        <span>Payment methods</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            <Link
              to="/account/personal"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>Personal details</span>
            </Link>
            <Link
              to="/account/security"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Shield className="w-5 h-5 text-gray-600" />
              <span>Security settings</span>
            </Link>
            <Link
              to="/account/travelers"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span>Other travelers</span>
            </Link>
            <Link
              to="/account/preferences"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Customization preferences</span>
            </Link>
            <Link
              to="/account/payment"
              className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Payment methods</span>
            </Link>
            <Link
              to="/account/privacy"
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <Lock className="w-5 h-5 text-gray-600" />
              <span>Privacy and data management</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment methods
                </h1>
                <p className="text-gray-600">
                  Securely add or remove payment methods to make it easier when
                  you book.
                </p>
              </div>
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600"
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-8">
              {/* Payment Cards Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment cards
                </h3>

                {/* Card Icons */}
                <div className="flex space-x-2 mb-6">
                  <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                  <div className="w-10 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    AE
                  </div>
                  <div className="w-10 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    DS
                  </div>
                  <div className="w-10 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    JCB
                  </div>
                  <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    UP
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Cardholder's name *
                    </label>
                    <Input
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Card number *
                    </label>
                    <div className="relative">
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder=""
                        className="pl-10"
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Expiration date *
                    </label>
                    <Input
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      placeholder="MM/YY"
                      className="max-w-24"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700 px-8">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Selection Modal */}
      <Dialog open={showCurrencyModal} onOpenChange={setShowCurrencyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Select your currency
            </DialogTitle>
            <button
              onClick={() => setShowCurrencyModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-6 py-4">
            {/* Currency Options */}
            {[
              { code: "INR", name: "Indian rupee", symbol: "₹" },
              { code: "USD", name: "U.S. dollar", symbol: "$" },
              { code: "EUR", name: "Euro", symbol: "€" },
              { code: "GBP", name: "Pound sterling", symbol: "£" },
              { code: "AUD", name: "Australian dollar", symbol: "A$" },
              { code: "CAD", name: "Canadian dollar", symbol: "C$" },
              { code: "SGD", name: "Singapore dollar", symbol: "S$" },
              { code: "CHF", name: "Swiss franc", symbol: "CHF" },
              { code: "CNY", name: "Chinese yuan", symbol: "¥" },
              { code: "JPY", name: "Japanese yen", symbol: "¥" },
              { code: "KRW", name: "South Korean won", symbol: "₩" },
              { code: "THB", name: "Thai baht", symbol: "฿" },
            ].map((currency) => (
              <button
                key={currency.code}
                className="text-left p-3 hover:bg-gray-100 rounded"
                onClick={() => setShowCurrencyModal(false)}
              >
                <div className="font-medium">{currency.code}</div>
                <div className="text-sm text-gray-600">{currency.name}</div>
                <div className="text-sm text-gray-500">{currency.symbol}</div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Selection Modal */}
      <Dialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Select your language
            </DialogTitle>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4">
            {/* Language Options */}
            {[
              { code: "en", name: "English", flag: "🇬🇧" },
              { code: "es", name: "Español", flag: "🇪🇸" },
              { code: "fr", name: "Français", flag: "🇫🇷" },
              { code: "de", name: "Deutsch", flag: "🇩🇪" },
              { code: "it", name: "Italiano", flag: "🇮🇹" },
              { code: "pt", name: "Português", flag: "🇵🇹" },
              { code: "nl", name: "Nederlands", flag: "🇳🇱" },
              { code: "ru", name: "Русский", flag: "🇷🇺" },
              { code: "zh", name: "中文", flag: "🇨🇳" },
              { code: "ja", name: "日本語", flag: "🇯🇵" },
              { code: "ko", name: "한국어", flag: "🇰🇷" },
              { code: "th", name: "ไทย", flag: "🇹🇭" },
            ].map((language) => (
              <button
                key={language.code}
                className="text-left p-3 hover:bg-gray-100 rounded flex items-center space-x-3"
                onClick={() => setShowLanguageModal(false)}
              >
                <span className="text-xl">{language.flag}</span>
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="#" className="hover:underline">
              About Faredown.com
            </Link>
            <Link to="#" className="hover:underline">
              Terms & conditions
            </Link>
            <Link to="#" className="hover:underline">
              How We Work
            </Link>
            <Link to="#" className="hover:underline">
              Privacy & Cookie Statement
            </Link>
            <Link to="#" className="hover:underline">
              Help Center
            </Link>
          </div>
          <div className="text-center text-xs text-gray-500 mt-4">
            Copyright © 2024 Faredown.com™. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
