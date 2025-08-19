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
        className="flex items-center justify-between py-0.5 min-h-[24px]"
      >
        <div className="flex items-center gap-1.5 flex-1">
          <button
            type="button"
            onClick={() => handleFilterChange(item.id, !isChecked)}
            className={`w-4 h-4 flex items-center justify-center ${
              isChecked ? "bg-blue-600" : "bg-white border border-gray-400"
            }`}
          >
            {isChecked && (
              <svg
                className="w-2.5 h-2.5 text-white"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
              </svg>
            )}
          </button>
          <label
            onClick={() => handleFilterChange(item.id, !isChecked)}
            className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight"
          >
            {item.label}
          </label>
        </div>
        {item.count && (
          <span className="text-xs text-gray-500 ml-1">{item.count}</span>
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
        <div key={category.id} className="border-b border-gray-200 pb-1">
          <button
            onClick={() => toggleSection(category.id)}
            className="flex w-full items-center justify-between py-1 text-left"
          >
            <h3 className="text-sm font-semibold text-gray-900">
              {category.title}
            </h3>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-0">
              {visibleItems.map((item) => renderFilterItem(item, category.id))}
              {hasMore && (
                <button
                  onClick={() => toggleShowAll(category.id)}
                  className="text-blue-600 text-xs hover:underline mt-1"
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
      <div key={category.id} className="border-b border-gray-200 pb-1">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          {category.title}
        </h3>
        <div className="space-y-0">
          {visibleItems.map((item) => renderFilterItem(item, category.id))}
          {hasMore && (
            <button
              onClick={() => toggleShowAll(category.id)}
              className="text-blue-600 text-xs hover:underline mt-1"
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
      {/* Price Range */}
      <div className="border-b border-gray-200 pb-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Your budget (per night)
        </h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={10000}
            step={100}
            className="mb-2"
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
      <div className="space-y-1">
        {filterCategories.map(renderFilterCategory)}
      </div>

      {/* Clear Filters */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 text-sm h-8"
        >
          Clear all filters
        </Button>
      </div>
    </div>
  );
}
