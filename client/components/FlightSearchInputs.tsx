import React from "react";
import { Plane } from "lucide-react";
import CityAutocomplete, { CityOption } from "@/components/CityAutocomplete";
import { searchAirportsWithFallback } from "@/lib/airportSearch";

interface FlightSearchInputsProps {
  fromAirport: CityOption | null;
  toAirport: CityOption | null;
  onFromAirportChange: (airport: CityOption | null) => void;
  onToAirportChange: (airport: CityOption | null) => void;
}

export function FlightSearchInputs({
  fromAirport,
  toAirport,
  onFromAirportChange,
  onToAirportChange,
}: FlightSearchInputsProps) {
  return (
    <>
      {/* From Airport */}
      <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
        <CityAutocomplete
          label="Leaving from"
          placeholder="City or airport"
          value={fromAirport}
          onChange={onFromAirportChange}
          fetchOptions={searchAirportsWithFallback}
          icon={<Plane className="w-4 h-4" />}
          className="relative"
        />
      </div>

      {/* To Airport */}
      <div className="relative flex-1 lg:max-w-xs w-full lg:w-auto">
        <CityAutocomplete
          label="Going to"
          placeholder="City or airport"
          value={toAirport}
          onChange={onToAirportChange}
          fetchOptions={searchAirportsWithFallback}
          icon={<Plane className="w-4 h-4" />}
          className="relative"
        />
      </div>
    </>
  );
}
