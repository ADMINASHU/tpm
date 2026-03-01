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
 * Format a date string or Date object to IST date + time
 * e.g. "01 Mar 2026, 09:30 PM IST"
 */
export function formatDateTimeIST(date) {
    return new Date(date).toLocaleString(IST_LOCALE, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: IST_TIMEZONE,
        timeZoneName: "short",
    });
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
