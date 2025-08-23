/**
 * Date utility functions for consistent date formatting across the application
 * Format: DD-MMM-YYYY (e.g., 04-May-1978)
 */

export const formatDateToDDMMMYYYY = (date: Date | string): string => {
  let dateObj: Date;

  if (typeof date === "string") {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  const day = dateObj.getDate().toString().padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatDateToDisplayString = (dateString: string): string => {
  if (!dateString) return "";

  // Handle various input formats
  try {
    const date = new Date(dateString);
    return formatDateToDDMMMYYYY(date);
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
};

export const getCurrentDateFormatted = (): string => {
  return formatDateToDDMMMYYYY(new Date());
};

export const addDaysToDate = (date: Date, days: number): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return formatDateToDDMMMYYYY(newDate);
};

// Convert DD-MMM-YYYY back to YYYY-MM-DD for input[type="date"]
export const convertToInputDate = (ddMmmYyyy: string): string => {
  if (!ddMmmYyyy) return "";

  try {
    const monthMap: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const parts = ddMmmYyyy.split("-");
    if (parts.length === 3) {
      const day = parts[0];
      const month = monthMap[parts[1]];
      const year = parts[2];

      if (month) {
        return `${year}-${month}-${day}`;
      }
    }

    return "";
  } catch (error) {
    return "";
  }
};

/**
 * Time utility functions for 24-hour format
 */

// Convert 12-hour AM/PM format to 24-hour format
export const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return "";

  try {
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = time12h.match(timeRegex);

    if (!match) return time12h; // Return as-is if not in expected format

    let [, hours, minutes, period] = match;
    let hour = parseInt(hours, 10);

    if (period.toUpperCase() === "AM") {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    return `${hour.toString().padStart(2, "0")}:${minutes}`;
  } catch (error) {
    return time12h;
  }
};

// Format current time in 24-hour format
export const getCurrentTime24Hour = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Validate 24-hour time format (HH:MM)
export const validate24HourTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};
