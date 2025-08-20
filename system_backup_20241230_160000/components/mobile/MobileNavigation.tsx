import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plane, Building2, Camera, Car, User } from "lucide-react";

export function MobileNavigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      path: "/?tab=flights",
      icon: Plane,
      label: "Flights",
    },
    {
      path: "/hotels",
      icon: Building2,
      label: "Hotels",
    },
    {
      path: "/?tab=sightseeing",
      icon: Camera,
      label: "Sightseeing",
    },
    {
      path: "/?tab=transfers",
      icon: Car,
      label: "Transfers",
    },
    {
      path: "/account",
      icon: User,
      label: "Account",
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 md:hidden shadow-lg">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center space-y-1 relative group"
            >
              <Icon
                className={`w-5 h-5 ${
                  active ? "text-[#003580]" : "text-gray-400"
                }`}
              />
              <span
                className={`text-xs ${
                  active ? "text-[#003580] font-medium" : "text-gray-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
