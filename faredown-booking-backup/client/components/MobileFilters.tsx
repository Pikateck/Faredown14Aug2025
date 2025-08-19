import React, { useState } from "react";
import { X, Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileFilters({ isOpen, onClose }: MobileFiltersProps) {
  const [selectedSort, setSelectedSort] = useState("price_asc");
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([
    "Emirates",
  ]);
  const [selectedStops, setSelectedStops] = useState<string[]>(["Direct"]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([
    "Afternoon",
  ]);

  if (!isOpen) return null;

  return (
    <div className="sm:hidden fixed inset-0 bg-white z-[60] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters & Sort</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4">
        {/* Sort Options */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Sort by
          </h3>
          <div className="space-y-1">
            {[
              {
                label: "Price (Low to High)",
                value: "price_asc",
              },
              {
                label: "Price (High to Low)",
                value: "price_desc",
              },
              {
                label: "Duration (Shortest)",
                value: "duration_asc",
              },
              {
                label: "Departure Time",
                value: "departure_asc",
              },
              { label: "Best Value", value: "best_value" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedSort(option.value)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border-2 touch-manipulation",
                  selectedSort === option.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium",
                    selectedSort === option.value
                      ? "text-blue-700"
                      : "text-gray-700",
                  )}
                >
                  {option.label}
                </span>
                {selectedSort === option.value && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Price Range
          </h3>
          <div className="px-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">₹15,000</span>
              <span className="text-sm text-gray-600">₹80,000+</span>
            </div>
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: "60%" }}
                ></div>
              </div>
              <div className="absolute left-0 top-0 w-4 h-4 bg-blue-600 rounded-full -mt-1 -ml-2"></div>
              <div className="absolute right-2/5 top-0 w-4 h-4 bg-blue-600 rounded-full -mt-1 -ml-2"></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-medium text-gray-900">₹32,000</span>
              <span className="text-sm font-medium text-gray-900">₹50,000</span>
            </div>
          </div>
        </div>

        {/* Airlines */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Airlines
          </h3>
          <div className="space-y-2">
            {[
              { name: "Emirates", count: 4 },
              { name: "IndiGo", count: 6 },
              { name: "Air India", count: 3 },
              { name: "Qatar Airways", count: 2 },
              { name: "Etihad", count: 1 },
            ].map((airline) => (
              <label
                key={airline.name}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedAirlines.includes(airline.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAirlines([
                          ...selectedAirlines,
                          airline.name,
                        ]);
                      } else {
                        setSelectedAirlines(
                          selectedAirlines.filter(
                            (name) => name !== airline.name,
                          ),
                        );
                      }
                    }}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{airline.name}</span>
                </div>
                <span className="text-xs text-gray-500">({airline.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stops */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Stops</h3>
          <div className="space-y-2">
            {[
              { label: "Direct", count: 8 },
              { label: "1 Stop", count: 12 },
              { label: "2+ Stops", count: 4 },
            ].map((stop) => (
              <label
                key={stop.label}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedStops.includes(stop.label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStops([...selectedStops, stop.label]);
                      } else {
                        setSelectedStops(
                          selectedStops.filter((label) => label !== stop.label),
                        );
                      }
                    }}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{stop.label}</span>
                </div>
                <span className="text-xs text-gray-500">({stop.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Departure Time */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-2">
            Departure Time
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Morning", time: "6AM - 12PM" },
              { label: "Afternoon", time: "12PM - 6PM" },
              { label: "Evening", time: "6PM - 12AM" },
              { label: "Night", time: "12AM - 6AM" },
            ].map((timeSlot) => (
              <label key={timeSlot.label} className="cursor-pointer">
                <div
                  className={cn(
                    "p-3 rounded-lg border-2 text-center touch-manipulation",
                    selectedTimeSlots.includes(timeSlot.label)
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTimeSlots.includes(timeSlot.label)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTimeSlots([
                          ...selectedTimeSlots,
                          timeSlot.label,
                        ]);
                      } else {
                        setSelectedTimeSlots(
                          selectedTimeSlots.filter(
                            (label) => label !== timeSlot.label,
                          ),
                        );
                      }
                    }}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      "text-sm font-medium",
                      selectedTimeSlots.includes(timeSlot.label)
                        ? "text-blue-700"
                        : "text-gray-700",
                    )}
                  >
                    {timeSlot.label}
                  </div>
                  <div
                    className={cn(
                      "text-xs",
                      selectedTimeSlots.includes(timeSlot.label)
                        ? "text-blue-600"
                        : "text-gray-500",
                    )}
                  >
                    {timeSlot.time}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="flex-1 py-3 touch-manipulation"
            onClick={() => {
              setSelectedSort("price_asc");
              setSelectedAirlines([]);
              setSelectedStops([]);
              setSelectedTimeSlots([]);
            }}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 touch-manipulation"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
