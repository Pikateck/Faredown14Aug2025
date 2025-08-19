import React, { useEffect, useId, useRef, useState } from "react";
import { searchAirports, type Airport } from "../../shared/airportSearch";
import { Building2, Plane } from "lucide-react";

type Props = {
  label: string;
  placeholder?: string;
  value: Airport | null;
  onChange: (a: Airport | null) => void;
  autoFocus?: boolean;
  className?: string;
  icon?: "building" | "plane";
};

export function CityAutocompleteButton({
  label,
  placeholder = "Type a city or code…",
  value,
  onChange,
  autoFocus,
  className = "",
  icon = "building",
}: Props) {
  const inputId = useId();
  const listboxId = useId();
  
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
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
    if (value && !isTyping) {
      setQuery(formatAirportDisplay(value));
    } else if (!value && !isTyping) {
      setQuery("");
    }
  }, [value, isTyping]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!isOpen || query.length < 2) {
      setAirports([]);
      return;
    }

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
        setIsTyping(false);
        // Reset to display value if we have a selection
        if (value) {
          setQuery(formatAirportDisplay(value));
        }
        // Hide input again
        if (inputRef.current) {
          inputRef.current.style.pointerEvents = 'none';
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setIsOpen(true);
    setIsTyping(true);
    
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
    setIsTyping(false);
    // Hide input again
    if (inputRef.current) {
      inputRef.current.style.pointerEvents = 'none';
    }
  }

  function handleClick() {
    setIsOpen(true);
    setIsTyping(true);
    if (value) {
      setQuery(""); // Clear the query to allow fresh typing
    }
    // Focus the hidden input to capture typing
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.style.pointerEvents = 'auto';
        inputRef.current.focus();
      }
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    // If typing regular characters, open and focus input
    if (!isOpen && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setIsOpen(true);
      setIsTyping(true);
      setQuery(e.key);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.pointerEvents = 'auto';
          inputRef.current.focus();
        }
      }, 0);
      return;
    }

    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      setIsTyping(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.style.pointerEvents = 'auto';
          inputRef.current.focus();
        }
      }, 0);
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
        setIsTyping(false);
        // Reset to display value if we have a selection
        if (value) {
          setQuery(formatAirportDisplay(value));
        }
        // Hide input again
        if (inputRef.current) {
          inputRef.current.style.pointerEvents = 'none';
        }
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

  const IconComponent = icon === "plane" ? Plane : Building2;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Completely hidden input for typing */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoComplete="off"
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={
            isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent z-10 pointer-events-none"
          style={{
            backgroundColor: 'transparent',
            color: 'transparent',
            caretColor: 'transparent'
          }}
        />
        
        {/* Button that looks like original design */}
        <button
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className="w-full text-left relative z-20 focus:outline-none"
          type="button"
          tabIndex={0}
        >
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-[#003580]" />
            </div>
            <div>
              {value ? (
                <>
                  <div className="font-medium text-gray-900">
                    {value.code}
                  </div>
                  <div className="text-xs text-gray-500">
                    {[value.city, value.country].filter(Boolean).join(", ") || value.name}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  {label === "From" ? "Leaving from" : label === "To" ? "Going to" : placeholder}
                </div>
              )}
            </div>
          </div>
        </button>
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {query.length < 2 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              Type at least 2 characters to search...
            </li>
          )}
          
          {query.length >= 2 && isLoading && (
            <li className="px-3 py-2 text-sm text-gray-500">
              Searching...
            </li>
          )}
          
          {query.length >= 2 && !isLoading && airports.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No airports found
            </li>
          )}
          
          {query.length >= 2 && !isLoading && airports.map((airport, index) => (
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
