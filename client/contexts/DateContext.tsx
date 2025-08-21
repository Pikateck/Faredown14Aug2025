import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { addDays, format } from "date-fns";

interface DateContextType {
  departureDate: Date | null;
  returnDate: Date | null;
  tripType: "round-trip" | "one-way" | "multi-city";
  setDepartureDate: (date: Date | null) => void;
  setReturnDate: (date: Date | null) => void;
  setTripType: (type: "round-trip" | "one-way" | "multi-city") => void;
  setDateRange: (departure: Date | null, returnDate?: Date | null) => void;
  formatDisplayDate: (date: Date | null, format?: string) => string;
  getUrlDateString: (date: Date | null) => string;
  loadDatesFromParams: (searchParams: URLSearchParams) => void;
  getSearchParams: () => URLSearchParams;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider");
  }
  return context;
};

interface DateProviderProps {
  children: React.ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [tripType, setTripType] = useState<
    "round-trip" | "one-way" | "multi-city"
  >("round-trip");

  // Initialize with default dates if none are set
  useEffect(() => {
    if (!departureDate) {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      setDepartureDate(tomorrow);

      if (tripType === "round-trip" && !returnDate) {
        setReturnDate(addDays(tomorrow, 3));
      }
    }
  }, [departureDate, returnDate, tripType]);

  const setDateRange = useCallback(
    (departure: Date | null, returnDate?: Date | null) => {
      setDepartureDate(departure);
      if (tripType === "round-trip" && returnDate) {
        setReturnDate(returnDate);
      } else if (tripType === "one-way") {
        setReturnDate(null);
      }
    },
    [tripType],
  );

  const formatDisplayDate = useCallback(
    (date: Date | null, formatString: string = "EEE, MMM d") => {
      if (!date) return "";
      try {
        return format(date, formatString);
      } catch (error) {
        console.error("Date formatting error:", error);
        return "";
      }
    },
    [],
  );

  const getUrlDateString = useCallback((date: Date | null) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  }, []);

  const loadDatesFromParams = useCallback(
    (searchParams: URLSearchParams) => {
      const departureParam = searchParams.get("departureDate");
      const returnParam = searchParams.get("returnDate");
      const tripTypeParam = searchParams.get("tripType");

      console.log('📅 DateContext loading dates from params:', {
        departureParam,
        returnParam,
        tripTypeParam
      });

      if (departureParam) {
        try {
          // Parse date as local time to avoid timezone issues
          const departureDateObj = new Date(departureParam + 'T00:00:00');
          if (!isNaN(departureDateObj.getTime())) {
            console.log('📅 Setting departure date:', departureDateObj.toDateString());
            setDepartureDate(departureDateObj);
          }
        } catch (error) {
          console.error("Invalid departure date in URL:", departureParam);
        }
      }

      if (returnParam && (tripType === "round-trip" || tripTypeParam === "round-trip" || tripTypeParam === "round_trip")) {
        try {
          // Parse date as local time to avoid timezone issues
          const returnDateObj = new Date(returnParam + 'T00:00:00');
          if (!isNaN(returnDateObj.getTime())) {
            console.log('📅 Setting return date:', returnDateObj.toDateString());
            setReturnDate(returnDateObj);
          }
        } catch (error) {
          console.error("Invalid return date in URL:", returnParam);
        }
      }

      if (
        tripTypeParam &&
        ["round-trip", "one-way", "multi-city", "round_trip", "one_way", "multi_city"].includes(tripTypeParam)
      ) {
        const normalizedTripType = tripTypeParam.replace("_", "-") as "round-trip" | "one-way" | "multi-city";
        setTripType(normalizedTripType);
      }
    },
    [tripType],
  );

  const getSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    if (departureDate) {
      params.set("departureDate", getUrlDateString(departureDate));
    }

    if (returnDate && tripType === "round-trip") {
      params.set("returnDate", getUrlDateString(returnDate));
    }

    params.set("tripType", tripType);

    return params;
  }, [departureDate, returnDate, tripType, getUrlDateString]);

  const value: DateContextType = {
    departureDate,
    returnDate,
    tripType,
    setDepartureDate,
    setReturnDate,
    setTripType,
    setDateRange,
    formatDisplayDate,
    getUrlDateString,
    loadDatesFromParams,
    getSearchParams,
  };

  return <DateContext.Provider value={value}>{children}</DateContext.Provider>;
};
