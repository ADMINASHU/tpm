/**
 * IST Date Utility — All date formatting across the app uses this.
 * IST = UTC+5:30
 */

const IST_LOCALE = "en-IN";
const IST_TIMEZONE = "Asia/Kolkata";

/**
 * Format a date string or Date object to IST date only
 * e.g. "01 Mar 2026"
 */
export function formatDateIST(date) {
    return new Date(date).toLocaleDateString(IST_LOCALE, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: IST_TIMEZONE,
    });
}

/**
 * Get YYYY-MM-DD string in IST timezone
 * Useful for <input type="date" /> values to avoid UTC day-shift
 */
export function getISODateIST(date = new Date()) {
    return new Date(date).toLocaleDateString("en-CA", {
        timeZone: IST_TIMEZONE,
    });
}

/**
 * Format a date string or Date object to IST time only
 * e.g. "09:30 PM"
 */
export function formatTimeIST(date) {
    return new Date(date).toLocaleTimeString(IST_LOCALE, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: IST_TIMEZONE,
    });
}

/**
 * Format a date string or Date object to IST date + time
 * e.g. "01 Mar 2026, 09:30 PM"
 */
export function formatDateTimeIST(date) {
    if (!date) return "N/A";
    const d = new Date(date);
    return `${formatDateIST(d)}, ${formatTimeIST(d)}`;
}

/**
 * IST Current Date — for displaying today
 */
export function todayIST() {
    return formatDateIST(new Date());
}

/**
 * Full year in IST for copyright
 */
export function currentYearIST() {
    return new Date().toLocaleDateString(IST_LOCALE, {
        year: "numeric",
        timeZone: IST_TIMEZONE,
    });
}

/**
 * Get current Date object shifted to IST
 * Use this for server-side logic that needs to know "local" year/month/day
 */
export function getCurrentISTDate() {
    const now = new Date();
    // Use Intl to get IST parts to be super accurate, or just manually offset
    // Manual offset is simpler for "current month/year" logic
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
}
