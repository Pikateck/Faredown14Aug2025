import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface MobileCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

const MobileCalendar: React.FC<MobileCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = "",
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isDateDisabled = (date: Date) => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) return true;
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;

    return false;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate === formatDate(date);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newMonth;
    });
  };

  const scrollToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (!isDateDisabled(date)) {
      onDateSelect(formatDate(date));
    }
  };

  const getNextMonths = (count: number) => {
    const months = [];
    for (let i = 0; i < count; i++) {
      const monthDate = new Date(currentMonth);
      monthDate.setMonth(currentMonth.getMonth() + i);
      months.push(monthDate);
    }
    return months;
  };

  // Touch handling for horizontal scroll
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      navigateMonth("next");
    } else if (isRightSwipe) {
      navigateMonth("prev");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={() => setShowMonthPicker(!showMonthPicker)}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
        </button>

        <button
          onClick={() => navigateMonth("next")}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Month Picker */}
      {showMonthPicker && (
        <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setMonth(index);
                  setCurrentMonth(newDate);
                  setShowMonthPicker(false);
                }}
                className={`p-2 text-sm rounded-lg hover:bg-gray-100 transition-colors ${
                  index === currentMonth.getMonth()
                    ? "bg-blue-100 text-blue-600 font-medium"
                    : "text-gray-700"
                }`}
              >
                {month.substr(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Horizontal Scrolling Calendar */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex" style={{ width: "max-content" }}>
          {getNextMonths(6).map((monthDate, monthIndex) => (
            <div
              key={monthIndex}
              className="flex-shrink-0 p-4"
              style={{ width: "300px" }}
            >
              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
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
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(monthDate).map((date, index) => (
                  <div key={index} className="aspect-square">
                    {date ? (
                      <button
                        onClick={() => handleDateClick(date)}
                        disabled={isDateDisabled(date)}
                        className={`w-full h-full flex items-center justify-center text-sm rounded-lg transition-all touch-manipulation ${
                          isDateSelected(date)
                            ? "bg-blue-600 text-white shadow-md"
                            : isDateDisabled(date)
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    ) : (
                      <div className="w-full h-full"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-100">
        <button
          onClick={scrollToToday}
          className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Today
        </button>

        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs text-gray-500">Selected</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <span className="text-xs text-gray-500">Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileCalendar;
