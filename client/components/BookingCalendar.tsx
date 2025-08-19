import React, { useState, useEffect } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";
import { format, addDays, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface BookingCalendarProps {
  onChange?: (range: { startDate: Date; endDate: Date }) => void;
  initialRange?: {
    startDate: Date;
    endDate: Date;
  };
  onClose?: () => void;
  className?: string;
  bookingType?: "hotel" | "flight" | "sightseeing" | "transfers";
}

export function BookingCalendar({
  onChange,
  initialRange,
  onClose,
  className,
  bookingType = "hotel",
}: BookingCalendarProps) {
  const [selection, setSelection] = useState(() => {
    // Use tomorrow as the default start date to prevent booking today/past dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = initialRange?.startDate || tomorrow;
    // For sightseeing and transfers, default to same day (single day activity)
    const defaultDays = (bookingType === "sightseeing" || bookingType === "transfers") ? 0 : 3;
    const endDate = initialRange?.endDate || addDays(startDate, defaultDays);

    console.log("Initial calendar range:", { startDate, endDate, bookingType });

    return [
      {
        startDate,
        endDate,
        key: "selection",
      },
    ];
  });

  // Get tomorrow's date for minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Force calendar styling after component mounts
  useEffect(() => {
    const applyCalendarStyling = () => {
      // Apply month header styling
      const monthHeaders = document.querySelectorAll('.rdrMonthAndYearPickers');
      monthHeaders.forEach(header => {
        (header as HTMLElement).style.color = '#1f2937';
        (header as HTMLElement).style.fontWeight = '900';
        (header as HTMLElement).style.fontSize = '20px';
      });

      // Apply weekday styling
      const weekdays = document.querySelectorAll('.rdrWeekDay');
      weekdays.forEach(weekday => {
        (weekday as HTMLElement).style.color = '#1f2937';
        (weekday as HTMLElement).style.fontWeight = '600';
        (weekday as HTMLElement).style.textTransform = 'capitalize';
      });
    };

    // Apply styling immediately and after any changes
    const timer = setTimeout(applyCalendarStyling, 100);
    const interval = setInterval(applyCalendarStyling, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [selection]);

  // Update selection when initialRange changes
  useEffect(() => {
    if (initialRange?.startDate) {
      const startDate = initialRange.startDate;
      const endDate = initialRange.endDate || addDays(startDate, 1);

      // Only update if the dates are actually different
      const currentStart = selection[0].startDate;
      const currentEnd = selection[0].endDate;

      if (
        !isSameDay(startDate, currentStart) ||
        !isSameDay(endDate, currentEnd)
      ) {
        setSelection([
          {
            startDate,
            endDate,
            key: "selection",
          },
        ]);
      }
    }
  }, [initialRange?.startDate?.getTime(), initialRange?.endDate?.getTime()]);

  const handleSelect = (ranges: RangeKeyDict) => {
    console.log("🗓�� Calendar selection changed:", ranges);
    console.log("🗓️ Current selection state:", selection);
    const range = ranges.selection;

    if (range && range.startDate) {
      let endDate = range.endDate;

      // For sightseeing and transfers, allow same-day selections (single day experience)
      // For hotels, ensure minimum 1 night stay
      if (!endDate) {
        // If no end date selected yet, use start date (user is still selecting)
        endDate = range.startDate;
      } else if (
        bookingType === "hotel" &&
        isSameDay(range.startDate, endDate)
      ) {
        // For hotels, ensure at least 1 night stay
        endDate = addDays(range.startDate, 1);
      }
      // For sightseeing and transfers, allow same day (single day experience)

      const newSelection = [
        {
          startDate: range.startDate,
          endDate: endDate,
          key: "selection",
        },
      ];

      console.log(
        "Setting new selection:",
        newSelection,
        "bookingType:",
        bookingType,
      );
      setSelection(newSelection);

      // Call onChange with proper date range
      if (onChange) {
        onChange({
          startDate: range.startDate,
          endDate: endDate,
        });
      }
    }
  };


  const formatSelectionText = () => {
    const { startDate, endDate } = selection[0];
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `${format(startDate, "EEE, MMM d")} - ${format(endDate, "EEE, MMM d")}`;
    }
    return format(startDate, "EEE, MMM d");
  };

  const getTotalNights = () => {
    const { startDate, endDate } = selection[0];
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  const getSelectedDateInfo = () => {
    const { startDate, endDate } = selection[0];

    if (!startDate) {
      return { checkIn: "", checkOut: "", nights: 0 };
    }

    const checkIn = format(startDate, "EEE, MMM d");
    const checkOut =
      endDate && !isSameDay(startDate, endDate)
        ? format(endDate, "EEE, MMM d")
        : "";

    const nights =
      endDate && !isSameDay(startDate, endDate)
        ? Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

    return { checkIn, checkOut, nights };
  };

  const dateInfo = getSelectedDateInfo();

  return (
    <div className={cn("booking-calendar", className)}>
      {/* Custom CSS for Booking.com-style classy calendar */}
      <style>{`
        .booking-calendar .rdrCalendarWrapper {
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid #e5e7eb;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow: visible;
          width: 100%;
          max-width: 700px;
        }

        .booking-calendar .rdrDateRangeWrapper {
          margin: 0;
        }

        .booking-calendar .rdrDefinedRangesWrapper {
          display: none;
        }

        .booking-calendar .rdrDateDisplayWrapper {
          display: none;
        }

        .booking-calendar .rdrMonthAndYearWrapper {
          padding: 16px 20px 12px;
          position: relative;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-bottom: 1px solid #e5e7eb;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .booking-calendar .rdrMonthAndYearPickers,
        .booking-calendar .rdrMonthAndYearPickers select,
        .booking-calendar .rdrMonthAndYearPickers option {
          font-weight: 900 !important;
          color: #1f2937 !important;
          font-size: 20px !important;
          pointer-events: none !important;
        }

        .booking-calendar .rdrMonthPicker,
        .booking-calendar .rdrYearPicker {
          display: none !important;
        }

        .booking-calendar .rdrNextPrevButton {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #475569;
          border-radius: 12px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
        }

        .booking-calendar .rdrNextPrevButton:hover {
          background: #003580;
          border-color: #003580;
          color: white;
          box-shadow: 0 6px 20px rgba(0, 53, 128, 0.3);
          transform: translateY(-1px);
        }

        .booking-calendar .rdrWeekDaysWrapper {
          padding: 12px 16px 8px;
          background: #f8fafc;
        }

        .booking-calendar .rdrWeekDay,
        .booking-calendar .rdrWeekDay span {
          color: #1f2937 !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          text-transform: capitalize !important;
          letter-spacing: 0.5px !important;
          padding: 8px 0 !important;
        }

        .booking-calendar .rdrDays {
          padding: 12px 16px 16px;
        }

        .booking-calendar .rdrDayNumber {
          font-weight: 500;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          transition: all 0.2s ease;
          margin: 2px;
        }

        .booking-calendar .rdrDayToday .rdrDayNumber {
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 700;
        }

        .booking-calendar .rdrDayHovered .rdrDayNumber {
          background: #e0e7ff;
          color: #3730a3;
        }

        .booking-calendar .rdrDaySelected .rdrDayNumber {
          background: #003580 !important;
          color: white !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0, 53, 128, 0.4);
        }

        .booking-calendar .rdrInRange .rdrDayNumber {
          background: #e0f2fe !important;
          color: #0284c7 !important;
        }

        .booking-calendar .rdrStartEdge .rdrDayNumber,
        .booking-calendar .rdrEndEdge .rdrDayNumber {
          background: #003580 !important;
          color: white !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0, 53, 128, 0.4);
        }

        .booking-calendar .rdrDayDisabled .rdrDayNumber {
          color: #cbd5e1;
          background: transparent;
        }

                .booking-calendar .rdrMonthWrapper {
          padding: 0 16px 16px;
        }

                .booking-calendar .rdrDayNumber {
          font-weight: 400;
          color: #374151;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

                .booking-calendar .rdrDay:hover .rdrDayNumber span {
          background: #e6f3ff;
          color: #0066cc;
          border-radius: 3px;
        }

                .booking-calendar .rdrDayToday .rdrDayNumber span {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 700;
          border: 2px solid #3b82f6;
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1);
        }

                .booking-calendar .rdrDayStartOfRange .rdrDayNumber span,
        .booking-calendar .rdrDayEndOfRange .rdrDayNumber span {
          background: #0066cc;
          color: white;
          font-weight: 600;
        }

                .booking-calendar .rdrDayInRange {
          background: #e6f3ff;
          color: #1f2937;
        }

        .booking-calendar .rdrDayInRange .rdrDayNumber span {
          background: transparent;
          color: #1f2937;
        }

        .booking-calendar .rdrDayDisabled {
          background-color: #f9fafb;
        }

        .booking-calendar .rdrDayDisabled .rdrDayNumber span {
          color: #d1d5db;
        }

                .booking-calendar .rdrWeekDay {
          font-weight: 600;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          padding: 8px 0;
          text-align: center;
        }

        .booking-calendar .rdrMonths {
          display: flex;
          flex-direction: row;
          gap: 0;
          width: 100%;
        }

                .booking-calendar .rdrMonth {
          flex: 1;
          min-width: 280px;
          padding: 0;
          margin: 0;
        }

                .booking-calendar .rdrDateRangeWrapper {
          width: 100%;
          background: white;
          margin: 0;
          padding: 0;
        }

        @media (max-width: 768px) {
          .booking-calendar {
            height: auto;
            max-height: none;
            overflow: visible;
          }

          .booking-calendar .rdrMonths {
            flex-direction: column;
            gap: 0;
          }

          .booking-calendar .rdrMonth {
            width: 100% !important;
            padding: 0 !important;
            min-width: auto !important;
          }

          .booking-calendar .rdrCalendarWrapper {
            width: 100% !important;
            border-radius: 8px;
            overflow: visible;
            height: auto;
            max-width: 100%;
          }

          .booking-calendar .rdrMonthAndYearWrapper {
            padding: 12px 16px 8px;
            min-height: 50px;
          }

          .booking-calendar .rdrMonthWrapper {
            padding: 0 8px 8px;
          }

          .booking-calendar .rdrNextPrevButton {
            width: 32px;
            height: 32px;
          }

          .booking-calendar .rdrDayNumber {
            width: 32px;
            height: 32px;
            font-size: 13px;
            margin: 1px;
          }

          .booking-calendar .rdrDays {
            padding: 8px;
          }

          .booking-calendar .rdrWeekDaysWrapper {
            padding: 8px;
          }
        }

        /* Global overrides for react-date-range components */
        .rdrMonthAndYearPickers,
        .rdrMonthAndYearPickers select,
        .rdrMonthAndYearPickers option {
          font-weight: 900 !important;
          color: #1f2937 !important;
          font-size: 20px !important;
        }

        .rdrWeekDay,
        .rdrWeekDay span {
          color: #1f2937 !important;
          font-weight: 600 !important;
          text-transform: capitalize !important;
        }

        /* Specific fixes for flight calendar border issues */
        .rdrCalendarWrapper {
          border: 1px solid #e5e7eb !important;
          border-radius: 16px !important;
          overflow: hidden !important;
        }

        .rdrDateRangeWrapper {
          border: none !important;
        }
      `}</style>

      <div className="w-full max-w-[700px] h-auto">
        {/* Calendar component */}
        <div
          className="w-full overflow-hidden"
          style={{ pointerEvents: "auto", position: "relative", zIndex: 1 }}
        >
          <DateRange
            ranges={selection}
            onChange={handleSelect}
            months={isMobile ? 1 : 2}
            direction={isMobile ? "vertical" : "horizontal"}
            rangeColors={["#0066cc"]}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            retainEndDateOnFirstSelection={false}
            showMonthAndYearPickers={false}
            showMonthArrow={true}
            staticRanges={[]}
            inputRanges={[]}
            preventSnapRefocus={true}
            calendarFocus="forwards"
            minDate={tomorrow}
            monthDisplayFormat="MMMM yyyy"
            weekdayDisplayFormat="eee"
          />
        </div>

        {/* Footer with action buttons */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const today = new Date();
              const defaultEnd = addDays(today, 1);
              setSelection([
                {
                  startDate: today,
                  endDate: defaultEnd,
                  key: "selection",
                },
              ]);
              onChange?.({
                startDate: today,
                endDate: defaultEnd,
              });
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() => {
              // Apply the selected dates before closing
              if (onChange && selection[0].startDate) {
                onChange({
                  startDate: selection[0].startDate,
                  endDate: selection[0].endDate,
                });
              }
              onClose?.();
            }}
            className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            disabled={!selection[0].startDate}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
