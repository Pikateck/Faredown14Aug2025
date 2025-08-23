import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plane,
  User,
  Menu,
  Bell,
  X,
  CreditCard,
  MapPin,
  Calendar,
  Gift,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
  showHeader = true,
  title,
  showBack = false,
  onBack,
}) => {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const bottomNavItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    {
      icon: Search,
      label: "Search",
      path: "/mobile-search",
      active:
        location.pathname.includes("search") ||
        location.pathname.includes("flights"),
    },
    {
      icon: Plane,
      label: "My Bookings",
      path: "/mobile-trips",
      active:
        location.pathname.includes("trip") ||
        location.pathname.includes("account"),
    },
    {
      icon: User,
      label: "Profile",
      path: "/mobile-profile",
      active: location.pathname.includes("profile"),
    },
  ];

  const menuItems = [
    { icon: MapPin, label: "Hotels", path: "/hotels" },
    { icon: Calendar, label: "Sightseeing", path: "/sightseeing" },
    { icon: Gift, label: "Deals", path: "/deals" },
    { icon: CreditCard, label: "Payment Methods", path: "/payment-methods" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      {showHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              {showBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
              <div>
                <h1 className="text-lg font-bold text-blue-600">faredown</h1>
                {title && (
                  <p className="text-sm text-gray-600 -mt-1">{title}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 bg-red-500 text-xs flex items-center justify-center">
                  2
                </Badge>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Special Offer Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2">
            <div className="flex items-center justify-center space-x-2">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">
                🔥 Bargain Mode Active - Save up to 40%!
              </span>
            </div>
          </div>
        </header>
      )}

      {/* Side Menu Overlay */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed top-0 right-0 w-80 h-full bg-white z-50 shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMenu(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <item.icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors",
                  item.active
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default MobileLayout;
