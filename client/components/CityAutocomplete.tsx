import React, { useEffect, useId, useRef, useState } from "react";
import { searchAirports, type Airport } from "../../shared/airportSearch";

type Props = {
  label: string;
  placeholder?: string;
  value: Airport | null;
  onChange: (a: Airport | null) => void;
  autoFocus?: boolean;
  className?: string;
};

export function CityAutocomplete({
  label,
  placeholder = "Type a city or code…",
  value,
  onChange,
  autoFocus,
  className = "",
}: Props) {
  const inputId = useId();
  const listboxId = useId();
  
  const [query, setQuery] = useState(value ? formatAirportDisplay(value) : "");
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Format airport display as "BOM · Mumbai, India"
  function formatAirportDisplay(airport: Airport): string {
    const cityCountry = [airport.city, airport.country].filter(Boolean).join(", ");
    return `${airport.code} · ${cityCountry || airport.name}`;
  }

  // Update query when value changes externally
  useEffect(() => {
    setQuery(value ? formatAirportDisplay(value) : "");
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!isOpen) return;

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchAirports(query);
        setAirports(results);
        setActiveIndex(results.length > 0 ? 0 : -1);
      } catch (error) {
        console.error("Airport search failed:", error);
        setAirports([]);
        setActiveIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        listRef.current && 
        !listRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    
    // Clear selection if user types something different
    if (value && newQuery !== formatAirportDisplay(value)) {
      onChange(null);
    }
  }

  function selectAirport(airport: Airport) {
    onChange(airport);
    setQuery(formatAirportDisplay(airport));
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function clearSelection() {
    onChange(null);
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex(prev => 
          prev < airports.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && airports[activeIndex]) {
          selectAirport(airports[activeIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
        />
        
        {query && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading && (
            <li className="px-3 py-2 text-sm text-gray-500">
              Searching...
            </li>
          )}
          
          {!isLoading && airports.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No airports found
            </li>
          )}
          
          {!isLoading && airports.map((airport, index) => (
            <li
              key={airport.code}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => selectAirport(airport)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === activeIndex 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="font-medium">
                {airport.code} · {[airport.city, airport.country].filter(Boolean).join(", ") || airport.name}
              </div>
              {airport.name && airport.city && (
                <div className={`text-xs ${index === activeIndex ? "text-blue-100" : "text-gray-500"}`}>
                  {airport.name}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
