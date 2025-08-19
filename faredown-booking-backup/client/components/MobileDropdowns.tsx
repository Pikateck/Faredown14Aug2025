import React, { useState } from "react";
import {
  X,
  Search,
  Plane,
  CalendarIcon,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CityData {
  code: string;
  name: string;
  airport: string;
  fullName: string;
}

interface MobileCityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  cities: Record<string, CityData>;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export function MobileCityDropdown({
  isOpen,
  onClose,
  title,
  cities,
  selectedCity,
  onSelectCity,
}: MobileCityDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search airports, cities or countries"
              className="w-full pl-10 pr-4 py-4 text-base border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(cities).map(([city, data]) => (
            <button
              key={city}
              onClick={() => {
                onSelectCity(city);
                onClose();
              }}
              className={cn(
                "w-full text-left px-4 py-4 hover:bg-gray-50 rounded-lg border touch-manipulation",
                selectedCity === city
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100",
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plane className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-900">
                    {city} ({data.code})
                  </div>
                  <div className="text-sm text-gray-500">{data.airport}</div>
                  <div className="text-xs text-gray-400">{data.fullName}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface MobileDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  tripType: string;
  setTripType: (type: string) => void;
  selectedDepartureDate: Date | null;
  selectedReturnDate: Date | null;
  setSelectedDepartureDate: (date: Date | null) => void;
  setSelectedReturnDate: (date: Date | null) => void;
  selectingDeparture: boolean;
  setSelectingDeparture: (selecting: boolean) => void;
}

export function MobileDatePicker({
  isOpen,
  onClose,
  tripType,
  setTripType,
  selectedDepartureDate,
  selectedReturnDate,
  setSelectedDepartureDate,
  setSelectedReturnDate,
  selectingDeparture,
  setSelectingDeparture,
}: MobileDatePickerProps) {
  if (!isOpen) return null;

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Helper functions
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, "-");
  };

  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateInRange = (
    date: Date,
    startDate: Date | null,
    endDate: Date | null,
  ) => {
    if (!startDate || !endDate) return false;
    return date >= startDate && date <= endDate;
  };

  const isDateEqual = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateClick = (day: number, month: number, year: number) => {
    const clickedDate = new Date(year, month, day);

    if (tripType === "one-way") {
      setSelectedDepartureDate(clickedDate);
      onClose();
    } else {
      if (selectingDeparture) {
        setSelectedDepartureDate(clickedDate);
        setSelectedReturnDate(null);
        setSelectingDeparture(false);
      } else {
        if (clickedDate < selectedDepartureDate!) {
          setSelectedDepartureDate(clickedDate);
          setSelectedReturnDate(null);
          setSelectingDeparture(false);
        } else {
          setSelectedReturnDate(clickedDate);
          setSelectingDeparture(true);
          onClose();
        }
      }
    }
  };

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Select dates</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4">
        {/* Trip Type Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setTripType("round-trip")}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium touch-manipulation",
              tripType === "round-trip"
                ? "border-gray-900 bg-gray-100 text-gray-900"
                : "border-gray-300 text-gray-700",
            )}
          >
            Round trip
          </button>
          <button
            onClick={() => setTripType("one-way")}
            className={cn(
              "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium touch-manipulation",
              tripType === "one-way"
                ? "border-gray-900 bg-gray-100 text-gray-900"
                : "border-gray-300 text-gray-700",
            )}
          >
            One way
          </button>
        </div>

        {/* Current Selection Display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">Selected dates:</div>
          <div className="text-base font-medium text-gray-900">
            {tripType === "one-way"
              ? formatDate(selectedDepartureDate) || "Select departure date"
              : selectedDepartureDate
                ? `${formatDate(selectedDepartureDate)} ${selectedReturnDate ? `- ${formatDate(selectedReturnDate)}` : "- Select return"}`
                : "Select departure and return dates"}
          </div>
          {tripType === "round-trip" && (
            <div className="text-xs text-gray-600 mt-1">
              {selectingDeparture
                ? "Select departure date"
                : "Select return date"}
            </div>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {getMonthName(currentMonth)} {currentYear}
          </h3>
          <button
            onClick={() => navigateMonth("next")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-manipulation"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="text-center py-3 text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-6">
          {Array.from({ length: 42 }, (_, i) => {
            const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
            const daysInMonth = getDaysInMonth(currentMonth, currentYear);
            const day = i - firstDay + 1;
            const isValidDay = day >= 1 && day <= daysInMonth;
            const currentDate = isValidDay
              ? new Date(currentYear, currentMonth, day)
              : null;
            const isPastDate =
              currentDate &&
              currentDate < today &&
              !isDateEqual(currentDate, today);

            if (!isValidDay) {
              return <div key={i} className="h-12"></div>;
            }

            const isDeparture = isDateEqual(currentDate, selectedDepartureDate);
            const isReturn = isDateEqual(currentDate, selectedReturnDate);
            const isInRange =
              selectedDepartureDate &&
              selectedReturnDate &&
              currentDate &&
              isDateInRange(
                currentDate,
                selectedDepartureDate,
                selectedReturnDate,
              ) &&
              !isDeparture &&
              !isReturn;
            const isToday = isDateEqual(currentDate, today);

            return (
              <button
                key={i}
                disabled={isPastDate}
                onClick={() => handleDateClick(day, currentMonth, currentYear)}
                className={cn(
                  "h-12 w-full text-base font-medium flex items-center justify-center rounded-lg touch-manipulation transition-colors",
                  isPastDate && "text-gray-300 cursor-not-allowed",
                  isToday &&
                    !isDeparture &&
                    !isReturn &&
                    "bg-gray-100 font-bold",
                  isDeparture && "bg-gray-900 text-white",
                  isReturn && "bg-gray-900 text-white",
                  isInRange && "bg-gray-100 text-gray-700",
                  !isPastDate &&
                    !isDeparture &&
                    !isReturn &&
                    !isInRange &&
                    !isToday &&
                    "text-gray-900 hover:bg-gray-100",
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mb-6 flex items-center justify-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-900 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Range</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Today</span>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-semibold text-base touch-manipulation"
        >
          Done
        </Button>
      </div>
    </div>
  );
}

interface MobileTravelersProps {
  isOpen: boolean;
  onClose: () => void;
  travelers: { adults: number; children: number };
  setTravelers: React.Dispatch<
    React.SetStateAction<{ adults: number; children: number }>
  >;
}

export function MobileTravelers({
  isOpen,
  onClose,
  travelers,
  setTravelers,
}: MobileTravelersProps) {
  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Travelers</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-4 space-y-8">
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <div className="text-lg font-medium text-gray-900">Adults</div>
            <div className="text-sm text-gray-500">Age 18+</div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  adults: Math.max(1, prev.adults - 1),
                }))
              }
              disabled={travelers.adults <= 1}
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold text-xl touch-manipulation"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900 text-lg">
              {travelers.adults}
            </span>
            <button
              onClick={() =>
                setTravelers((prev) => ({ ...prev, adults: prev.adults + 1 }))
              }
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold text-xl touch-manipulation"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <div className="text-lg font-medium text-gray-900">Children</div>
            <div className="text-sm text-gray-500">Age 0-17</div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  children: Math.max(0, prev.children - 1),
                }))
              }
              disabled={travelers.children <= 0}
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-blue-600 font-bold text-xl touch-manipulation"
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900 text-lg">
              {travelers.children}
            </span>
            <button
              onClick={() =>
                setTravelers((prev) => ({
                  ...prev,
                  children: prev.children + 1,
                }))
              }
              className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center hover:bg-blue-50 text-blue-600 font-bold text-xl touch-manipulation"
            >
              +
            </button>
          </div>
        </div>
        <div className="pt-4">
          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-lg font-semibold text-base touch-manipulation"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
