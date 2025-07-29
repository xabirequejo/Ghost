import {formatDisplayDate as shadeFormatDisplayDate} from '@tryghost/shade';

/**
 * Safe wrapper for formatDisplayDate that handles invalid dates
 * This helps debug production issues where date formatting fails
 */
export const safeFormatDisplayDate = (dateString: string | undefined | null, componentName?: string): string => {
    if (!dateString || dateString === '') {
        // eslint-disable-next-line no-console
        console.warn(`[STATS DATE WARNING] ${componentName || 'Unknown'}: No date provided`, {
            dateString,
            type: typeof dateString
        });
        return '';
    }

    try {
        // First check if the date string is valid
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // eslint-disable-next-line no-console
            console.error(`[STATS DATE ERROR] ${componentName || 'Unknown'}: Invalid date value`, {
                dateString,
                type: typeof dateString,
                value: dateString
            });
            return 'Invalid date';
        }

        // Use the Shade library's formatDisplayDate
        return shadeFormatDisplayDate(dateString);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[STATS DATE ERROR] ${componentName || 'Unknown'}: Failed to format date`, {
            dateString,
            type: typeof dateString,
            error
        });
        return 'Invalid date';
    }
};