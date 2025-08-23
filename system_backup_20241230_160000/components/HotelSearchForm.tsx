import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  Minus,
  Plus,
} from "lucide-react";
// Removed date-fns dependency - using native Date methods

interface GuestConfig {
  adults: number;
  children: number;
  rooms: number;
  childrenAges: number[];
}

interface HotelSearchFormProps {
  className?: string;
  variant?: "compact" | "full";
  onSearch?: (searchData: any) => void;
}

export function HotelSearchForm({
  className = "",
  variant = "full",
  onSearch,
}: HotelSearchFormProps) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [guests, setGuests] = useState<GuestConfig>({
    adults: 2,
    children: 0,
    rooms: 1,
    childrenAges: [],
  });

  // Popular destinations
  const popularDestinations = [
    "Dubai, United Arab Emirates",
    "New York, United States",
    "London, United Kingdom",
    "Paris, France",
    "Tokyo, Japan",
    "Mumbai, India",
    "Singapore",
    "Los Angeles, United States",
    "Bangkok, Thailand",
    "Istanbul, Turkey",
  ];

  const handleDestinationChange = (value: string) => {
    setDestination(value);
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
          childrenAges.push(5); // Default age
        } else if (newValue < prev.children) {
          // Remove last child age
          childrenAges.pop();
        }
        return { ...prev, [type]: newValue, childrenAges };
      }

      return { ...prev, [type]: newValue };
    });
  };

  const updateChildAge = (index: number, age: number) => {
    setGuests((prev) => {
      const childrenAges = [...prev.childrenAges];
      childrenAges[index] = age;
      return { ...prev, childrenAges };
    });
  };

  const handleSearch = () => {
    if (!destination || !checkIn || !checkOut) {
      alert("Please fill in all required fields");
      return;
    }

    const searchData = {
      destination,
      checkIn: checkIn.toISOString().split("T")[0],
      checkOut: checkOut.toISOString().split("T")[0],
      adults: guests.adults.toString(),
      children: guests.children.toString(),
      rooms: guests.rooms.toString(),
      childrenAges: guests.childrenAges.join(","),
    };

    if (onSearch) {
      onSearch(searchData);
    } else {
      const searchParams = new URLSearchParams(searchData);
      navigate(`/hotels/results?${searchParams.toString()}`);
    }
  };

  const getGuestSummary = () => {
    const parts = [];
    if (guests.adults > 0) {
      parts.push(
        `${guests.adults} ${guests.adults === 1 ? "adult" : "adults"}`,
      );
    }
    if (guests.children > 0) {
      parts.push(
        `${guests.children} ${guests.children === 1 ? "child" : "children"}`,
      );
    }
    parts.push(`${guests.rooms} ${guests.rooms === 1 ? "room" : "rooms"}`);
    return parts.join(", ");
  };

  if (variant === "compact") {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select value={destination} onValueChange={handleDestinationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Where are you going?" />
              </SelectTrigger>
              <SelectContent>
                {popularDestinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Popover
              open={showCheckInCalendar}
              onOpenChange={setShowCheckInCalendar}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkIn
                    ? checkIn.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Check-in"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={(date) => {
                    setCheckIn(date);
                    setShowCheckInCalendar(false);
                  }}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <Popover
              open={showCheckOutCalendar}
              onOpenChange={setShowCheckOutCalendar}
            >
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOut
                    ? checkOut.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "Check-out"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={(date) => {
                    setCheckOut(date);
                    setShowCheckOutCalendar(false);
                  }}
                  disabled={(date) => date < (checkIn || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleSearch} className="px-6">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Find Your Perfect Stay</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Destination */}
        <div className="md:col-span-2">
          <Label htmlFor="destination">Destination</Label>
          <Select value={destination} onValueChange={handleDestinationChange}>
            <SelectTrigger>
              <MapPin className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Where are you going?" />
            </SelectTrigger>
            <SelectContent>
              {popularDestinations.map((dest) => (
                <SelectItem key={dest} value={dest}>
                  {dest}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Check-in Date */}
        <div>
          <Label>Check-in</Label>
          <Popover
            open={showCheckInCalendar}
            onOpenChange={setShowCheckInCalendar}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkIn
                  ? checkIn.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={(date) => {
                  setCheckIn(date);
                  setShowCheckInCalendar(false);
                  // Auto-set checkout to next day if not set
                  if (!checkOut && date) {
                    setCheckOut(new Date(date.getTime() + 24 * 60 * 60 * 1000));
                  }
                }}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div>
          <Label>Check-out</Label>
          <Popover
            open={showCheckOutCalendar}
            onOpenChange={setShowCheckOutCalendar}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOut
                  ? checkOut.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(date) => {
                  setCheckOut(date);
                  setShowCheckOutCalendar(false);
                }}
                disabled={(date) => date < (checkIn || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Guests & Rooms */}
        <div>
          <Label>Guests & Rooms</Label>
          <Popover open={showGuestDropdown} onOpenChange={setShowGuestDropdown}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left"
              >
                <Users className="mr-2 h-4 w-4" />
                {getGuestSummary()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <div className="space-y-4">
                {/* Adults */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Adults</div>
                    <div className="text-sm text-gray-600">Ages 18+</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("adults", "decrement")}
                      disabled={guests.adults <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{guests.adults}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("adults", "increment")}
                      disabled={guests.adults >= 16}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Children</div>
                    <div className="text-sm text-gray-600">Ages 0-17</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("children", "decrement")}
                      disabled={guests.children <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{guests.children}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("children", "increment")}
                      disabled={guests.children >= 16}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Children Ages */}
                {guests.children > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Children's ages</div>
                    <div className="grid grid-cols-3 gap-2">
                      {guests.childrenAges.map((age, index) => (
                        <Select
                          key={index}
                          value={age.toString()}
                          onValueChange={(value) =>
                            updateChildAge(index, parseInt(value))
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 18 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i} {i === 1 ? "year" : "years"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Rooms</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("rooms", "decrement")}
                      disabled={guests.rooms <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center">{guests.rooms}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateGuestCount("rooms", "increment")}
                      disabled={guests.rooms >= 8}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setShowGuestDropdown(false)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button onClick={handleSearch} className="w-full h-10">
            <Search className="w-4 h-4 mr-2" />
            Search Hotels
          </Button>
        </div>
      </div>
    </div>
  );
}
