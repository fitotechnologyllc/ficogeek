import { Timestamp } from "firebase/firestore";

/**
 * Safely formats a date from multiple possible sources (Firestore Timestamp, ISO String, or Date object)
 * to a standardized display format.
 */
export function formatDisplayDate(dateSource: any): string {
  if (!dateSource) return "N/A";

  try {
    // Handle Firestore Timestamp
    if (dateSource instanceof Timestamp || (typeof dateSource === 'object' && 'seconds' in dateSource)) {
      return new Date(dateSource.seconds * 1000).toLocaleDateString();
    }

    // Handle ISO String or numeric timestamp
    const date = new Date(dateSource);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  } catch (err) {
    console.warn("[utils] Failed to format date:", dateSource, err);
  }

  return "Invalid Date";
}
