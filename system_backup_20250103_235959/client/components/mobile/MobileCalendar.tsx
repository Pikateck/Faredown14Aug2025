import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
} from "date-fns";

interface MobileCalendarProps {
  selectedDate?: Date;
  endDate?: Date;
  onDateSelect: (date: Date) => void;
  onEndDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  isRange?: boolean;
  className?: string;
}

const MobileCalendar: React.FC<MobileCalendarProps> = ({
  selectedDate,
  endDate,
  onDateSelect,
  onEndDateSelect,
  minDate = new Date(),
  maxDate,
  isRange = false,
  className = "",
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate months for horizontal scrolling (current + next 11 months)
  const generateMonths = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(addMonths(currentMonth, i));
    }
    return months;
  };

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    // Add empty cells for days before the first day of the month
    const startDay = start.getDay();
    const emptyDays = Array(startDay).fill(null);

    return [...emptyDays, ...days];
  };

  const isDateDisabled = (date: Date) => {
    if (isBefore(date, minDate)) return true;
    if (maxDate && isAfter(date, maxDate)) return true;
    return false;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return isSameDay(date, selectedDate);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isDateInRange = (date: Date) => {
    if (!isRange || !selectedDate || !endDate) return false;
    return (
      (isAfter(date, selectedDate) || isSameDay(date, selectedDate)) &&
      (isBefore(date, endDate) || isSameDay(date, endDate))
    );
  };

  const isRangeStart = (date: Date) => {
    return isRange && selectedDate && isSameDay(date, selectedDate);
  };

  const isRangeEnd = (date: Date) => {
    return isRange && endDate && isSameDay(date, endDate);
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!isRange) {
      onDateSelect(date);
      return;
    }

    // Range selection logic
    if (!selectedDate || (selectedDate && endDate)) {
      // Start new range
      onDateSelect(date);
      if (onEndDateSelect) onEndDateSelect(null);
    } else if (selectedDate && !endDate) {
      // Complete range
      if (isBefore(date, selectedDate)) {
        // Clicked date is before start, make it new start
        onDateSelect(date);
      } else {
        // Clicked date is after start, make it end
        if (onEndDateSelect) onEndDateSelect(date);
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) =>
      direction === "next" ? addMonths(prev, 1) : subMonths(prev, 1),
    );
  };

  const scrollToMonth = (month: Date) => {
    const monthIndex = Math.floor(
      (month.getTime() - currentMonth.getTime()) / (1000 * 60 * 60 * 24 * 30),
    );
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: monthIndex * 320, // Width of each month container
        behavior: "smooth",
      });
    }
  };

  // Touch handling for better mobile experience
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateMonth("next");
    } else if (isRightSwipe) {
      navigateMonth("prev");
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Calendar Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsMonthPickerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="font-medium">
              {format(currentMonth, "MMMM yyyy")}
            </span>
          </button>

          <button
            onClick={() => navigateMonth("next")}
            className="p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {isRange && (
          <div className="text-center text-sm opacity-90">
            {selectedDate && endDate
              ? `${format(selectedDate, "MMM d")} - ${format(endDate, "MMM d")}`
              : selectedDate
                ? `${format(selectedDate, "MMM d")} - Select end date`
                : "Select check-in date"}
          </div>
        )}
      </div>

      {/* Calendar Content */}
      <div className="p-4">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          className="grid grid-cols-7 gap-1"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {getDaysInMonth(currentMonth).map((date, index) => (
            <div key={index} className="aspect-square">
              {date ? (
                <button
                  onClick={() => handleDateClick(date)}
                  disabled={isDateDisabled(date)}
                  className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-all font-medium touch-manipulation relative ${
                    isDateDisabled(date)
                      ? "text-gray-300 cursor-not-allowed"
                      : isRangeStart(date) || isRangeEnd(date)
                        ? "bg-blue-600 text-white shadow-md"
                        : isDateInRange(date)
                          ? "bg-blue-100 text-blue-700"
                          : isDateSelected(date)
                            ? "bg-blue-600 text-white shadow-md"
                            : isToday(date)
                              ? "text-blue-600 font-bold bg-blue-50 border-2 border-blue-600 hover:bg-blue-100"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
                  }`}
                >
                  {date.getDate()}
                  {isToday(date) && !isDateSelected(date) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
        <button
          onClick={() => {
            const today = new Date();
            setCurrentMonth(today);
            onDateSelect(today);
          }}
          className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Today
        </button>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-gray-600">Selected</span>
          </div>
          {isRange && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 rounded-full" />
              <span className="text-gray-600">Range</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full" />
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Month Picker Modal */}
      {isMonthPickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Select Month</h3>
                <button
                  onClick={() => setIsMonthPickerOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {generateMonths().map((month, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentMonth(month);
                      setIsMonthPickerOpen(false);
                    }}
                    className={`p-3 text-sm rounded-lg transition-colors ${
                      format(month, "yyyy-MM") ===
                      format(currentMonth, "yyyy-MM")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {format(month, "MMM yyyy")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCalendar;
