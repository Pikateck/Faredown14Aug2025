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
  X,
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
  type?: "checkbox" | "radio" | "range";
}

interface FilterItem {
  id: string;
  label: string;
  count?: number;
  popular?: boolean;
}

interface ComprehensiveFiltersProps {
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  selectedFilters: Record<string, string[]>;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export function ComprehensiveFilters({
  priceRange,
  setPriceRange,
  selectedFilters,
  setSelectedFilters,
  sortBy,
  setSortBy,
  onClearFilters,
  className,
}: ComprehensiveFiltersProps) {
  const { selectedCurrency } = useCurrency();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "budget",
    "popular",
    "deals",
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
      id: "deals",
      title: "Deals",
      defaultExpanded: true,
      items: [{ id: "all-deals", label: "All deals", count: 1102 }],
    },
    {
      id: "popular",
      title: "Popular filters",
      defaultExpanded: true,
      items: [
        {
          id: "wonderful-9",
          label: "Wonderful: 9+",
          count: 1593,
          popular: true,
        },
        { id: "no-prepayment", label: "No prepayment", count: 442 },
        { id: "swimming-pool", label: "Swimming pool", count: 5244 },
        { id: "free-cancellation", label: "Free cancellation", count: 4009 },
        { id: "5-stars", label: "5 stars", count: 799 },
        { id: "resorts", label: "Resorts", count: 59 },
        { id: "downtown-dubai", label: "Downtown Dubai", count: 1069 },
        { id: "private-pool", label: "Private pool", count: 2316 },
      ],
    },
    {
      id: "facilities",
      title: "Facilities",
      isCollapsible: true,
      items: [
        { id: "parking", label: "Parking", count: 5444 },
        { id: "restaurant", label: "Restaurant", count: 876 },
        { id: "room-service", label: "Room service", count: 800 },
        { id: "24h-front-desk", label: "24-hour front desk", count: 2021 },
        { id: "fitness-center", label: "Fitness center", count: 3388 },
        { id: "spa", label: "Spa", count: 1256 },
        { id: "bar", label: "Bar", count: 1845 },
        { id: "business-center", label: "Business center", count: 897 },
        { id: "concierge", label: "Concierge service", count: 567 },
        { id: "laundry", label: "Laundry service", count: 1234 },
        { id: "airport-shuttle", label: "Airport shuttle", count: 234 },
        { id: "free-wifi", label: "Free WiFi", count: 3421 },
        { id: "pet-friendly", label: "Pet friendly", count: 945 },
        { id: "non-smoking", label: "Non-smoking rooms", count: 2341 },
      ],
      maxVisible: 5,
    },
    {
      id: "meals",
      title: "Meals",
      isCollapsible: true,
      items: [
        { id: "kitchen-facilities", label: "Kitchen facilities", count: 5348 },
        { id: "breakfast-included", label: "Breakfast included", count: 627 },
        { id: "all-meals-included", label: "All meals included", count: 39 },
        { id: "all-inclusive", label: "All-inclusive", count: 20 },
        {
          id: "breakfast-lunch",
          label: "Breakfast & lunch included",
          count: 27,
        },
        {
          id: "breakfast-dinner",
          label: "Breakfast & dinner included",
          count: 236,
        },
      ],
    },
    {
      id: "property-type",
      title: "Property Type",
      isCollapsible: true,
      items: [
        { id: "entire-homes", label: "Entire homes & apartments", count: 5338 },
        { id: "apartments", label: "Apartments", count: 5060 },
        {
          id: "family-friendly",
          label: "Family-Friendly Properties",
          count: 1842,
        },
        { id: "hotels", label: "Hotels", count: 656 },
        { id: "villas", label: "Villas", count: 104 },
        { id: "vacation-homes", label: "Vacation Homes", count: 91 },
        { id: "resorts", label: "Resorts", count: 59 },
        { id: "homestays", label: "Homestays", count: 34 },
        { id: "guesthouses", label: "Guesthouses", count: 26 },
        { id: "boats", label: "Boats", count: 7 },
        { id: "luxury-tents", label: "Luxury tents", count: 3 },
        { id: "hostels", label: "Hostels", count: 1 },
        { id: "campgrounds", label: "Campgrounds", count: 1 },
        { id: "country-houses", label: "Country Houses", count: 1 },
        { id: "capsule-hotels", label: "Capsule Hotels", count: 1 },
      ],
      maxVisible: 8,
    },
    {
      id: "review-score",
      title: "Review score",
      isCollapsible: true,
      items: [
        { id: "wonderful-9", label: "Wonderful: 9+", count: 1593 },
        { id: "very-good-8", label: "Very Good: 8+", count: 2649 },
        { id: "good-7", label: "Good: 7+", count: 3193 },
        { id: "pleasant-6", label: "Pleasant: 6+", count: 3455 },
      ],
    },
    {
      id: "reservation-policy",
      title: "Reservation policy",
      isCollapsible: true,
      items: [
        { id: "free-cancellation", label: "Free cancellation", count: 4009 },
        {
          id: "book-without-card",
          label: "Book without credit card",
          count: 1,
        },
        { id: "no-prepayment", label: "No prepayment", count: 442 },
      ],
    },
    {
      id: "room-facilities",
      title: "Room facilities",
      isCollapsible: true,
      items: [
        { id: "private-pool", label: "Private pool", count: 2316 },
        { id: "sea-view", label: "Sea view", count: 858 },
        { id: "air-conditioning", label: "Air conditioning", count: 5799 },
        { id: "kitchen", label: "Kitchen/Kitchenette", count: 5348 },
        { id: "balcony", label: "Balcony", count: 4484 },
        { id: "terrace", label: "Terrace", count: 3291 },
        { id: "city-view", label: "City view", count: 2156 },
        { id: "garden-view", label: "Garden view", count: 1654 },
        { id: "mountain-view", label: "Mountain view", count: 987 },
        { id: "pool-view", label: "Pool view", count: 1123 },
      ],
      maxVisible: 5,
    },
    {
      id: "property-rating",
      title: "Property rating",
      isCollapsible: true,
      items: [
        { id: "1-star", label: "1 star", count: 31 },
        { id: "2-stars", label: "2 stars", count: 95 },
        { id: "3-stars", label: "3 stars", count: 424 },
        { id: "4-stars", label: "4 stars", count: 3644 },
        { id: "5-stars", label: "5 stars", count: 799 },
      ],
    },
    {
      id: "stay-location",
      title: "Preferred stay location",
      isCollapsible: true,
      items: [
        { id: "dubai-coastline", label: "Dubai's coastline", count: 2108 },
        { id: "near-dubai-mall", label: "Near Dubai mall", count: 1670 },
        {
          id: "nightlife-areas",
          label: "In lively nightlife areas",
          count: 3586,
        },
        { id: "beachfront-jbr", label: "Beachfront and JBR walk", count: 1550 },
        {
          id: "traditional-souks",
          label: "Traditional Souks and Old Dubai",
          count: 554,
        },
        { id: "iconic-landmarks", label: "Near iconic landmarks", count: 2193 },
        { id: "metro-stations", label: "Near metro stations", count: 3295 },
        {
          id: "family-attractions",
          label: "Near family attractions",
          count: 1936,
        },
        { id: "residential-areas", label: "In residential areas", count: 76 },
      ],
      maxVisible: 6,
    },
    {
      id: "brands",
      title: "Brands",
      isCollapsible: true,
      items: [
        { id: "millennium-hotels", label: "Millennium Hotels", count: 15 },
        { id: "jumeirah", label: "Jumeirah", count: 12 },
        { id: "rove-hotels", label: "ROVE Hotels", count: 10 },
        {
          id: "address-hotels",
          label: "The Address Hotels and Resorts",
          count: 8,
        },
        { id: "oyo-rooms", label: "OYO Rooms", count: 8 },
        { id: "movenpick", label: "Mövenpick", count: 8 },
        { id: "premier-inn", label: "Premier Inn", count: 7 },
        { id: "rotana-hotels", label: "Rotana Hotels & Resorts", count: 7 },
        { id: "marriott", label: "Marriott Hotels & Resorts", count: 6 },
        { id: "belvilla", label: "Belvilla", count: 6 },
      ],
      maxVisible: 10,
    },
    {
      id: "property-accessibility",
      title: "Property Accessibility",
      isCollapsible: true,
      items: [
        {
          id: "toilet-grab-rails",
          label: "Toilet with grab rails",
          count: 405,
        },
        { id: "raised-toilet", label: "Raised toilet", count: 268 },
        { id: "lowered-sink", label: "Lowered sink", count: 300 },
        {
          id: "bathroom-emergency",
          label: "Bathroom emergency cord",
          count: 268,
        },
        {
          id: "visual-aids-braille",
          label: "Visual aids (Braille)",
          count: 105,
        },
        {
          id: "visual-aids-tactile",
          label: "Visual aids (tactile signs)",
          count: 101,
        },
        { id: "auditory-guidance", label: "Auditory guidance", count: 88 },
      ],
    },
    {
      id: "room-accessibility",
      title: "Room Accessibility",
      isCollapsible: true,
      items: [
        {
          id: "ground-floor",
          label: "Entire unit located on ground floor",
          count: 167,
        },
        {
          id: "elevator-access",
          label: "Upper floors accessible by elevator",
          count: 1717,
        },
        {
          id: "wheelchair-accessible",
          label: "Entire unit wheelchair accessible",
          count: 1221,
        },
        {
          id: "toilet-grab-rails-room",
          label: "Toilet with grab rails",
          count: 190,
        },
        { id: "adapted-bath", label: "Adapted bath", count: 138 },
        { id: "roll-in-shower", label: "Roll-in shower", count: 204 },
        { id: "walk-in-shower", label: "Walk-in shower", count: 731 },
        { id: "raised-toilet-room", label: "Raised toilet", count: 193 },
        { id: "lower-sink-room", label: "Lower sink", count: 176 },
      ],
      maxVisible: 5,
    },
    {
      id: "neighborhood",
      title: "Neighborhood",
      isCollapsible: true,
      items: [
        { id: "beach-coast", label: "Beach & Coast", count: 2108 },
        { id: "downtown-dubai", label: "Downtown Dubai", count: 1069 },
        { id: "guests-favorite", label: "Guests' favorite area", count: 1084 },
        { id: "bur-dubai", label: "Bur Dubai", count: 337 },
        { id: "palm-jumeirah", label: "Palm Jumeirah", count: 440 },
        { id: "deira", label: "Deira", count: 217 },
        { id: "sheikh-zayed", label: "Sheikh Zayed Road", count: 601 },
        { id: "jumeirah-beach", label: "Jumeirah Beach Residence", count: 341 },
        { id: "dubai-marina", label: "Dubai Marina", count: 769 },
        { id: "old-dubai", label: "Old Dubai", count: 114 },
      ],
      maxVisible: 6,
    },
    {
      id: "distance-center",
      title: "Distance from center of Dubai",
      isCollapsible: true,
      items: [
        { id: "less-1km", label: "Less than 1 km", count: 1033 },
        { id: "less-3km", label: "Less than 3 km", count: 2151 },
        { id: "less-5km", label: "Less than 5 km", count: 2399 },
      ],
    },
    {
      id: "travel-group",
      title: "Travel group",
      isCollapsible: true,
      items: [
        { id: "pet-friendly", label: "Pet friendly", count: 945 },
        {
          id: "family-friendly",
          label: "Family-Friendly Properties",
          count: 1842,
        },
      ],
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

  const handleFilterChange = (
    categoryId: string,
    itemId: string,
    checked: boolean,
  ) => {
    const currentCategoryFilters = selectedFilters[categoryId] || [];

    if (checked) {
      setSelectedFilters({
        ...selectedFilters,
        [categoryId]: [...currentCategoryFilters, itemId],
      });
    } else {
      setSelectedFilters({
        ...selectedFilters,
        [categoryId]: currentCategoryFilters.filter((id) => id !== itemId),
      });
    }
  };

  const renderFilterItem = (item: FilterItem, categoryId: string) => {
    const isChecked = selectedFilters[categoryId]?.includes(item.id) || false;

    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-1 min-h-[28px]"
      >
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            id={`${categoryId}-${item.id}`}
            checked={isChecked}
            onCheckedChange={(checked) =>
              handleFilterChange(categoryId, item.id, checked as boolean)
            }
            className="w-4 h-4"
          />
          <label
            htmlFor={`${categoryId}-${item.id}`}
            className="text-sm text-gray-700 cursor-pointer flex-1 leading-tight"
          >
            {item.label}
            {item.popular && (
              <span className="ml-1 text-xs text-orange-600 bg-orange-100 px-1 py-0.5 rounded">
                Popular
              </span>
            )}
          </label>
        </div>
        {item.count && (
          <span className="text-xs text-gray-500 ml-2">{item.count}</span>
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
        <div key={category.id} className="border-b border-gray-200 py-4">
          <Collapsible
            open={isExpanded}
            onOpenChange={() => toggleSection(category.id)}
          >
            <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left">
              <h3 className="text-base font-semibold text-gray-900">
                {category.title}
              </h3>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="space-y-1">
                {visibleItems.map((item) =>
                  renderFilterItem(item, category.id),
                )}
                {hasMore && (
                  <button
                    onClick={() => toggleShowAll(category.id)}
                    className="text-blue-600 text-sm hover:underline mt-2 flex items-center gap-1"
                  >
                    {showAll ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Show all {category.items.length}
                      </>
                    )}
                  </button>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    return (
      <div key={category.id} className="border-b border-gray-200 py-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {category.title}
        </h3>
        <div className="space-y-1">
          {visibleItems.map((item) => renderFilterItem(item, category.id))}
          {hasMore && (
            <button
              onClick={() => toggleShowAll(category.id)}
              className="text-blue-600 text-sm hover:underline mt-2 flex items-center gap-1"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all {category.items.length}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  const getActiveFiltersCount = () => {
    return Object.values(selectedFilters).reduce(
      (total, filters) => total + filters.length,
      0,
    );
  };

  return (
    <div className={`bg-white ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter by:
          </h2>
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Sort by
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Your budget (total stay)
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {formatPriceWithSymbol(priceRange[0], selectedCurrency.code)}
              </span>
              <span>
                {formatPriceWithSymbol(priceRange[1], selectedCurrency.code)}+
              </span>
            </div>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={50000}
              min={0}
              step={500}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Filter Categories */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="px-4 pb-4">
          {filterCategories.map(renderFilterCategory)}
        </div>
      </ScrollArea>
    </div>
  );
}
