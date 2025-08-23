import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  ChevronDown,
  Shield,
  Lock,
  Users,
  Download,
  Trash2,
  Eye,
  Bell,
} from "lucide-react";

export default function PrivacySettings() {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold">
              faredown.com
            </Link>

            <div className="flex items-center space-x-2 md:space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-xs md:text-sm hover:text-blue-200">
                  <span>🌐</span>
                  <span className="hidden sm:inline">English (UK)</span>
                  <span className="sm:hidden">EN</span>
                  <ChevronDown className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>🇬🇧 English (UK)</DropdownMenuItem>
                  <DropdownMenuItem>🇺🇸 English (US)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-xs md:text-sm hover:text-blue-200">
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
                <DropdownMenuTrigger className="flex items-center space-x-2 bg-blue-600 rounded-full px-2 md:px-3 py-2 hover:bg-blue-800">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-black">Z</span>
                  </div>
                  <span className="text-sm hidden sm:inline">Zubin A</span>
                  <span className="text-xs text-yellow-300 hidden md:inline">
                    Loyalty Level 1
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <User className="w-4 h-4 mr-2" />
                      My account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account/trips">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Bookings & Trips
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Award className="w-4 h-4 mr-2" />
                      Loyalty program
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Rewards & Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Settings className="w-4 h-4 mr-2" />
                      Reviews
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account">
                      <Heart className="w-4 h-4 mr-2" />
                      Saved
                    </Link>
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
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center text-sm text-gray-600">
          <Link to="/account" className="hover:underline">
            My account
          </Link>
          <span className="mx-2">&gt;</span>
          <span>Privacy and data management</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
          {/* Sidebar */}
          <div className="space-y-2 lg:order-1 order-2">
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
              className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg"
            >
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span>Payment methods</span>
            </Link>
            <Link
              to="/account/privacy"
              className="flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg"
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Privacy and data management</span>
            </Link>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 lg:order-2 order-1">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Privacy and data management
                </h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">
                  Manage how your data is used and shared
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Privacy Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5" />
                    <span>Privacy controls</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Profile visibility</h4>
                      <p className="text-sm text-gray-600">
                        Allow others to see your public profile information
                      </p>
                    </div>
                    <Switch
                      checked={profileVisibility}
                      onCheckedChange={setProfileVisibility}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Analytics tracking</h4>
                      <p className="text-sm text-gray-600">
                        Help us improve our service by sharing usage data
                      </p>
                    </div>
                    <Switch
                      checked={analyticsTracking}
                      onCheckedChange={setAnalyticsTracking}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5" />
                    <span>Data management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Data collection</h4>
                      <p className="text-sm text-gray-600">
                        Allow collection of data to personalize your experience
                      </p>
                    </div>
                    <Switch
                      checked={dataCollection}
                      onCheckedChange={setDataCollection}
                    />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Download your data</h4>
                        <p className="text-sm text-gray-600">
                          Get a copy of all your data stored with us
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-red-700">
                          Delete your account
                        </h4>
                        <p className="text-sm text-gray-600">
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5" />
                    <span>Communication preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Marketing emails</h4>
                      <p className="text-sm text-gray-600">
                        Receive promotional offers and travel deals
                      </p>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Email preferences</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span>Booking confirmations</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span>Trip reminders</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded"
                        />
                        <span>Security notifications</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Special offers</span>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Usage Information */}
              <Card>
                <CardHeader>
                  <CardTitle>How we use your data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-gray-700">
                    <p>
                      We collect and use your personal data to provide you with
                      our travel booking services, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Processing your bookings and payments</li>
                      <li>Providing customer support</li>
                      <li>Sending booking confirmations and travel updates</li>
                      <li>Improving our services and user experience</li>
                      <li>Ensuring security and preventing fraud</li>
                    </ul>
                    <p>
                      You can learn more about our data practices in our{" "}
                      <Link to="#" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
            <Link to="#" className="hover:underline">
              Contact Customer Service
            </Link>
            <Link to="#" className="hover:underline">
              Privacy & cookies
            </Link>
            <Link to="#" className="hover:underline">
              Modern Slavery Statement
            </Link>
            <Link to="#" className="hover:underline">
              Human Rights Statement
            </Link>
            <Link to="#" className="hover:underline">
              Terms & conditions
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
