import React from "react";
import CityAutocomplete from "@/components/CityAutocomplete";
import type { Airport } from "@/shared/airportSearch";

interface SightseeingDestinationInputProps {
  value: Airport | null;
  onChange: (destination: Airport | null) => void;
  onLegacyUpdate?: (destination: string, code: string) => void;
}

export function SightseeingDestinationInput({
  value,
  onChange,
  onLegacyUpdate,
}: SightseeingDestinationInputProps) {
  return (
    <div className="flex-1 lg:max-w-[320px] relative destination-container">
      <label className="text-xs font-medium text-gray-800 mb-1 block sm:hidden">
        Destination
      </label>
      
      <CityAutocomplete
        label="Destination"
        placeholder="Where do you want to explore?"
        value={value}
        onChange={(destination) => {
          onChange(destination);
          // Update legacy state for compatibility
          if (destination && onLegacyUpdate) {
            onLegacyUpdate(
              `${destination.city}, ${destination.country}`,
              destination.code
            );
          } else if (!destination && onLegacyUpdate) {
            onLegacyUpdate("", "");
          }
        }}
        required
        className="relative"
      />
    </div>
  );
}
