import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BookingCalendar } from "@/components/BookingCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import {
  MapPin,
  CalendarIcon,
  Users,
  Search,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GuestConfig {
  adults: number;
  children: number;
  childrenAges: number[];
  rooms: number;
}

export function BookingSearchForm() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("Dubai");
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guests, setGuests] = useState<GuestConfig>({
    adults: 2,
    children: 1,
    childrenAges: [10],
    rooms: 1,
  });
  const [isGuestPopoverOpen, setIsGuestPopoverOpen] = useState(false);
  const [lookingForEntireHome, setLookingForEntireHome] = useState(false);
  const [lookingForFlights, setLookingForFlights] = useState(false);
  const [travelingWithPets, setTravelingWithPets] = useState(false);

  const destinations = [
    { name: "Dubai", country: "United Arab Emirates", type: "city" },
    {
      name: "Downtown Dubai",
      country: "Dubai, United Arab Emirates",
      type: "district",
    },
    {
      name: "Dubai International Airport",
      country: "Dubai, United Arab Emirates",
      type: "airport",
    },
    {
      name: "Dubai Marina",
      country: "Dubai, United Arab Emirates",
      type: "district",
    },
    {
      name: "Bur Dubai",
      country: "Dubai, United Arab Emirates",
      type: "district",
    },
  ];

  const childAgeOptions = Array.from({ length: 18 }, (_, i) => i);

  const handleSearch = () => {
    if (!destination || !checkInDate || !checkOutDate) {
      return;
    }

    const searchParams = new URLSearchParams({
      destination,
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      adults: guests.adults.toString(),
      children: guests.children.toString(),
      rooms: guests.rooms.toString(),
    });

    navigate(`/hotels/results?${searchParams.toString()}`);
  };

  const updateGuestCount = (
    type: keyof Pick<GuestConfig, "adults" | "children" | "rooms">,
    operation: "increment" | "decrement",
  ) => {
    setGuests((prev) => {
      const newValue =
        operation === "increment" ? prev[type] + 1 : prev[type] - 1;

      // Validation rules
      if (type === "adults" && newValue < 1) return prev;
      if (type === "children" && newValue < 0) return prev;
      if (type === "rooms" && newValue < 1) return prev;
      if (type === "rooms" && newValue > 8) return prev;
      if ((type === "adults" || type === "children") && newValue > 16)
        return prev;

      // Handle children ages array
      if (type === "children") {
        const childrenAges = [...prev.childrenAges];
        if (newValue > prev.children) {
          // Add new child age
          childrenAges.push(10);
        } else if (newValue < prev.children) {
          // Remove last child age
          childrenAges.pop();
        }
        return {
          ...prev,
          [type]: newValue,
          childrenAges,
        };
      }

      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  const updateChildAge = (index: number, age: number) => {
    setGuests((prev) => ({
      ...prev,
      childrenAges: prev.childrenAges.map((existingAge, i) =>
        i === index ? age : existingAge,
      ),
    }));
  };

  const guestSummary = () => {
    const parts = [];
    parts.push(`${guests.adults} adult${guests.adults > 1 ? "s" : ""}`);
    if (guests.children > 0) {
      parts.push(`${guests.children} child${guests.children > 1 ? "ren" : ""}`);
    }
    parts.push(`${guests.rooms} room${guests.rooms > 1 ? "s" : ""}`);
    return parts.join(" • ");
  };

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-lg max-w-6xl mx-auto border border-gray-200">
      {/* Main Search Form */}
      <div className="flex flex-col lg:flex-row gap-2 mb-4">
        {/* Destination */}
        <div className="flex-1 lg:max-w-[320px] relative">
          <label className="text-xs font-medium text-gray-800 mb-1 block sm:hidden">
            Destination
          </label>
          <Popover open={isDestinationOpen} onOpenChange={setIsDestinationOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onClick={() => setIsDestinationOpen(true)}
                  className="pl-10 pr-8 h-10 sm:h-12 bg-white border-2 border-orange-400 focus:border-blue-500 rounded font-medium text-sm touch-manipulation"
                  placeholder="Where are you going?"
                />
                {destination && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDestination("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96 p-0" align="start">
              <div className="max-h-60 overflow-y-auto">
                {destinations.map((dest, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setDestination(dest.name);
                      setIsDestinationOpen(false);
                    }}
                  >
                    <MapPin className="w-4 h-4 mr-3 text-gray-500" />
                    <div>
                      <div className="font-medium">{dest.name}</div>
                      <div className="text-sm text-gray-600">
                        {dest.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-in Date */}
        <div className="flex-1 lg:max-w-[280px]">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-orange-400 hover:border-blue-500 rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  <span className="hidden md:inline">
                    {checkInDate && checkOutDate ? (
                      <>
                        {format(checkInDate, "d-MMM-yyyy")} to{" "}
                        {format(checkOutDate, "d-MMM-yyyy")}
                      </>
                    ) : (
                      "Check-in to Check-out"
                    )}
                  </span>
                  <span className="hidden sm:inline md:hidden">
                    {checkInDate && checkOutDate ? (
                      <>
                        {format(checkInDate, "d MMM")} -{" "}
                        {format(checkOutDate, "d MMM")}
                      </>
                    ) : (
                      "Select dates"
                    )}
                  </span>
                  <span className="sm:hidden text-xs">
                    {checkInDate && checkOutDate ? (
                      <>
                        {format(checkInDate, "d/M")}-
                        {format(checkOutDate, "d/M")}
                      </>
                    ) : (
                      "Dates"
                    )}
                  </span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex flex-col">
                <BookingCalendar
                  initialRange={{
                    startDate: checkInDate || new Date(),
                    endDate:
                      checkOutDate || addDays(checkInDate || new Date(), 3),
                  }}
                  onChange={(range) => {
                    console.log("Booking calendar range selected:", range);
                    setCheckInDate(range.startDate);
                    setCheckOutDate(range.endDate);
                  }}
                  onClose={() => setIsCalendarOpen(false)}
                  className="w-full"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Guests & Rooms */}
        <div className="flex-1 lg:max-w-[220px]">
          <label className="text-xs font-medium text-gray-800 mb-1 block sm:hidden">
            Guests & Rooms
          </label>
          <Popover
            open={isGuestPopoverOpen}
            onOpenChange={setIsGuestPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 sm:h-12 justify-start text-left font-medium bg-white border-2 border-orange-400 hover:border-blue-500 rounded text-xs sm:text-sm px-2 sm:px-3 touch-manipulation"
              >
                <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">
                  <span className="hidden md:inline">
                    {guests.adults} adults, {guests.children} children,{" "}
                    {guests.rooms} room{guests.rooms > 1 ? "s" : ""}
                  </span>
                  <span className="hidden sm:inline md:hidden">
                    {guests.adults + guests.children} guests, {guests.rooms}{" "}
                    room{guests.rooms > 1 ? "s" : ""}
                  </span>
                  <span className="sm:hidden">
                    {guests.adults + guests.children}G, {guests.rooms}R
                  </span>
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 sm:w-96" align="start">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adults</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("adults", "decrement")}
                      disabled={guests.adults <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {guests.adults}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("adults", "increment")}
                      disabled={guests.adults >= 16}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-gray-500">Ages 0-17</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("children", "decrement")}
                      disabled={guests.children <= 0}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {guests.children}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("children", "increment")}
                      disabled={guests.children >= 16}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Children Ages */}
                {guests.children > 0 && (
                  <div className="space-y-2">
                    {guests.childrenAges.map((age, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          Age of child {index + 1}
                        </span>
                        <Select
                          value={age.toString()}
                          onValueChange={(value) =>
                            updateChildAge(index, parseInt(value))
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {childAgeOptions.map((ageOption) => (
                              <SelectItem
                                key={ageOption}
                                value={ageOption.toString()}
                              >
                                {ageOption} years old
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rooms</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("rooms", "decrement")}
                      disabled={guests.rooms <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {guests.rooms}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => updateGuestCount("rooms", "increment")}
                      disabled={guests.rooms >= 8}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Traveling with pets */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm">Traveling with pets?</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelingWithPets}
                      onChange={(e) => setTravelingWithPets(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="text-xs text-gray-500">
                  Assistance animals aren't considered pets.
                </div>

                <Button
                  onClick={() => setIsGuestPopoverOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Button
            onClick={handleSearch}
            className="h-10 sm:h-12 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold rounded px-6 sm:px-8 touch-manipulation"
            disabled={!destination || !checkInDate || !checkOutDate}
          >
            <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Search</span>
          </Button>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center space-x-2 touch-manipulation">
          <Checkbox
            id="entire-home"
            checked={lookingForEntireHome}
            onCheckedChange={(checked) =>
              setLookingForEntireHome(checked === true)
            }
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <label htmlFor="entire-home" className="cursor-pointer select-none">
            I'm looking for an entire home or apartment
          </label>
        </div>
        <div className="flex items-center space-x-2 touch-manipulation">
          <Checkbox
            id="flights"
            checked={lookingForFlights}
            onCheckedChange={(checked) =>
              setLookingForFlights(checked === true)
            }
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <label htmlFor="flights" className="cursor-pointer select-none">
            I'm looking for flights
          </label>
        </div>
      </div>
    </div>
  );
}
