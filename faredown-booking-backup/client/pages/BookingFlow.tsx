import React, { useState, useEffect } from "react";
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  User,
  ChevronDown,
  X,
  ArrowLeft,
  Menu,
  BookOpen,
  Award,
  Heart,
  LogOut,
  Settings,
  CreditCard,
  Plus,
  Minus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return `₹ ${amount.toLocaleString("en-IN")}`;
};

// Seat Map Component
const SeatMap = ({ travellers, seatSelections, setSeatSelections }) => {
  // Use the shared seat selections from parent component
  const selectedSeats = seatSelections;
  const setSelectedSeats = setSeatSelections;
  const [selectedTraveller, setSelectedTraveller] = useState(null);
  const [expandedFlight, setExpandedFlight] = useState(null);
  const [currentFlight, setCurrentFlight] = useState("Mumbai-Dubai");

  // Generate seat layout for aircraft (Economy classes only)
  const generateSeatLayout = () => {
    const rows = [];
    const columns = ["A", "B", "C", "D", "E", "F"];

    // Economy Plus rows (18-25) - 3-3 configuration
    for (let row = 18; row <= 25; row++) {
      const economyPlusSeats = [];
      columns.forEach((col) => {
        const seatId = `${row}${col}`;
        economyPlusSeats.push({
          id: seatId,
          row,
          column: col,
          type: "economy-plus",
          available: Math.random() > 0.2, // 80% available
          price: 1500, // Premium economy pricing
        });
      });
      rows.push({
        row,
        seats: economyPlusSeats,
        type: "economy-plus",
      });
    }

    // Standard Economy rows (26-45) - 3-3 configuration
    for (let row = 26; row <= 45; row++) {
      const economySeats = [];
      columns.forEach((col) => {
        const seatId = `${row}${col}`;
        economySeats.push({
          id: seatId,
          row,
          column: col,
          type: "economy",
          available: Math.random() > 0.2, // 80% available
          price: row >= 35 ? 500 : 1000, // Back rows cheaper
        });
      });
      rows.push({
        row,
        seats: economySeats,
        type: "economy",
      });
    }

    return rows;
  };

  const [seatLayout] = useState(generateSeatLayout());

  const handleSeatClick = (seat, flightLeg) => {
    if (!seat.available) return;

    // If no traveller is selected, automatically select the first one without a seat
    let travellerToAssign = selectedTraveller;
    if (!travellerToAssign) {
      const availableTraveller = travellers.find(
        (t) => !getTravellerSeat(t.id, flightLeg),
      );
      if (availableTraveller) {
        travellerToAssign = availableTraveller.id;
        setSelectedTraveller(travellerToAssign);
        setCurrentFlight(flightLeg);
      } else {
        // All travellers have seats, select the first one to reassign
        travellerToAssign = travellers[0].id;
        setSelectedTraveller(travellerToAssign);
        setCurrentFlight(flightLeg);
      }
    }

    if (!travellerToAssign) return;

    setSelectedSeats((prev) => {
      const newSelectedSeats = { ...prev };

      // Remove previous seat for this traveller on this flight leg
      Object.keys(newSelectedSeats[flightLeg]).forEach((seatId) => {
        if (newSelectedSeats[flightLeg][seatId] === travellerToAssign) {
          delete newSelectedSeats[flightLeg][seatId];
        }
      });

      // Add new seat for this flight leg
      newSelectedSeats[flightLeg][seat.id] = travellerToAssign;
      console.log(
        "Seat assigned:",
        seat.id,
        "to traveller:",
        travellerToAssign,
        "on flight:",
        flightLeg,
      );
      return newSelectedSeats;
    });
  };

  const getSeatStatus = (seat, flightLeg) => {
    if (!seat.available) return "unavailable";
    if (selectedSeats[flightLeg][seat.id]) return "selected";
    return "available";
  };

  const getSeatClass = (seat, flightLeg) => {
    const status = getSeatStatus(seat, flightLeg);
    const baseClass =
      "w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm rounded cursor-pointer transition-all duration-200 flex items-center justify-center font-medium touch-manipulation";

    switch (status) {
      case "unavailable":
        return `${baseClass} bg-gray-300 text-gray-500 cursor-not-allowed`;
      case "selected":
        return `${baseClass} bg-[#003580] text-white border-2 border-[#feba02]`;
      case "available":
        if (seat.type === "business") {
          return `${baseClass} bg-[#feba02] text-[#003580] border border-[#feba02] hover:bg-[#003580] hover:text-white`;
        } else if (seat.type === "economy-plus") {
          return `${baseClass} bg-[#009fe3] text-white border border-[#009fe3] hover:bg-[#003580]`;
        } else {
          return `${baseClass} bg-white border border-gray-300 text-gray-700 hover:bg-[#009fe3] hover:text-white`;
        }
      default:
        return baseClass;
    }
  };

  const getTravellerSeat = (travellerId, flightLeg) => {
    const seatId = Object.keys(selectedSeats[flightLeg]).find(
      (id) => selectedSeats[flightLeg][id] === travellerId,
    );
    return seatId || null;
  };

  const getTravellerSeatPrice = (travellerId, flightLeg) => {
    const seatId = getTravellerSeat(travellerId, flightLeg);
    if (!seatId) return 0;

    const seat = seatLayout
      .find((r) => r.seats.find((s) => s.id === seatId))
      ?.seats.find((s) => s.id === seatId);
    return seat?.price || 0;
  };

  const getFlightTotalPrice = (flightLeg) => {
    return Object.keys(selectedSeats[flightLeg]).reduce((total, seatId) => {
      const seat = seatLayout
        .find((r) => r.seats.find((s) => s.id === seatId))
        ?.seats.find((s) => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  };

  const renderFlightSegment = (flightLeg, flightTitle, isExpanded) => (
    <div className="border border-[#f2f6fa] rounded-lg">
      <div
        className={`p-4 cursor-pointer ${!isExpanded ? "border-b border-[#f2f6fa] bg-gray-50" : "border-b border-[#f2f6fa]"}`}
        onClick={() => {
          setExpandedFlight(isExpanded ? null : flightLeg);
          setCurrentFlight(flightLeg);
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {flightTitle}
            </h3>
            <p className="text-sm text-[#666]">
              3h 15m • Emirates Airlines • Economy
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#666] transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>

        {/* Show seat selection summary for this flight */}
        <div className="mb-3">
          <p className="text-xs text-[#666] mb-2">
            Click on passenger name to select them, then choose a seat from the
            map below
          </p>
        </div>
        <div className="space-y-2">
          {travellers.map((traveller) => (
            <div
              key={traveller.id}
              className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${
                selectedTraveller === traveller.id &&
                currentFlight === flightLeg
                  ? "bg-[#003580]/10 border border-[#003580]"
                  : "hover:bg-gray-50"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTraveller(traveller.id);
                  setExpandedFlight(flightLeg);
                  setCurrentFlight(flightLeg);
                }}
                className={`text-sm font-medium text-left flex-1 ${
                  selectedTraveller === traveller.id &&
                  currentFlight === flightLeg
                    ? "text-[#003580] font-semibold"
                    : "text-gray-900 hover:text-[#003580]"
                }`}
              >
                {traveller.firstName} {traveller.lastName} (
                {traveller.type.toLowerCase()})
              </button>
              <div className="flex items-center space-x-4">
                {getTravellerSeat(traveller.id, flightLeg) ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {getTravellerSeat(traveller.id, flightLeg)}
                      </span>
                      <span className="text-sm font-medium text-[#003580]">
                        ₹{getTravellerSeatPrice(traveller.id, flightLeg)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const seatId = getTravellerSeat(
                          traveller.id,
                          flightLeg,
                        );
                        if (seatId) {
                          setSelectedSeats((prev) => {
                            const newSeats = { ...prev };
                            delete newSeats[flightLeg][seatId];
                            return newSeats;
                          });
                        }
                      }}
                      className="w-5 h-5 text-gray-400 hover:text-red-500 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-[#003580] font-medium">
                    Select seat
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Flight total */}
        {getFlightTotalPrice(flightLeg) > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Seat fees for this flight:</span>
              <span className="text-[#003580] font-semibold text-base">
                {formatCurrency(getFlightTotalPrice(flightLeg))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Seat Map - Only show for expanded flight */}
      {isExpanded && (
        <div className="p-2 md:p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filter Panel */}
            <div className="w-full lg:w-48">
              <h4 className="font-medium text-gray-900 mb-3">Seat Types</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Economy Plus</span>
                  </div>
                  <div className="w-3 h-3 bg-[#009fe3] rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span>Economy</span>
                  </div>
                  <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span>Unavailable</span>
                  </div>
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                </div>
              </div>

              {selectedTraveller && currentFlight === flightLeg && (
                <div className="mt-6 p-3 bg-[#f2f6fa] rounded-lg border border-[#003580]">
                  <p className="text-sm font-medium text-[#003580]">
                    Select seat for:
                  </p>
                  <p className="text-sm text-gray-900 font-semibold">
                    {
                      travellers.find((t) => t.id === selectedTraveller)
                        ?.firstName
                    }{" "}
                    {
                      travellers.find((t) => t.id === selectedTraveller)
                        ?.lastName
                    }
                  </p>
                  <p className="text-xs text-[#666] mt-1">
                    Click on any available seat to select
                  </p>
                </div>
              )}

              {/* Price Information */}
              <div className="mt-4 p-3 bg-white border rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">
                  Seat Prices
                </h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-[#009fe3] rounded mr-2"></div>
                      Economy Plus (Rows 18-25)
                    </span>
                    <span className="font-medium">₹1,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></div>
                      Economy (Rows 26-34)
                    </span>
                    <span className="font-medium">₹1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-white border border-gray-300 rounded mr-2"></div>
                      Economy (Rows 35+)
                    </span>
                    <span className="font-medium">₹500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seat Map Grid */}
            <div className="flex-1">
              <div className="bg-[#f2f6fa] rounded-lg p-2 md:p-4 max-h-96 overflow-auto">
                <div className="min-w-[400px] md:min-w-0">
                  {/* Aircraft Front Indicator */}
                  <div className="text-center mb-4">
                    <div className="w-16 h-8 mx-auto bg-gray-300 rounded-t-full flex items-center justify-center">
                      <span className="text-xs text-gray-600">✈️</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Front of Aircraft
                    </p>
                  </div>

                  {/* Economy Plus Section */}
                  <div className="mb-6">
                    <div className="text-center mb-2">
                      <span className="text-xs font-medium text-white bg-[#009fe3] px-2 py-1 rounded">
                        Economy Plus (₹1,500)
                      </span>
                    </div>

                    {/* Economy Plus Column Headers */}
                    <div className="grid grid-cols-8 gap-1 mb-2 text-center sticky top-0 bg-[#f2f6fa] py-1">
                      <div></div>
                      <div className="text-xs font-medium text-[#666]">A</div>
                      <div className="text-xs font-medium text-[#666]">B</div>
                      <div className="text-xs font-medium text-[#666]">C</div>
                      <div className="w-4"></div>
                      <div className="text-xs font-medium text-[#666]">D</div>
                      <div className="text-xs font-medium text-[#666]">E</div>
                      <div className="text-xs font-medium text-[#666]">F</div>
                    </div>

                    {/* Economy Plus Rows */}
                    {seatLayout
                      .filter((r) => r.type === "economy-plus")
                      .map(({ row, seats }) => (
                        <div
                          key={`economy-plus-${row}`}
                          className="grid grid-cols-8 gap-1 mb-1"
                        >
                          <div className="text-xs font-medium text-[#666] py-1 text-center">
                            {row}
                          </div>
                          {["A", "B", "C", "D", "E", "F"].map((col) => {
                            const seat = seats.find((s) => s.column === col);
                            return col === "C" ? (
                              <React.Fragment key={col}>
                                <button
                                  onClick={() =>
                                    handleSeatClick(seat, flightLeg)
                                  }
                                  className={getSeatClass(seat, flightLeg)}
                                  disabled={!seat.available}
                                  title={`Seat ${seat.id} - ₹${seat.price} ${seat.available ? "(Click to select)" : "(Unavailable)"}`}
                                >
                                  {selectedSeats[flightLeg][seat.id]
                                    ? "✓"
                                    : seat.available
                                      ? "₹"
                                      : "×"}
                                </button>
                                <div className="w-3"></div>
                              </React.Fragment>
                            ) : (
                              <button
                                key={col}
                                onClick={() => handleSeatClick(seat, flightLeg)}
                                className={getSeatClass(seat, flightLeg)}
                                disabled={!seat.available}
                                title={`Seat ${seat.id} - ₹${seat.price} ${seat.available ? "(Click to select)" : "(Unavailable)"}`}
                              >
                                {selectedSeats[flightLeg][seat.id]
                                  ? "✓"
                                  : seat.available
                                    ? "₹"
                                    : "×"}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                  </div>

                  {/* Standard Economy Section */}
                  <div>
                    <div className="text-center mb-2">
                      <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        Economy (₹500-1,000)
                      </span>
                    </div>

                    {/* Economy Column Headers */}
                    <div className="grid grid-cols-8 gap-1 mb-2 text-center sticky top-0 bg-[#f2f6fa] py-1">
                      <div></div>
                      <div className="text-xs font-medium text-[#666]">A</div>
                      <div className="text-xs font-medium text-[#666]">B</div>
                      <div className="text-xs font-medium text-[#666]">C</div>
                      <div className="w-4"></div>
                      <div className="text-xs font-medium text-[#666]">D</div>
                      <div className="text-xs font-medium text-[#666]">E</div>
                      <div className="text-xs font-medium text-[#666]">F</div>
                    </div>

                    {/* Economy Rows */}
                    {seatLayout
                      .filter((r) => r.type !== "business")
                      .map(({ row, seats, type }) => (
                        <div
                          key={`economy-${row}`}
                          className="grid grid-cols-8 gap-1 mb-1"
                        >
                          <div className="text-xs font-medium text-[#666] py-1 text-center">
                            {row}
                          </div>
                          {["A", "B", "C", "D", "E", "F"].map((col) => {
                            const seat = seats.find((s) => s.column === col);
                            return col === "C" ? (
                              <React.Fragment key={col}>
                                <button
                                  onClick={() =>
                                    handleSeatClick(seat, flightLeg)
                                  }
                                  className={getSeatClass(seat, flightLeg)}
                                  disabled={!seat.available}
                                  title={`Seat ${seat.id} - ₹${seat.price} ${seat.available ? "(Click to select)" : "(Unavailable)"}`}
                                >
                                  {selectedSeats[flightLeg][seat.id]
                                    ? "✓"
                                    : seat.available
                                      ? ""
                                      : "×"}
                                </button>
                                <div className="w-3"></div>
                              </React.Fragment>
                            ) : (
                              <button
                                key={col}
                                onClick={() => handleSeatClick(seat, flightLeg)}
                                className={getSeatClass(seat, flightLeg)}
                                disabled={!seat.available}
                                title={`Seat ${seat.id} - ₹${seat.price} ${seat.available ? "(Click to select)" : "(Unavailable)"}`}
                              >
                                {selectedSeats[flightLeg][seat.id]
                                  ? "✓"
                                  : seat.available
                                    ? ""
                                    : "×"}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-white border border-gray-300 rounded"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span>Unavailable</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#003580] rounded"></div>
                        <span>Selected</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-[#feba02] rounded"></div>
                        <span>Business Class</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm text-[#666]">{flightTitle}</span>
                  <div className="flex items-center space-x-3">
                    {selectedTraveller && currentFlight === flightLeg && (
                      <span className="text-sm text-[#666]">
                        Select a seat for{" "}
                        {
                          travellers.find((t) => t.id === selectedTraveller)
                            ?.firstName
                        }
                      </span>
                    )}
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTraveller(null);
                        setExpandedFlight(null);
                      }}
                      className="bg-[#003580] hover:bg-[#009fe3] text-white font-semibold"
                    >
                      Confirm Selection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Flight Segments */}
      <div className="space-y-4">
        {renderFlightSegment(
          "Mumbai-Dubai",
          "Mumbai → Dubai",
          expandedFlight === "Mumbai-Dubai",
        )}
        {renderFlightSegment(
          "Dubai-Mumbai",
          "Dubai → Mumbai",
          expandedFlight === "Dubai-Mumbai",
        )}
      </div>

      {/* Seat Selection Summary */}
      <div className="bg-white border border-[#f2f6fa] rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Seat Selection Summary
        </h4>

        {/* Mumbai-Dubai Summary */}
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Mumbai → Dubai
          </h5>
          <div className="space-y-2 text-sm">
            {travellers.map((traveller) => {
              const seatId = getTravellerSeat(traveller.id, "Mumbai-Dubai");
              const seatPrice = getTravellerSeatPrice(
                traveller.id,
                "Mumbai-Dubai",
              );

              return (
                <div
                  key={traveller.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {traveller.firstName} {traveller.lastName}
                  </span>
                  <div className="flex items-center space-x-2">
                    {seatId ? (
                      <>
                        <span className="font-medium">{seatId}</span>
                        {seatPrice > 0 && (
                          <span className="text-[#666]">+₹{seatPrice}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#666]">No seat selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {getFlightTotalPrice("Mumbai-Dubai") > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Mumbai-Dubai seat fees:</span>
                <span className="text-[#003580]">
                  {formatCurrency(getFlightTotalPrice("Mumbai-Dubai"))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dubai-Mumbai Summary */}
        <div>
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            Dubai → Mumbai
          </h5>
          <div className="space-y-2 text-sm">
            {travellers.map((traveller) => {
              const seatId = getTravellerSeat(traveller.id, "Dubai-Mumbai");
              const seatPrice = getTravellerSeatPrice(
                traveller.id,
                "Dubai-Mumbai",
              );

              return (
                <div
                  key={traveller.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {traveller.firstName} {traveller.lastName}
                  </span>
                  <div className="flex items-center space-x-2">
                    {seatId ? (
                      <>
                        <span className="font-medium">{seatId}</span>
                        {seatPrice > 0 && (
                          <span className="text-[#666]">+₹{seatPrice}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#666]">No seat selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {getFlightTotalPrice("Dubai-Mumbai") > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Dubai-Mumbai seat fees:</span>
                <span className="text-[#003580]">
                  {formatCurrency(getFlightTotalPrice("Dubai-Mumbai"))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Total Seat Fees */}
        <div className="mt-4 pt-3 border-t-2 border-[#003580]">
          <div className="bg-[#003580] text-white p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Seat Fees:</span>
              <span className="text-2xl font-bold">
                {formatCurrency(
                  getFlightTotalPrice("Mumbai-Dubai") +
                    getFlightTotalPrice("Dubai-Mumbai"),
                )}
              </span>
            </div>
            {getFlightTotalPrice("Mumbai-Dubai") +
              getFlightTotalPrice("Dubai-Mumbai") ===
              0 && (
              <p className="text-sm text-blue-100 mt-2">
                Select seats to see pricing
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function BookingFlow() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get passenger data and flight data from navigation state
  const passengersFromState = location.state?.passengers || {
    adults: 1,
    children: 0,
  };

  // Get flight booking data from navigation state
  const selectedFlight = location.state?.selectedFlight;
  const selectedFareType = location.state?.selectedFareType;
  const negotiatedPrice =
    location.state?.negotiatedPrice || selectedFareType?.price || 32168; // fallback price

  // If no flight data, redirect back to flight search
  useEffect(() => {
    if (!selectedFlight && !selectedFareType) {
      console.warn("No flight data found, redirecting to flight search");
      navigate("/flights");
    }
  }, [selectedFlight, selectedFareType, navigate]);

  // Function to generate initial travellers based on passenger count
  const generateInitialTravellers = () => {
    const travellers = [];
    let id = 1;

    // Add adults
    for (let i = 0; i < passengersFromState.adults; i++) {
      travellers.push({
        id: id++,
        type: "Adult",
        title: "Mr",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
      });
    }

    // Add children
    for (let i = 0; i < passengersFromState.children; i++) {
      travellers.push({
        id: id++,
        type: "Child",
        title: "Mr",
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        age: "",
      });
    }

    return travellers;
  };
  const [showTravellerDetails, setShowTravellerDetails] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedMealIds, setSelectedMealIds] = useState([]);
  const [selectedBaggage, setSelectedBaggage] = useState({
    outbound: { weight: "", quantity: 0 },
    return: { weight: "", quantity: 0 },
  });
  const [selectedBaggageProtection, setSelectedBaggageProtection] =
    useState("");
  const [selectedRefundProtection, setSelectedRefundProtection] =
    useState("no");
  const [selectedOtherOptions, setSelectedOtherOptions] = useState([]);

  // Seat selection state moved to main component for price integration
  const [seatSelections, setSeatSelections] = useState({
    "Mumbai-Dubai": {},
    "Dubai-Mumbai": {},
  });

  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState("Zubin Aibara");

  // Currency state
  const [selectedCurrency, setSelectedCurrency] = useState({
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
  });

  // Multiple travellers state - dynamic based on passenger selection
  const [travellers, setTravellers] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem("booking_travellers");
    if (saved) {
      try {
        const savedTravellers = JSON.parse(saved);
        // Check if saved travellers match current passenger count
        const totalSaved = savedTravellers.length;
        const totalRequired =
          passengersFromState.adults + passengersFromState.children;
        if (totalSaved === totalRequired) {
          return savedTravellers;
        }
      } catch (e) {
        console.error("Failed to parse saved travellers:", e);
      }
    }
    // Generate based on passenger selection
    return generateInitialTravellers();
  });

  const [selectedTraveller, setSelectedTraveller] = useState<number | null>(
    1, // Default to first traveller
  );

  const [contactDetails, setContactDetails] = useState({
    email: "",
    phone: "",
    countryCode: "",
  });

  // Payment details state
  const [paymentDetails, setPaymentDetails] = useState({
    method: "card",
    cardNumber: "4111 1111 1111 1111",
    expiryDate: "12/30",
    cvv: "123",
    cardholderName: "Test User",
    billingAddress: "123 Test Street, Test City",
    postalCode: "400001",
    country: "india",
    termsAccepted: false,
  });

  // Save travellers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("booking_travellers", JSON.stringify(travellers));
  }, [travellers]);

  // Utility functions for seat pricing
  const getTravellerSeat = (travellerId, flightLeg) => {
    const seatId = Object.keys(seatSelections[flightLeg] || {}).find(
      (id) => seatSelections[flightLeg][id] === travellerId,
    );
    return seatId || null;
  };

  const getTravellerSeatPrice = (travellerId, flightLeg) => {
    const seatId = getTravellerSeat(travellerId, flightLeg);
    if (!seatId) return 0;

    // Simple pricing based on seat row number
    const rowNum = parseInt(seatId.replace(/[A-F]/g, ""));
    if (rowNum >= 18 && rowNum <= 25) return 1500; // Economy Plus
    if (rowNum >= 26 && rowNum <= 34) return 1000; // Premium Economy
    return 500; // Standard Economy
  };

  const countries = [
    { name: "Guernsey", code: "+44", flag: "🇬🇬" },
    { name: "Guinea", code: "+224", flag: "🇬🇳" },
    { name: "Guinea-Bissau", code: "+245", flag: "🇬🇼" },
    { name: "Guyana", code: "+592", flag: "🇬🇾" },
    { name: "Haiti", code: "+509", flag: "🇭🇹" },
    { name: "Honduras", code: "+504", flag: "🇭🇳" },
    { name: "Hong Kong", code: "+852", flag: "🇭🇰" },
    { name: "Hungary", code: "+36", flag: "🇭🇺" },
    { name: "Iceland", code: "+354", flag: "🇮🇸" },
    { name: "India", code: "+91", flag: "🇮🇳" },
    { name: "Indonesia", code: "+62", flag: "🇮🇩" },
    { name: "Iran", code: "+98", flag: "🇮🇷" },
    { name: "Iraq", code: "+964", flag: "🇮🇶" },
    { name: "Ireland", code: "+353", flag: "🇮🇪" },
    { name: "Isle of Man", code: "+44", flag: "🇮🇲" },
    { name: "Israel", code: "+972", flag: "🇮🇱" },
    { name: "Italy", code: "+39", flag: "🇮🇹" },
    { name: "Ivory Coast", code: "+225", flag: "🇨🇮" },
    { name: "Jamaica", code: "+1", flag: "🇯🇲" },
    { name: "Japan", code: "+81", flag: "🇯🇵" },
  ];

  const [showAdultFare, setShowAdultFare] = useState(true);
  const [showChildFare, setShowChildFare] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Price calculation functions
  const calculateAdultPrice = () => {
    // If coming from bargain, negotiatedPrice is already all-inclusive
    // Split it to show base fare vs taxes for display purposes only
    const isBargainPrice = location.state?.negotiatedPrice;
    if (isBargainPrice) {
      return Math.round(negotiatedPrice * 0.85); // ~85% base fare, 15% taxes/fees
    }
    return negotiatedPrice; // Regular fare, taxes calculated separately
  };

  const calculateChildPrice = () => {
    return Math.round(calculateAdultPrice() * 0.75); // 75% of adult price for children
  };

  const calculateAdultTaxes = () => {
    const isBargainPrice = location.state?.negotiatedPrice;
    if (isBargainPrice) {
      return negotiatedPrice - calculateAdultPrice(); // Remaining amount as taxes/fees
    }
    return Math.round(calculateAdultPrice() * 0.18); // 18% taxes for regular bookings
  };

  const calculateChildTaxes = () => {
    const isBargainPrice = location.state?.negotiatedPrice;
    if (isBargainPrice) {
      return Math.round((negotiatedPrice - calculateAdultPrice()) * 0.75); // Proportional taxes for children
    }
    return Math.round(calculateChildPrice() * 0.15); // 15% taxes for children
  };

  const calculateAdultTotal = () => {
    const isBargainPrice = location.state?.negotiatedPrice;
    if (isBargainPrice) {
      return negotiatedPrice; // All-inclusive bargain price
    }
    return calculateAdultPrice() + calculateAdultTaxes();
  };

  const calculateChildTotal = () => {
    return calculateChildPrice() + calculateChildTaxes();
  };

  const calculateTotalAdultsPrice = () => {
    return calculateAdultTotal() * passengersFromState.adults;
  };

  const calculateTotalChildrenPrice = () => {
    return calculateChildTotal() * passengersFromState.children;
  };

  const calculateBaseFareTotal = () => {
    return calculateTotalAdultsPrice() + calculateTotalChildrenPrice();
  };
  const [countrySearch, setCountrySearch] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1 (Travelers)

  const steps = [
    {
      id: 1,
      label: "Travellers",
      icon: "1",
      active: currentStep === 1,
      completed: currentStep > 1,
    },
    {
      id: 2,
      label: "Extras",
      icon: "2",
      active: currentStep === 2,
      completed: currentStep > 2,
    },
    {
      id: 3,
      label: "Seats",
      icon: "3",
      active: currentStep === 3,
      completed: currentStep > 3,
    },
    {
      id: 4,
      label: "Payment",
      icon: "4",
      active: currentStep === 4,
      completed: false,
    },
  ];

  // Calculate extras total
  const calculateExtrasTotal = () => {
    let total = 0;

    // Meals
    const mealPrices = {
      "fruit-cake": 200,
      "vegan-special": 400,
      "east-choice": 400,
      "veg-biryani": 400,
      "paneer-tikka": 400,
      "chicken-curry": 500,
      "mutton-biryani": 600,
      "fish-curry": 550,
      "dal-chawal": 350,
      "sandwich-combo": 300,
    };
    selectedMealIds.forEach((id) => {
      total += mealPrices[id] || 0;
    });

    // Baggage
    const baggagePrices = {
      "5kg": 1500,
      "10kg": 2800,
      "15kg": 4200,
      "20kg": 5500,
      "25kg": 6800,
    };
    if (
      selectedBaggage.outbound.weight &&
      selectedBaggage.outbound.quantity > 0
    ) {
      total +=
        (baggagePrices[selectedBaggage.outbound.weight] || 0) *
        selectedBaggage.outbound.quantity;
    }
    if (selectedBaggage.return.weight && selectedBaggage.return.quantity > 0) {
      total +=
        (baggagePrices[selectedBaggage.return.weight] || 0) *
        selectedBaggage.return.quantity;
    }

    // Baggage protection
    if (selectedBaggageProtection === "bronze") total += 49;
    if (selectedBaggageProtection === "gold") total += 200;

    // Refund protection
    if (selectedRefundProtection === "yes") total += 27803;

    // Other options
    const optionPrices = {
      vpn: 14,
      tea: 4,
      weather: 3,
      alerts: 3,
      magazines: 7,
      esim: 5,
    };
    selectedOtherOptions.forEach((id) => {
      total += optionPrices[id] || 0;
    });

    return total;
  };

  const calculateMealsTotal = () => {
    const mealPrices = {
      "fruit-cake": 200,
      "vegan-special": 400,
      "east-choice": 400,
      "veg-biryani": 400,
      "paneer-tikka": 400,
      "chicken-curry": 500,
      "mutton-biryani": 600,
      "fish-curry": 550,
      "dal-chawal": 350,
      "sandwich-combo": 300,
    };
    return selectedMealIds.reduce(
      (total, id) => total + (mealPrices[id] || 0),
      0,
    );
  };

  const calculateBaggageTotal = () => {
    const baggagePrices = {
      "5kg": 1500,
      "10kg": 2800,
      "15kg": 4200,
      "20kg": 5500,
      "25kg": 6800,
    };
    let total = 0;
    if (
      selectedBaggage.outbound.weight &&
      selectedBaggage.outbound.quantity > 0
    ) {
      total +=
        (baggagePrices[selectedBaggage.outbound.weight] || 0) *
        selectedBaggage.outbound.quantity;
    }
    if (selectedBaggage.return.weight && selectedBaggage.return.quantity > 0) {
      total +=
        (baggagePrices[selectedBaggage.return.weight] || 0) *
        selectedBaggage.return.quantity;
    }
    return total;
  };

  // Calculate seat totals for each flight leg
  const calculateSeatTotal = (flightLeg) => {
    if (!seatSelections[flightLeg]) return 0;

    return Object.keys(seatSelections[flightLeg]).reduce((total, seatId) => {
      // Extract row number from seat ID (e.g., "18A" -> 18)
      const row = parseInt(seatId.replace(/[A-F]/g, ""));
      let price = 0;

      if (row >= 18 && row <= 25) {
        price = 1500; // Economy Plus
      } else if (row >= 26 && row <= 34) {
        price = 1000; // Economy Front
      } else if (row >= 35) {
        price = 500; // Economy Rear
      }

      return total + price;
    }, 0);
  };

  const getTotalSeatFees = () => {
    return (
      calculateSeatTotal("Mumbai-Dubai") + calculateSeatTotal("Dubai-Mumbai")
    );
  };

  const handleNextStep = () => {
    console.log("handleNextStep called, currentStep:", currentStep);
    if (currentStep < 4) {
      console.log("Moving to next step:", currentStep + 1);
      setCurrentStep(currentStep + 1);
      // Scroll to top of page when navigating between steps
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.log("Final step reached, processing payment and booking");
      handleCompleteBooking();
    }
  };

  const handleCompleteBooking = async () => {
    try {
      // Generate booking ID
      const bookingId = `FD${Date.now().toString().slice(-8)}`;

      // Prepare booking data
      const isBargainPrice = location.state?.negotiatedPrice;
      const originalPrice = selectedFareType?.price || 32168;

      // Prepare meals data
      const mealPrices = {
        "fruit-cake": 200,
        "vegan-special": 400,
        "east-choice": 400,
        "veg-biryani": 400,
        "paneer-tikka": 400,
        "chicken-curry": 500,
        "mutton-biryani": 600,
        "fish-curry": 550,
        "dal-chawal": 350,
        "sandwich-combo": 300,
      };

      const mealNames = {
        "fruit-cake": "Fresh Cake Slice + Beverage",
        "vegan-special": "Vegan Special + Beverage",
        "east-choice": "All Less Choice Of The Day (Veg) + Beverage",
        "veg-biryani": "Veg Biryani + Beverage",
        "paneer-tikka": "Paneer Tikka Sandwich + Beverage",
        "chicken-curry": "Chicken Curry + Rice + Beverage",
        "mutton-biryani": "Mutton Biryani + Beverage",
        "fish-curry": "Fish Curry + Rice + Beverage",
        "dal-chawal": "Dal Chawal + Beverage",
        "sandwich-combo": "Sandwich Combo + Beverage",
      };

      const selectedMealsData = selectedMealIds.map((id) => ({
        id,
        name: mealNames[id] || id,
        price: mealPrices[id] || 0,
      }));

      // Prepare baggage data
      const baggageData = [];
      if (selectedBaggage.outbound.weight) {
        const baggagePrices = {
          "5kg": 1500,
          "10kg": 2800,
          "15kg": 4200,
          "20kg": 5500,
          "25kg": 6800,
        };
        baggageData.push({
          type: "Extra Baggage",
          weight: selectedBaggage.outbound.weight,
          price: baggagePrices[selectedBaggage.outbound.weight] || 0,
          flight: "Outbound",
        });
      }
      if (selectedBaggage.return.weight) {
        const baggagePrices = {
          "5kg": 1500,
          "10kg": 2800,
          "15kg": 4200,
          "20kg": 5500,
          "25kg": 6800,
        };
        baggageData.push({
          type: "Extra Baggage",
          weight: selectedBaggage.return.weight,
          price: baggagePrices[selectedBaggage.return.weight] || 0,
          flight: "Return",
        });
      }

      const bookingData = {
        id: bookingId,
        bargained: !!isBargainPrice,
        originalPrice: isBargainPrice
          ? originalPrice * travellers.length
          : null,
        baseFareTotal: calculateBaseFareTotal(),
        extrasTotal: calculateExtrasTotal(),
        seatFeesTotal: getTotalSeatFees(),
        passengers: travellers.map((t) => ({
          firstName: t.firstName,
          lastName: t.lastName,
          type: t.type,
        })),
        flights: [
          {
            from: "Mumbai",
            to: "Dubai",
            date: "Aug 5, 2024",
            time: "14:35",
            duration: "3h 15m",
            airline: "Emirates",
            flightNumber: "EK 507",
          },
          {
            from: "Dubai",
            to: "Mumbai",
            date: "Aug 8, 2024",
            time: "08:45",
            duration: "3h 20m",
            airline: "Emirates",
            flightNumber: "EK 508",
          },
        ],
        seats: Object.entries(seatSelections).flatMap(([flight, seats]) =>
          Object.entries(seats).map(([seatId, travellerId]) => {
            const traveller = travellers.find((t) => t.id === travellerId);
            const seatPrice = getTravellerSeatPrice(travellerId, flight);
            return {
              passenger: `${traveller?.firstName} ${traveller?.lastName}`,
              seat: seatId,
              price: seatPrice,
              flight: flight,
            };
          }),
        ),
        meals: selectedMealsData,
        baggage: baggageData,
        total:
          calculateBaseFareTotal() +
          calculateExtrasTotal() +
          getTotalSeatFees(),
      };

      // Save booking data to localStorage for confirmation page
      localStorage.setItem("latestBooking", JSON.stringify(bookingData));
      localStorage.setItem("currentBookingType", "flight");

      // Simulate payment processing
      console.log("Processing payment...", paymentDetails);

      // Navigate to confirmation with flight type indicator
      navigate("/booking-confirmation?type=flight", { replace: true });
    } catch (error) {
      console.error("Booking failed:", error);
      // Handle error - could show error message
    }
  };

  const handleTravellerSubmit = () => {
    // The traveller data is already updated in real-time through the form controls
    console.log("Saving traveller data:", travellers);
    // Just close the modal
    setShowTravellerDetails(false);
    setSelectedTraveller(null);
  };

  return (
    <div className="min-h-screen bg-[#f2f6fa]">
      {/* Faredown Header */}
      <header className="bg-[#003580] text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg sm:text-xl font-bold tracking-tight">
                faredown.com
              </span>
            </Link>
            <div className="flex items-center space-x-2 md:space-x-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden text-white p-2"
              >
                <Menu className="w-6 h-6" />
              </button>

              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                <Link
                  to="/flights"
                  className="text-white hover:text-blue-100 cursor-pointer flex items-center font-semibold border-b-2 border-white py-4"
                >
                  <span>Flights</span>
                </Link>
                <Link
                  to="/hotels"
                  className="text-white hover:text-blue-100 cursor-pointer flex items-center py-4"
                >
                  <span>Hotels</span>
                </Link>
              </nav>

              {/* Language and Currency */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <button className="text-white hover:text-blue-100 cursor-pointer flex items-center space-x-1">
                  <span>🌐</span>
                  <span>English (UK)</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowCurrencyDropdown(!showCurrencyDropdown)
                    }
                    className="text-white hover:text-blue-100 cursor-pointer flex items-center space-x-1"
                  >
                    <span>
                      {selectedCurrency.symbol} {selectedCurrency.code}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showCurrencyDropdown && (
                    <div className="absolute top-8 right-0 bg-white border border-[#f2f6fa] rounded-lg shadow-lg p-2 z-50 w-48 max-h-60 overflow-y-auto">
                      {[
                        { code: "USD", symbol: "$", name: "US Dollar" },
                        { code: "EUR", symbol: "€", name: "Euro" },
                        { code: "GBP", symbol: "£", name: "British Pound" },
                        { code: "INR", symbol: "₹", name: "Indian Rupee" },
                        { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
                        { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
                        { code: "JPY", symbol: "¥", name: "Japanese Yen" },
                        { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
                        { code: "KRW", symbol: "₩", name: "South Korean Won" },
                        { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
                        {
                          code: "AUD",
                          symbol: "A$",
                          name: "Australian Dollar",
                        },
                        { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
                        { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
                        { code: "THB", symbol: "฿", name: "Thai Baht" },
                        {
                          code: "MYR",
                          symbol: "RM",
                          name: "Malaysian Ringgit",
                        },
                      ].map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[#f2f6fa] rounded text-sm text-gray-900 flex items-center justify-between"
                        >
                          <span>{currency.name}</span>
                          <span className="font-medium">
                            {currency.symbol} {currency.code}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {isLoggedIn ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 bg-[#003580] rounded-full px-2 md:px-3 py-2 hover:bg-[#009fe3]">
                      <div className="w-6 h-6 bg-[#feba02] rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {userName.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-white hidden sm:inline">
                        {userName}
                      </span>
                      <span className="text-xs text-[#feba02] hidden md:inline">
                        Loyalty Level 1
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Link to="/account" className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          My account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link to="/account/trips" className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Bookings & Trips
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Award className="w-4 h-4 mr-2" />
                        Rewards (Level 1)
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-2" />
                        Saved
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Payment methods
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Account settings
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setIsLoggedIn(false);
                          setUserName("");
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowRegister(true)}
                      className="text-white hover:text-blue-100 hover:bg-[#003580]"
                    >
                      Register
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowSignIn(true)}
                      className="text-white hover:text-blue-100 hover:bg-[#003580]"
                    >
                      Sign in
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-[#f2f6fa]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? "bg-[#009fe3] text-white"
                        : step.active
                          ? "bg-[#003580] text-white"
                          : "bg-gray-200 text-[#666]"
                    }`}
                  >
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium ${
                      step.active ? "text-[#003B95]" : "text-[#666]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Info */}
            <div>
              <div className="text-sm text-[#666] mb-1">
                One way • {travellers.length} traveller
                {travellers.length > 1 ? "s" : ""} • Sat, Aug 3
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                Mumbai to Dubai
              </h1>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg border border-[#f2f6fa] p-4 md:p-6">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Enter your details
                  </h2>
                  <p className="text-[#666] text-sm mb-6">
                    Add traveller details and review baggage options
                  </p>

                  <div className="space-y-6">
                    {travellers.map((traveller, index) => (
                      <div
                        key={traveller.id}
                        className="border border-[#666]/20 rounded-lg p-4 md:p-6 bg-white"
                      >
                        {/* Header with traveller name and icon */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-[#f2f6fa] rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-[#003580]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {`${traveller.firstName || ""} ${traveller.lastName || ""}`.trim() ||
                                  `${traveller.type} ${index + 1}`}
                              </h3>
                              <p className="text-sm text-[#666]">
                                {traveller.gender ||
                                  (traveller.type === "Child"
                                    ? "Male • Jan 1 2014"
                                    : "Female")}
                              </p>
                            </div>
                          </div>
                          <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-xs text-[#666]">?</span>
                          </div>
                        </div>

                        {/* Edit button */}
                        <div className="mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTraveller(traveller.id);
                              setShowTravellerDetails(true);
                            }}
                            className="text-[#003580] border-[#003580] hover:bg-[#009fe3]/10 text-sm font-medium"
                          >
                            Edit this traveller's details
                          </Button>
                        </div>

                        {/* Travel items section */}
                        <div className="space-y-3">
                          {/* Personal items */}
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-[#009fe3]/10 rounded-full flex items-center justify-center mt-0.5">
                              <CheckCircle className="w-3 h-3 text-[#009fe3]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-medium">
                                Personal items aren't available for this booking
                              </p>
                            </div>
                          </div>

                          {/* Carry-on bag */}
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-[#feba02]/10 rounded-full flex items-center justify-center mt-0.5">
                              <span className="text-xs text-[#feba02] font-bold">
                                !
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-medium">
                                1 carry-on bag
                              </p>
                              <p className="text-xs text-[#666]">
                                22 x 55 x 40 cm • 7 kg
                              </p>
                            </div>
                          </div>

                          {/* Checked bag */}
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 bg-[#009fe3]/10 rounded-full flex items-center justify-center mt-0.5">
                              <CheckCircle className="w-3 h-3 text-[#009fe3]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900 font-medium">
                                1 checked bag
                              </p>
                              <p className="text-xs text-[#666]">
                                {traveller.type === "Child" ? "23 kg" : "25 kg"}
                              </p>
                            </div>
                          </div>

                          {/* Age restriction for children */}
                          {traveller.type === "Child" && (
                            <div className="flex items-start space-x-3">
                              <div className="w-5 h-5 bg-[#f2f6fa] rounded-full flex items-center justify-center mt-0.5">
                                <span className="text-xs text-[#003580] font-bold">
                                  i
                                </span>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">
                                  Carry-on bags aren't available for this
                                  booking, but the airline may allow you to
                                  board with small items
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Extras
                  </h2>
                  <p className="text-[#666] text-sm mb-6">
                    Add extra services to your booking
                  </p>

                  <div className="space-y-8">
                    {/* Additional Baggage Section */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Additional baggage
                      </h4>
                      <p className="text-sm text-[#666] mb-4">
                        Add additional baggage per passenger across all your
                        flights
                      </p>

                      <div className="space-y-4">
                        {/* Outbound Flight */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-[#f2f6fa] rounded-full flex items-center justify-center">
                              <span className="text-[#003580] text-sm">✈</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Outbound
                              </h5>
                              <p className="text-sm text-[#666]">
                                Mumbai to Dubai
                              </p>
                            </div>
                          </div>

                          <div>
                            <Select
                              value={selectedBaggage.outbound.weight}
                              onValueChange={(value) =>
                                setSelectedBaggage((prev) => ({
                                  ...prev,
                                  outbound: {
                                    weight: value,
                                    quantity: value ? 1 : 0,
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Baggage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5kg">
                                  5kg - ₹ 1,500
                                </SelectItem>
                                <SelectItem value="10kg">
                                  10kg - ₹ 2,800
                                </SelectItem>
                                <SelectItem value="15kg">
                                  15kg - ₹ 4,200
                                </SelectItem>
                                <SelectItem value="20kg">
                                  20kg - ₹ 5,500
                                </SelectItem>
                                <SelectItem value="25kg">
                                  25kg - ��� 6,800
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Return Flight */}
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-[#f2f6fa] rounded-full flex items-center justify-center">
                              <span className="text-[#003580] text-sm">✈</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">
                                Return
                              </h5>
                              <p className="text-sm text-[#666]">
                                Dubai to Mumbai
                              </p>
                            </div>
                          </div>

                          <div>
                            <Select
                              value={selectedBaggage.return.weight}
                              onValueChange={(value) =>
                                setSelectedBaggage((prev) => ({
                                  ...prev,
                                  return: {
                                    weight: value,
                                    quantity: value ? 1 : 0,
                                  },
                                }))
                              }
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Baggage" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5kg">
                                  5kg - ₹ 1,500
                                </SelectItem>
                                <SelectItem value="10kg">
                                  10kg - ₹ 2,800
                                </SelectItem>
                                <SelectItem value="15kg">
                                  15kg - ₹ 4,200
                                </SelectItem>
                                <SelectItem value="20kg">
                                  20kg - ₹ 5,500
                                </SelectItem>
                                <SelectItem value="25kg">
                                  25kg - ₹ 6,800
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Select Meal Section */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Select Meal
                      </h4>
                      <div className="border rounded-lg bg-[#f2f6fa] p-4">
                        <div className="max-h-64 overflow-y-auto space-y-3">
                          {[
                            {
                              id: "fruit-cake",
                              name: "Fruit Cake Slice + Beverage of choice",
                              price: 200,
                            },
                            {
                              id: "vegan-special",
                              name: "Vegan Special + beverage",
                              price: 400,
                            },
                            {
                              id: "east-choice",
                              name: "4Ll East Choice Of The Day (Veg) + Beverage of choice",
                              price: 400,
                            },
                            {
                              id: "veg-biryani",
                              name: "Veg Biryani + Beverage of choice",
                              price: 400,
                            },
                            {
                              id: "paneer-tikka",
                              name: "Paneer Tikka Sandwich + beverage of choice",
                              price: 400,
                            },
                            {
                              id: "chicken-curry",
                              name: "Chicken Curry + Rice + Beverage",
                              price: 500,
                            },
                            {
                              id: "mutton-biryani",
                              name: "Mutton Biryani + Raita + Beverage",
                              price: 600,
                            },
                            {
                              id: "fish-curry",
                              name: "Fish Curry + Rice + Beverage",
                              price: 550,
                            },
                            {
                              id: "dal-chawal",
                              name: "Dal Chawal + Pickle + Beverage",
                              price: 350,
                            },
                            {
                              id: "sandwich-combo",
                              name: "Sandwich Combo + Chips + Beverage",
                              price: 300,
                            },
                          ].map((meal) => (
                            <label
                              key={meal.id}
                              className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer hover:bg-[#009fe3]/10"
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  checked={selectedMealIds.includes(meal.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMealIds((prev) => [
                                        ...prev,
                                        meal.id,
                                      ]);
                                    } else {
                                      setSelectedMealIds((prev) =>
                                        prev.filter((id) => id !== meal.id),
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 text-[#003580]"
                                />
                                <span className="font-medium text-gray-900">
                                  {meal.name}
                                </span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(meal.price)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lost Baggage Protection */}
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Lost Baggage Protection
                      </h4>
                      <p className="text-sm text-[#666] mb-4">
                        Get compensation in case your baggage is lost or delayed
                      </p>

                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]">
                          <input
                            type="radio"
                            name="baggageProtection"
                            value="bronze"
                            checked={selectedBaggageProtection === "bronze"}
                            onChange={(e) =>
                              setSelectedBaggageProtection(e.target.value)
                            }
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-900">
                                Bronze Service (1000₹ if Bag Coverage)
                              </span>
                            </div>
                            <span className="font-semibold">₹49</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]">
                          <input
                            type="radio"
                            name="baggageProtection"
                            value="gold"
                            checked={selectedBaggageProtection === "gold"}
                            onChange={(e) =>
                              setSelectedBaggageProtection(e.target.value)
                            }
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <span className="font-medium text-gray-900">
                                GOLD SERVICE (₹4000 if Bag Coverage)
                              </span>
                            </div>
                            <span className="font-semibold">₹200</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]">
                          <input
                            type="radio"
                            name="baggageProtection"
                            value="none"
                            checked={selectedBaggageProtection === "none"}
                            onChange={(e) =>
                              setSelectedBaggageProtection(e.target.value)
                            }
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              No, I will not buy baggage
                            </span>
                          </div>
                        </label>
                      </div>

                      <p className="text-xs text-gray-500 mt-4">
                        By adding lost baggage protection you agree to our{" "}
                        <a href="#" className="text-[#003580] underline">
                          Blue Ribbon Bag Terms & Conditions
                        </a>
                      </p>
                    </div>

                    {/* Refund Protection */}
                    <div className="border-t pt-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                            <span className="text-xl">♾️</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Receive 100% refund if you cancel for any of the
                            reasons below
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Flight disruption</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Home Emergency</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Injury / Illness (including Covid)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Theft of Documents</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Pre-existing Medical Condition</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Jury Service</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Death of Immediate Family</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Court Summons</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Public Transport Failure</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Relocated for Work</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Mechanical Breakdown</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Changes to Examination Dates</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Adverse Weather</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-[#003580] rounded-full"></span>
                            <span>Armed Forces & Emergency Service Recall</span>
                          </div>
                        </div>

                        <p className="text-xs text-[#666] mt-4">
                          Refund Protect has a 14 day rating on Trustpilot based
                          on over 50,000 independent customer reviews
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]">
                          <input
                            type="radio"
                            name="refundProtection"
                            value="yes"
                            checked={selectedRefundProtection === "yes"}
                            onChange={(e) =>
                              setSelectedRefundProtection(e.target.value)
                            }
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex-1 flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              Yes, protect my booking
                            </span>
                            <span className="font-semibold">₹27,803</span>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]">
                          <input
                            type="radio"
                            name="refundProtection"
                            value="no"
                            checked={selectedRefundProtection === "no"}
                            onChange={(e) =>
                              setSelectedRefundProtection(e.target.value)
                            }
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">
                              No, I don't want protection
                            </span>
                            <p className="text-sm text-[#666]">
                              You will not be covered
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Other Options */}
                    <div className="border-t pt-6">
                      <div className="bg-[#003B95] text-white rounded-lg p-6 mb-6">
                        <h4 className="text-xl font-bold mb-2">
                          Other Options
                        </h4>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                            selectedOtherOptions.length === 6
                              ? "bg-[#003580] border-[#003580] text-white shadow-md"
                              : "bg-white border-[#f2f6fa] hover:border-[#003580] hover:shadow-sm"
                          }`}
                        >
                          <Checkbox
                            checked={selectedOtherOptions.length === 6}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOtherOptions([
                                  "vpn",
                                  "tea",
                                  "weather",
                                  "alerts",
                                  "magazines",
                                  "esim",
                                ]);
                              } else {
                                setSelectedOtherOptions([]);
                              }
                            }}
                            className={`w-4 h-4 ${
                              selectedOtherOptions.length === 6
                                ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-[#003580]"
                                : ""
                            }`}
                          />
                          <span
                            className={`text-sm font-medium ${
                              selectedOtherOptions.length === 6
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {selectedOtherOptions.length === 6
                              ? "✓ All options selected"
                              : "Select all to get"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            id: "vpn",
                            name: "Travel VPN",
                            description:
                              "Securely and privately while traveling abroad.",
                            moreInfo: "More Information",
                            price: 14,
                          },
                          {
                            id: "tea",
                            name: "Free & Tea for Carbon Offset",
                            description:
                              "Help reduce carbon emissions by planting a tree for your trip",
                            moreInfo: "",
                            price: 4,
                          },
                          {
                            id: "weather",
                            name: "Weather Updates",
                            description:
                              "Get latest weather updates from your destination.",
                            moreInfo: "More Information",
                            price: 3,
                          },
                          {
                            id: "alerts",
                            name: "Flight Alerts",
                            description:
                              "Get real-time notifications about any flight changes via email and SMS",
                            moreInfo: "More Information",
                            price: 3,
                          },
                          {
                            id: "magazines",
                            name: "Digital Magazines",
                            description:
                              "Read latest with over 300 digital magazines",
                            moreInfo: "",
                            price: 7,
                          },
                          {
                            id: "esim",
                            name: "Travel eSIM 1GB",
                            description:
                              "Stay connected in United Arab Emirates with a 1GB eSIM",
                            moreInfo: "More Information",
                            price: 5,
                          },
                        ].map((option) => (
                          <label
                            key={option.id}
                            className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-[#f2f6fa]"
                          >
                            <Checkbox
                              checked={selectedOtherOptions.includes(option.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedOtherOptions((prev) => [
                                    ...prev,
                                    option.id,
                                  ]);
                                } else {
                                  setSelectedOtherOptions((prev) =>
                                    prev.filter((id) => id !== option.id),
                                  );
                                }
                              }}
                              className="w-4 h-4 mt-1"
                            />
                            <div className="flex items-center space-x-3 w-full">
                              <div className="w-8 h-8 bg-[#f2f6fa] rounded-full flex items-center justify-center">
                                <span className="text-[#003580] text-sm">
                                  •
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">
                                  {option.name}
                                </div>
                                <div className="text-sm text-[#666]">
                                  {option.description}
                                </div>
                                {option.moreInfo && (
                                  <button className="text-sm text-[#003580] hover:underline">
                                    {option.moreInfo}
                                  </button>
                                )}
                              </div>
                              <div className="font-semibold text-gray-900">
                                ₹{option.price}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Subtotal Section */}
                      <div className="border-t pt-4 mt-6 bg-[#f2f6fa] rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">
                          Subtotal
                        </h5>
                        <div className="space-y-2 text-sm">
                          {selectedMealIds.length > 0 && (
                            <div className="flex justify-between">
                              <span>Meals</span>
                              <span>₹{calculateMealsTotal()}</span>
                            </div>
                          )}
                          {calculateBaggageTotal() > 0 && (
                            <div className="flex justify-between">
                              <span>Additional Baggage</span>
                              <span>₹{calculateBaggageTotal()}</span>
                            </div>
                          )}
                          {selectedBaggageProtection &&
                            selectedBaggageProtection !== "none" && (
                              <div className="flex justify-between">
                                <span>Baggage Protection</span>
                                <span>
                                  ₹
                                  {selectedBaggageProtection === "bronze"
                                    ? 49
                                    : 200}
                                </span>
                              </div>
                            )}
                          {selectedRefundProtection === "yes" && (
                            <div className="flex justify-between">
                              <span>Refund Protection</span>
                              <span>₹27,803</span>
                            </div>
                          )}
                          {selectedOtherOptions.length > 0 && (
                            <div className="flex justify-between">
                              <span>Other Options</span>
                              <span>
                                ₹
                                {selectedOtherOptions.reduce((total, id) => {
                                  const prices = {
                                    vpn: 14,
                                    tea: 4,
                                    weather: 3,
                                    alerts: 3,
                                    magazines: 7,
                                    esim: 5,
                                  };
                                  return total + (prices[id] || 0);
                                }, 0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="border-t pt-3 mt-3">
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span className="text-black font-bold">
                              Extras Total:
                            </span>
                            <span className="text-2xl text-black font-bold">
                              {formatCurrency(calculateExtrasTotal())}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Select Seats
                  </h2>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-[#003580] mb-2">
                      Choose your seats
                    </h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        • Select a traveller first, then click on any available
                        seat
                      </p>
                      <p>
                        • Seat prices vary by location - hover to see pricing
                      </p>
                      <p>• Children under 8 must sit on an adult's lap</p>
                    </div>
                  </div>

                  <SeatMap
                    travellers={travellers}
                    seatSelections={seatSelections}
                    setSeatSelections={setSeatSelections}
                  />
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Payment Details
                  </h2>
                  <p className="text-[#666] text-sm mb-6">
                    Complete your booking by providing payment information
                  </p>

                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="bg-white border border-[#f2f6fa] rounded-lg p-4 md:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Choose Payment Method
                      </h3>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-4 border-2 border-[#003580] bg-[#003580]/5 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="card"
                            defaultChecked
                            className="w-4 h-4 text-[#003580]"
                          />
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-5 h-5 text-[#003580]" />
                            <span className="font-medium text-gray-900">
                              Credit/Debit Card
                            </span>
                          </div>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="upi"
                            className="w-4 h-4 text-[#003580]"
                          />
                          <span className="font-medium text-gray-900">UPI</span>
                        </label>
                        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="wallet"
                            className="w-4 h-4 text-[#003580]"
                          />
                          <span className="font-medium text-gray-900">
                            Digital Wallet
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Card Details Form */}
                    <div className="bg-white border border-[#f2f6fa] rounded-lg p-4 md:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Card Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#666] mb-1">
                            Card Number
                          </label>
                          <Input
                            placeholder="1234 5678 9012 3456"
                            value={paymentDetails.cardNumber}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                cardNumber: e.target.value,
                              })
                            }
                            className="text-base"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#666] mb-1">
                              Expiry Date
                            </label>
                            <Input
                              placeholder="MM/YY"
                              value={paymentDetails.expiryDate}
                              onChange={(e) =>
                                setPaymentDetails({
                                  ...paymentDetails,
                                  expiryDate: e.target.value,
                                })
                              }
                              className="text-base"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#666] mb-1">
                              CVV
                            </label>
                            <Input
                              placeholder="123"
                              value={paymentDetails.cvv}
                              onChange={(e) =>
                                setPaymentDetails({
                                  ...paymentDetails,
                                  cvv: e.target.value,
                                })
                              }
                              className="text-base"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#666] mb-1">
                            Cardholder Name
                          </label>
                          <Input
                            placeholder="Name as on card"
                            value={paymentDetails.cardholderName}
                            onChange={(e) =>
                              setPaymentDetails({
                                ...paymentDetails,
                                cardholderName: e.target.value,
                              })
                            }
                            className="text-base"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing Address */}
                    <div className="bg-white border border-[#f2f6fa] rounded-lg p-4 md:p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Billing Address
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#666] mb-1">
                            Full Address
                          </label>
                          <Input
                            placeholder="Street, City, State"
                            className="text-base"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#666] mb-1">
                              Postal Code
                            </label>
                            <Input placeholder="400001" className="text-base" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#666] mb-1">
                              Country
                            </label>
                            <Select defaultValue="india">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="india">India</SelectItem>
                                <SelectItem value="uae">UAE</SelectItem>
                                <SelectItem value="usa">USA</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-[#f2f6fa] border border-[#003580]/20 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox className="mt-1" />
                        <div className="text-sm text-gray-700">
                          <p>
                            I agree to the{" "}
                            <a
                              href="#"
                              className="text-[#003580] hover:underline"
                            >
                              Terms & Conditions
                            </a>{" "}
                            and{" "}
                            <a
                              href="#"
                              className="text-[#003580] hover:underline"
                            >
                              Privacy Policy
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Final Payment Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">
                          Final Amount
                        </span>
                        <span className="text-xl font-bold text-blue-700">
                          {formatCurrency(
                            calculateBaseFareTotal() +
                              calculateExtrasTotal() +
                              getTotalSeatFees(),
                          )}
                        </span>
                      </div>
                      {location.state?.negotiatedPrice && (
                        <div className="text-sm text-blue-700">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Bargained all-inclusive price - no hidden fees
                        </div>
                      )}
                      {!location.state?.negotiatedPrice && (
                        <div className="text-sm text-gray-600">
                          Includes all taxes, fees & payment gateway charges
                        </div>
                      )}
                    </div>

                    {/* Payment Security Notice */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="text-sm text-green-800">
                          <p className="font-medium">Secure Payment</p>
                          <p>
                            Your payment information is encrypted and secure
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-[#f2f6fa] gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  className="flex items-center justify-center w-full sm:w-auto"
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  {currentStep < 4 && (
                    <Button
                      variant="outline"
                      onClick={handleNextStep}
                      className="text-[#666] border-[#666]/20 hover:bg-[#f2f6fa] w-full sm:w-auto"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    onClick={handleNextStep}
                    className="bg-[#003580] hover:bg-[#009fe3] text-white px-8 w-full sm:w-auto"
                  >
                    {currentStep === 4
                      ? `Pay ${formatCurrency(calculateBaseFareTotal() + calculateExtrasTotal() + getTotalSeatFees())}`
                      : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Price Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-[#f2f6fa] p-4 md:p-6 lg:sticky lg:top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price details
              </h3>

              {/* Bargain Price Indicator */}
              {location.state?.negotiatedPrice && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Bargained Price - All Inclusive
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    This price includes all airline taxes, fees & payment
                    gateway charges
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">
                      Flight ({travellers.length} traveller
                      {travellers.length > 1 ? "s" : ""})
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#666]" />
                  </div>

                  {/* Adults Section - Collapsible */}
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between items-center text-gray-900">
                      <button
                        onClick={() => setShowAdultFare(!showAdultFare)}
                        className="flex items-center space-x-1"
                      >
                        <span>Adults ({passengersFromState.adults})</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${showAdultFare ? "rotate-180" : ""}`}
                        />
                      </button>
                      <span>{formatCurrency(calculateTotalAdultsPrice())}</span>
                    </div>
                    {showAdultFare && (
                      <div className="ml-4 space-y-1">
                        <div className="flex justify-between text-[#666]">
                          <span>Flight fare</span>
                          <span>
                            {formatCurrency(
                              calculateAdultPrice() *
                                passengersFromState.adults,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#666]">
                          <span>Airline taxes and fees</span>
                          <span>
                            {formatCurrency(
                              calculateAdultTaxes() *
                                passengersFromState.adults,
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Child Section - Collapsible (only show if children exist) */}
                  {passengersFromState.children > 0 && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center text-gray-900">
                        <button
                          onClick={() => setShowChildFare(!showChildFare)}
                          className="flex items-center space-x-1"
                        >
                          <span>
                            Child{passengersFromState.children > 1 ? "ren" : ""}{" "}
                            ({passengersFromState.children})
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 transition-transform ${showChildFare ? "rotate-180" : ""}`}
                          />
                        </button>
                        <span>
                          {formatCurrency(calculateTotalChildrenPrice())}
                        </span>
                      </div>
                      {showChildFare && (
                        <div className="ml-4 space-y-1">
                          <div className="flex justify-between text-[#666]">
                            <span>Flight fare</span>
                            <span>
                              {formatCurrency(
                                calculateChildPrice() *
                                  passengersFromState.children,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#666]">
                            <span>Airline taxes and fees</span>
                            <span>
                              {formatCurrency(
                                calculateChildTaxes() *
                                  passengersFromState.children,
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Extras in Price Details */}
                {(selectedMealIds.length > 0 ||
                  calculateBaggageTotal() > 0 ||
                  selectedOtherOptions.length > 0 ||
                  selectedBaggageProtection ||
                  selectedRefundProtection !== "no") && (
                  <div className="border-t border-[#f2f6fa] pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Extras</h4>
                    <div className="space-y-2 text-sm">
                      {selectedMealIds.length > 0 && (
                        <div className="flex justify-between">
                          <span>Meals</span>
                          <span>{formatCurrency(calculateMealsTotal())}</span>
                        </div>
                      )}
                      {calculateBaggageTotal() > 0 && (
                        <div className="flex justify-between">
                          <span>Additional Baggage</span>
                          <span>{formatCurrency(calculateBaggageTotal())}</span>
                        </div>
                      )}
                      {selectedBaggageProtection === "bronze" && (
                        <div className="flex justify-between">
                          <span>Bronze Baggage Protection</span>
                          <span>{formatCurrency(49)}</span>
                        </div>
                      )}
                      {selectedBaggageProtection === "gold" && (
                        <div className="flex justify-between">
                          <span>Gold Baggage Protection</span>
                          <span>{formatCurrency(200)}</span>
                        </div>
                      )}
                      {selectedRefundProtection === "yes" && (
                        <div className="flex justify-between">
                          <span>Refund Protection</span>
                          <span>{formatCurrency(27803)}</span>
                        </div>
                      )}
                      {selectedOtherOptions.length > 0 && (
                        <div className="flex justify-between">
                          <span>
                            Other Options ({selectedOtherOptions.length})
                          </span>
                          <span>
                            {formatCurrency(
                              selectedOtherOptions.reduce((total, id) => {
                                const prices = {
                                  vpn: 14,
                                  tea: 4,
                                  weather: 3,
                                  alerts: 3,
                                  magazines: 7,
                                  esim: 5,
                                };
                                return total + (prices[id] || 0);
                              }, 0),
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Seat Fees in Price Details */}
                {currentStep >= 3 && getTotalSeatFees() > 0 && (
                  <div className="border-t border-[#f2f6fa] pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Seat Fees
                    </h4>
                    <div className="space-y-2 text-sm">
                      {calculateSeatTotal("Mumbai-Dubai") > 0 && (
                        <div className="flex justify-between">
                          <span>Mumbai → Dubai</span>
                          <span>
                            {formatCurrency(calculateSeatTotal("Mumbai-Dubai"))}
                          </span>
                        </div>
                      )}
                      {calculateSeatTotal("Dubai-Mumbai") > 0 && (
                        <div className="flex justify-between">
                          <span>Dubai → Mumbai</span>
                          <span>
                            {formatCurrency(calculateSeatTotal("Dubai-Mumbai"))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="border-t border-[#f2f6fa] pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        calculateBaseFareTotal() +
                          calculateExtrasTotal() +
                          getTotalSeatFees(),
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    taxes and fees included
                  </p>
                </div>

                <div className="bg-[#f2f6fa] border border-[#009fe3]/20 rounded-lg p-3">
                  <p className="text-sm text-[#003580]">
                    ✓ No hidden fees – track your price at every step
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Traveller Details Dialog */}
      <Dialog
        open={showTravellerDetails}
        onOpenChange={setShowTravellerDetails}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTraveller
                ? `Edit ${
                    travellers.find((t) => t.id === selectedTraveller)?.type
                  } Details`
                : "Add Traveller Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedTraveller && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#666] mb-1">
                  Title
                </label>
                <Select
                  value={
                    travellers.find((t) => t.id === selectedTraveller)?.title ||
                    ""
                  }
                  onValueChange={(value) => {
                    const updatedTravellers = travellers.map((t) =>
                      t.id === selectedTraveller ? { ...t, title: value } : t,
                    );
                    setTravellers(updatedTravellers);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-1">
                  First Name
                </label>
                <Input
                  value={
                    travellers.find((t) => t.id === selectedTraveller)
                      ?.firstName || ""
                  }
                  onChange={(e) => {
                    const updatedTravellers = travellers.map((t) =>
                      t.id === selectedTraveller
                        ? { ...t, firstName: e.target.value }
                        : t,
                    );
                    console.log(
                      "Updating firstName:",
                      e.target.value,
                      "for traveller:",
                      selectedTraveller,
                    );
                    setTravellers(updatedTravellers);
                  }}
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-1">
                  Middle Name
                </label>
                <Input
                  value={
                    travellers.find((t) => t.id === selectedTraveller)
                      ?.middleName || ""
                  }
                  onChange={(e) => {
                    const updatedTravellers = travellers.map((t) =>
                      t.id === selectedTraveller
                        ? { ...t, middleName: e.target.value }
                        : t,
                    );
                    setTravellers(updatedTravellers);
                  }}
                  placeholder="Enter middle name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-1">
                  Last Name
                </label>
                <Input
                  value={
                    travellers.find((t) => t.id === selectedTraveller)
                      ?.lastName || ""
                  }
                  onChange={(e) => {
                    const updatedTravellers = travellers.map((t) =>
                      t.id === selectedTraveller
                        ? { ...t, lastName: e.target.value }
                        : t,
                    );
                    setTravellers(updatedTravellers);
                  }}
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#666] mb-1">
                  Gender
                </label>
                <Select
                  value={
                    travellers.find((t) => t.id === selectedTraveller)
                      ?.gender || ""
                  }
                  onValueChange={(value) => {
                    const updatedTravellers = travellers.map((t) =>
                      t.id === selectedTraveller ? { ...t, gender: value } : t,
                    );
                    setTravellers(updatedTravellers);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowTravellerDetails(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTravellerSubmit}
                  className="bg-[#003580] hover:bg-[#009fe3]"
                >
                  Save Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
