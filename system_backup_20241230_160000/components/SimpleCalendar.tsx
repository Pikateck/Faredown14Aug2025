import React, { useState } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleCalendarProps {
  onDateSelect: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
}

export function SimpleCalendar({
  onDateSelect,
  onClose,
  initialCheckIn,
  initialCheckOut,
}: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn || null);
  const [checkOut, setCheckOut] = useState<Date | null>(
    initialCheckOut || null,
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 32));
  };

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -32));
  };

  const onDateClick = (day: Date) => {
    if (isBefore(day, new Date()) && !isSameDay(day, new Date())) {
      return; // Don't allow past dates
    }

    if (!checkIn || (checkIn && checkOut)) {
      // First click or reset
      setCheckIn(day);
      setCheckOut(null);
    } else if (checkIn && !checkOut) {
      // Second click
      if (isBefore(day, checkIn)) {
        // If selected date is before check-in, make it the new check-in
        setCheckIn(day);
        setCheckOut(null);
      } else {
        // Normal case: set as check-out
        setCheckOut(day);
      }
    }
  };

  const handleDone = () => {
    if (checkIn && checkOut) {
      onDateSelect(checkIn, checkOut);
      onClose();
    } else if (checkIn) {
      // If only check-in is selected, set check-out to the next day
      const nextDay = addDays(checkIn, 1);
      onDateSelect(checkIn, nextDay);
      onClose();
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <button
          onClick={prevMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-semibold text-center">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded touch-manipulation"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "E";
    const days = [];

    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2 sm:py-3"
          key={i}
        >
          {format(addDays(startDate, i), dateFormat)}
        </div>,
      );
    }

    return <div className="grid grid-cols-7 border-b">{days}</div>;
  };

  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isDayToday = isToday(day);
        const isPastDate =
          isBefore(day, new Date()) && !isSameDay(day, new Date());
        const isCheckInDate = checkIn && isSameDay(day, checkIn);
        const isCheckOutDate = checkOut && isSameDay(day, checkOut);
        const isInRange =
          checkIn && checkOut && day >= checkIn && day <= checkOut;

        days.push(
          <button
            className={`
              p-2 sm:p-3 text-center cursor-pointer h-10 sm:h-12 flex items-center justify-center text-sm sm:text-base
              transition-colors duration-150 touch-manipulation min-h-[40px] sm:min-h-[48px]
              ${!isCurrentMonth ? "text-gray-300" : ""}
              ${isPastDate ? "text-gray-300 cursor-not-allowed" : ""}
              ${isDayToday ? "font-bold text-blue-600 bg-blue-50" : ""}
              ${isCheckInDate || isCheckOutDate ? "bg-blue-600 text-white font-semibold shadow-md" : ""}
              ${isInRange && !isCheckInDate && !isCheckOutDate ? "bg-blue-100 text-blue-800" : ""}
              ${!isPastDate && isCurrentMonth && !isCheckInDate && !isCheckOutDate && !isDayToday ? "hover:bg-gray-100 active:bg-gray-200" : ""}
              disabled:cursor-not-allowed
            `}
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            disabled={isPastDate || !isCurrentMonth}
            type="button"
          >
            <span>{formattedDate}</span>
          </button>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      <div className="p-3 sm:p-4 border-t">
        <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
          {checkIn && (
            <div className="mb-1">
              <span className="font-medium">Check-in: </span>
              <span className="text-blue-600">
                {format(checkIn, "EEE, MMM d")}
              </span>
            </div>
          )}
          {checkOut && (
            <div className="mb-1">
              <span className="font-medium">Check-out: </span>
              <span className="text-blue-600">
                {format(checkOut, "EEE, MMM d")}
              </span>
            </div>
          )}
          {checkIn && checkOut && (
            <div className="text-blue-600 font-semibold">
              {Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) /
                  (1000 * 60 * 60 * 24),
              )}{" "}
              night(s)
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDone}
            disabled={!checkIn}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
