import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MapPin, X, Search, Loader2 } from "lucide-react";
import { hotelsService } from "@/services/hotelsService";

export interface DestinationData {
  id: string;
  code: string;
  name: string;
  country: string;
  countryCode?: string;
  type: "city" | "region" | "country" | "landmark";
  popular?: boolean;
  flag?: string;
}

interface DestinationAutocompleteProps {
  value?: string;
  code?: string;
  onSelect: (destination: DestinationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showClearButton?: boolean;
  maxResults?: number;
  popularLimit?: number;
}

export function DestinationAutocomplete({
  value = "",
  code = "",
  onSelect,
  placeholder = "Search destinations...",
  className = "",
  disabled = false,
  showClearButton = true,
  maxResults = 10,
  popularLimit = 8,
}: DestinationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<DestinationData[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<
    DestinationData[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [popularLoaded, setPopularLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchRef = useRef<NodeJS.Timeout>();
  const searchCache = useRef<Map<string, DestinationData[]>>(new Map());

  // Load popular destinations on mount
  useEffect(() => {
    const loadPopularDestinations = async () => {
      try {
        console.log("🌟 Loading popular destinations for autocomplete...");
        const popular = await hotelsService.searchDestinations(
          "",
          popularLimit,
          true,
        );

        const formattedPopular: DestinationData[] = popular.map((dest) => ({
          id: dest.id,
          code: dest.id,
          name: dest.name,
          country: dest.country,
          type: dest.type as "city" | "region" | "country" | "landmark",
          popular: true,
          flag: (dest as any).flag || "🌍",
        }));

        setPopularDestinations(formattedPopular);
        setPopularLoaded(true);
        console.log(
          "✅ Loaded",
          formattedPopular.length,
          "popular destinations",
        );
      } catch (error) {
        console.error("⚠️ Failed to load popular destinations:", error);
        setError("Failed to load destinations");
        setPopularLoaded(true);
      }
    };

    loadPopularDestinations();
  }, [popularLimit]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search function with caching
  const searchDestinations = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      // Check cache first
      const cacheKey = query.toLowerCase();
      if (searchCache.current.has(cacheKey)) {
        console.log("📦 Using cached results for:", query);
        setSuggestions(searchCache.current.get(cacheKey) || []);
        return;
      }

      // Clear previous timeout
      if (debouncedSearchRef.current) {
        clearTimeout(debouncedSearchRef.current);
      }

      // Set new timeout for debounced search
      debouncedSearchRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          setError(null);
          console.log(`🔍 Searching destinations: "${query}"`);

          const results = await hotelsService.searchDestinations(
            query,
            maxResults,
          );

          const formattedResults: DestinationData[] = results.map((dest) => ({
            id: dest.id,
            code: dest.id,
            name: dest.name,
            country: dest.country,
            type: dest.type as "city" | "region" | "country" | "landmark",
            popular: (dest as any).popular || false,
            flag: (dest as any).flag || "🌍",
          }));

          // Cache the results
          searchCache.current.set(cacheKey, formattedResults);

          setSuggestions(formattedResults);
          console.log(
            `✅ Found ${formattedResults.length} destinations for "${query}"`,
          );
        } catch (error) {
          console.error("⚠️ Destination search failed:", error);
          setError("Search failed. Please try again.");

          // Fallback to filtered popular destinations
          const fallback = popularDestinations.filter(
            (dest) =>
              dest.name.toLowerCase().includes(query.toLowerCase()) ||
              dest.country.toLowerCase().includes(query.toLowerCase()) ||
              dest.code.toLowerCase().includes(query.toLowerCase()),
          );
          setSuggestions(fallback);
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce
    },
    [maxResults, popularDestinations],
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (isOpen && popularLoaded) {
      if (newValue.length >= 2) {
        searchDestinations(newValue);
      } else {
        setSuggestions([]);
      }
    }
  };

  // Handle destination selection
  const handleDestinationSelect = (destination: DestinationData) => {
    const fullName = `${destination.name}, ${destination.country}`;
    setInputValue(fullName);
    setIsOpen(false);
    setSuggestions([]);

    console.log("🎯 Destination selected:", {
      name: fullName,
      code: destination.code,
      type: destination.type,
      popular: destination.popular,
    });

    onSelect(destination);
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue("");
    setSuggestions([]);
    setError(null);
    onSelect({
      id: "",
      code: "",
      name: "",
      country: "",
      type: "city",
    });
  };

  // Handle popover open
  const handlePopoverOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && popularLoaded && inputValue.length >= 2) {
      searchDestinations(inputValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={handlePopoverOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-4 h-4" />
            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onClick={() => handlePopoverOpen(true)}
              disabled={disabled}
              className="pl-10 pr-8 h-10 sm:h-12 bg-white border-2 border-orange-400 focus:border-blue-500 rounded font-medium text-sm touch-manipulation"
              placeholder={placeholder}
              autoComplete="off"
              aria-label="Search destinations"
            />
            {showClearButton && inputValue && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear destination"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-80 sm:w-96 p-0" align="start">
          <div className="max-h-80 overflow-y-auto">
            {!popularLoaded ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">
                  Loading destinations...
                </span>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-red-500 text-sm mb-2">⚠️ {error}</div>
                <button
                  onClick={() => {
                    setError(null);
                    if (inputValue.length >= 2) {
                      searchDestinations(inputValue);
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Try again
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">
                  🔍 Searching database...
                </span>
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                <div className="px-4 py-2 border-b bg-green-50">
                  <h4 className="font-medium text-sm text-green-700 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Search Results ({suggestions.length})
                  </h4>
                </div>
                {suggestions.map((dest, index) => (
                  <div
                    key={dest.id || index}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors border-l-2 border-transparent hover:border-blue-500"
                    onClick={() => handleDestinationSelect(dest)}
                  >
                    <div className="text-lg mr-3">{dest.flag || "🌍"}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {dest.name}, {dest.country}
                        </span>
                        {dest.popular && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
                            ⭐ Popular
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                          {dest.code}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {dest.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : inputValue.length >= 2 ? (
              <div className="p-4 text-center">
                <div className="text-gray-400 mb-2">🔍</div>
                <div className="text-sm text-gray-500 mb-2">
                  No destinations found for "{inputValue}"
                </div>
                <div className="text-xs text-gray-400">
                  Try searching for a city or country name
                </div>
              </div>
            ) : (
              <div>
                <div className="px-4 py-2 border-b bg-blue-50">
                  <h4 className="font-medium text-sm text-blue-700 flex items-center gap-1">
                    ⭐ Popular Destinations
                  </h4>
                </div>
                {popularDestinations.map((dest, index) => (
                  <div
                    key={dest.id}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors border-l-2 border-transparent hover:border-blue-500"
                    onClick={() => handleDestinationSelect(dest)}
                  >
                    <div className="text-lg mr-3">
                      {index === 0
                        ? "🏆"
                        : index === 1
                          ? "🎆"
                          : index === 2
                            ? "✨"
                            : dest.flag || "🌍"}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {dest.name}, {dest.country}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                          {dest.code}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {dest.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2 border-t bg-gray-50">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    <span>Type to search 1000+ destinations from database</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DestinationAutocomplete;
