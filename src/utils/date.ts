/**
 * Date formatting utilities
 */

/**
 * Format a date for display
 * 
 * @param date The date to format (Date object or ISO string)
 * @param options Formatting options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string {
  if (!date) return 'Not set';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error';
  }
}

/**
 * Format a time for display
 * 
 * @param time Time string in HH:MM format
 * @returns Formatted time string
 */
export function formatTime(time: string | undefined): string {
  if (!time) return 'Not set';
  
  try {
    // Validate time format (HH:MM)
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
      return time; // Return as is if not in expected format
    }
    
    const [hour, minute] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0);
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original time on error
  }
}

/**
 * Check if a date is in the past
 * 
 * @param date The date to check
 * @returns True if the date is in the past
 */
export function isPastDate(date: Date | string | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    // Set time to beginning of day for both dates for fair comparison
    const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return dateOnly < todayOnly;
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
}

/**
 * Check if a date is today
 * 
 * @param date The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | string | undefined): boolean {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    
    return (
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear()
    );
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
}
