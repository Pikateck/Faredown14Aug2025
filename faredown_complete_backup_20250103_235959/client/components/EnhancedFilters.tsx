import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  Filter,
  ChevronDown,
  ChevronUp,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Dumbbell,
  Waves,
  Utensils,
  Shield,
  Home,
  Building,
  Trees,
  Bed,
  Bath,
  Clock,
  CreditCard,
  Users,
  Heart,
  Award,
  Accessibility,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatPriceWithSymbol } from "@/lib/pricing";

interface FilterCategory {
  id: string;
  title: string;
  icon?: React.ReactNode;
  items: FilterItem[];
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
  showAll?: boolean;
  maxVisible?: number;
}

interface FilterItem {
  id: string;
  label: string;
  count?: number;
  popular?: boolean;
}

interface EnhancedFiltersProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedAmenities: string[];
  setSelectedAmenities: (amenities: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
}

export function EnhancedFilters({
  priceRange,
  setPriceRange,
  selectedAmenities,
  setSelectedAmenities,
  sortBy,
  setSortBy,
  onClearFilters,
}: EnhancedFiltersProps) {
  const { selectedCurrency } = useCurrency();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "property-rating",
    "popular",
    "price",
  ]);
  const [showAllSections, setShowAllSections] = useState<string[]>([]);

  const sortOptions = [
    { value: "recommended", label: "Our top picks" },
    { value: "price-low", label: "Price (lowest first)" },
    { value: "price-high", label: "Price (highest first)" },
    { value: "rating", label: "Best reviewed & lowest price" },
    { value: "stars-high", label: "Property rating (high to low)" },
    { value: "distance", label: "Distance from downtown" },
  ];

  const filterCategories: FilterCategory[] = [
    {
      id: "property-rating",
      title: "Property rating",
      defaultExpanded: true,
      items: [
        { id: "5-stars", label: "5 stars", count: 298 },
        { id: "4-stars", label: "4 stars", count: 1195 },
        { id: "3-stars", label: "3 stars", count: 272 },
        { id: "2-stars", label: "2 stars", count: 78 },
        { id: "1-star", label: "1 star", count: 3 },
      ],
      maxVisible: 5,
    },
    {
      id: "popular",
      title: "Popular filters",
      defaultExpanded: true,
      items: [
        { id: "free-cancellation", label: "Free cancellation", count: 4063 },
        { id: "resorts", label: "Resorts", count: 59 },
        { id: "downtown-dubai", label: "Downtown Dubai", count: 1126 },
        { id: "villas", label: "Villas", count: 104 },
        {
          id: "family-friendly",
          label: "Family-friendly properties",
          count: 3889,
        },
        { id: "hotels", label: "Hotels", count: 1 },
        { id: "vacation-homes", label: "Vacation homes", count: 91 },
        { id: "hostels", label: "Hostels", count: 1 },
      ],
      maxVisible: 8,
    },
    {
      id: "facilities",
      title: "Facilities",
      isCollapsible: true,
      items: [
        { id: "parking", label: "Parking", count: 5745 },
        { id: "restaurant", label: "Restaurant", count: 895 },
        { id: "room-service", label: "Room service", count: 797 },
        { id: "24h-front-desk", label: "24-hour front desk", count: 2088 },
        { id: "fitness-center", label: "Fitness center", count: 3544 },
        { id: "spa", label: "Spa", count: 1256 },
      ],
      maxVisible: 6,
    },
    {
      id: "meals",
      title: "Meals",
      isCollapsible: true,
      items: [
        { id: "kitchen-facilities", label: "Kitchen facilities", count: 5637 },
        { id: "breakfast-included", label: "Breakfast included", count: 624 },
        { id: "all-inclusive", label: "All-inclusive", count: 20 },
        { id: "half-board", label: "Half board", count: 156 },
      ],
      maxVisible: 4,
    },
    {
      id: "property-type",
      title: "Property Type",
      isCollapsible: true,
      items: [
        { id: "entire-homes", label: "Entire homes & apartments", count: 5633 },
        { id: "apartments", label: "Apartments", count: 5356 },
        { id: "hotels", label: "Hotels", count: 651 },
        { id: "villas", label: "Villas", count: 104 },
        { id: "resorts", label: "Resorts", count: 59 },
      ],
      maxVisible: 5,
    },
    {
      id: "review-score",
      title: "Review score",
      isCollapsible: true,
      items: [
        { id: "wonderful-9", label: "Wonderful: 9+", count: 1720 },
        { id: "very-good-8", label: "Very Good: 8+", count: 2833 },
        { id: "good-7", label: "Good: 7+", count: 3405 },
        { id: "pleasant-6", label: "Pleasant: 6+", count: 3678 },
      ],
    },
    {
      id: "distance",
      title: "Distance from center of Dubai",
      isCollapsible: true,
      items: [
        { id: "less-1km", label: "Less than 1 km", count: 1105 },
        { id: "less-3km", label: "Less than 3 km", count: 2291 },
        { id: "less-5km", label: "Less than 5 km", count: 2554 },
      ],
      maxVisible: 3,
    },
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const toggleShowAll = (sectionId: string) => {
    setShowAllSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  const handleFilterChange = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, itemId]);
    } else {
      setSelectedAmenities(selectedAmenities.filter((id) => id !== itemId));
    }
  };

  const renderFilterItem = (item: FilterItem, categoryId: string) => {
    const isChecked = selectedAmenities.includes(item.id);

    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-0.5 min-h-[24px] pr-1"
      >
        <label className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight flex items-center">
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => handleFilterChange(item.id, e.target.checked)}
              className={`w-3 h-3 sm:w-4 sm:h-4 ${isChecked ? "bg-blue-600" : "bg-white border border-gray-400"}`}
            />
          </div>
          {item.label}
        </label>
        {item.count && (
          <span className="text-xs text-gray-500 ml-2 mr-1">{item.count}</span>
        )}
      </div>
    );
  };

  const renderFilterCategory = (category: FilterCategory) => {
    const isExpanded = expandedSections.includes(category.id);
    const showAll = showAllSections.includes(category.id);
    const maxVisible = category.maxVisible || category.items.length;
    const visibleItems = showAll
      ? category.items
      : category.items.slice(0, maxVisible);
    const hasMore = category.items.length > maxVisible;

    if (category.isCollapsible) {
      return (
        <div key={category.id} className="space-y-1 mt-4">
          <div className="border-b border-gray-200 pb-1 flex items-center justify-between">
            <button
              onClick={() => toggleSection(category.id)}
              className="flex w-full items-center justify-between text-left"
            >
              <div className="text-sm font-semibold text-gray-900">
                {category.title}
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          {isExpanded && (
            <div className="space-y-1">
              {visibleItems.map((item) => renderFilterItem(item, category.id))}
              {hasMore && (
                <button
                  onClick={() => toggleShowAll(category.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 py-1"
                >
                  {showAll ? "Show less" : `Show all ${category.items.length}`}
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={category.id} className="space-y-1 mt-4">
        <div className="border-b border-gray-200 pb-1">
          <div className="text-sm font-semibold text-gray-900">
            {category.title}
          </div>
        </div>
        <div className="space-y-1">
          {visibleItems.map((item) => renderFilterItem(item, category.id))}
          {hasMore && (
            <button
              onClick={() => toggleShowAll(category.id)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2 py-1"
            >
              {showAll ? "Show less" : `Show all ${category.items.length}`}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Clear Filters Button */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <button
          onClick={onClearFilters}
          className="w-full text-blue-600 border border-blue-600 hover:bg-blue-50 text-sm h-8 rounded font-medium"
        >
          Clear all filters
        </button>
      </div>

      <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
        {/* Price Range */}
        <div className="space-y-1 mt-4">
          <div className="border-b border-gray-200 pb-1">
            <div className="text-sm font-semibold text-gray-900">
              Your budget (total stay)
            </div>
          </div>
          <div className="px-3 py-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={25000}
              step={100}
              className="mb-3"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>
                {formatPriceWithSymbol(priceRange[0], selectedCurrency.code)}
              </span>
              <span>
                {formatPriceWithSymbol(priceRange[1], selectedCurrency.code)}+
              </span>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        {filterCategories.map(renderFilterCategory)}
      </div>
    </div>
  );
}
