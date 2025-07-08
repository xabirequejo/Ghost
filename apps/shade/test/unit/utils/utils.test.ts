import * as assert from 'assert/strict';
import {
    cn,
    debounce,
    kebabToPascalCase, 
    formatQueryDate, 
    formatDisplayDate, 
    formatNumber,
    formatDuration,
    formatPercentage,
    getRangeForStartDate
} from '@/lib/utils';
import moment from 'moment-timezone';
import {vi} from 'vitest';

describe('utils', function () {
    describe('cn function', function () {
        it('merges class names correctly', function () {
            const result = cn('class1', 'class2');
            assert.equal(result, 'class1 class2');
        });

        it('handles conditional classes', function () {
            const result = cn('class1', {
                class2: true,
                class3: false
            });
            assert.equal(result, 'class1 class2');
        });

        it('merges tailwind classes intelligently', function () {
            const result = cn('p-2 bg-red-500', 'p-4');
            assert.equal(result, 'bg-red-500 p-4');
        });
    });

    describe('debounce function', function () {
        beforeEach(function () {
            vi.useFakeTimers();
        });

        afterEach(function () {
            vi.restoreAllMocks();
        });

        it('delays function execution', function () {
            let counter = 0;
            const increment = () => {
                counter += 1;
            };
            
            const debouncedIncrement = debounce(increment, 100);
            
            debouncedIncrement();
            assert.equal(counter, 0, 'Function should not be called immediately');
            
            vi.advanceTimersByTime(150);
            assert.equal(counter, 1, 'Function should be called after the delay');
        });

        it('only calls the function once if called multiple times within the wait period', function () {
            let counter = 0;
            const increment = () => {
                counter += 1;
            };
            
            const debouncedIncrement = debounce(increment, 100);
            
            debouncedIncrement();
            debouncedIncrement();
            debouncedIncrement();
            
            assert.equal(counter, 0, 'Function should not be called immediately');
            
            vi.advanceTimersByTime(150);
            assert.equal(counter, 1, 'Function should only be called once');
        });

        it('calls the function immediately if immediate is true', function () {
            let counter = 0;
            const increment = () => {
                counter += 1;
            };
            
            const debouncedIncrement = debounce(increment, 100, true);
            
            debouncedIncrement();
            assert.equal(counter, 1, 'Function should be called immediately');
        });
    });

    describe('kebabToPascalCase function', function () {
        it('converts kebab-case to PascalCase', function () {
            const result = kebabToPascalCase('hello-world');
            assert.equal(result, 'HelloWorld');
        });

        it('handles multiple hyphens', function () {
            const result = kebabToPascalCase('hello-beautiful-world');
            assert.equal(result, 'HelloBeautifulWorld');
        });

        it('handles uppercase letters', function () {
            const result = kebabToPascalCase('hello-World');
            assert.equal(result, 'HelloWorld');
        });

        it('handles numbers', function () {
            const result = kebabToPascalCase('hello-world-123');
            assert.equal(result, 'HelloWorld123');
        });

        it('handles underscore too', function () {
            const result = kebabToPascalCase('hello_world');
            assert.equal(result, 'HelloWorld');
        });
    });

    describe('formatQueryDate function', function () {
        it('formats a moment date for queries', function () {
            const date = moment('2023-04-15');
            const formattedDate = formatQueryDate(date);
            assert.equal(formattedDate, '2023-04-15');
        });
    });

    describe('formatDisplayDate function', function () {
        it('formats a date string to display format', function () {
            // Using a predefined date for testing, bypassing the current date check
            // Test different year formatting without mocking Date
            const differentYearFormatted = formatDisplayDate('2020-12-31');
            assert.equal(differentYearFormatted, '31 Dec 2020');
        });
    });

    describe('formatNumber function', function () {
        it('formats a number with thousand separators', function () {
            let formatted = formatNumber(1000);
            assert.equal(formatted, '1,000');
            
            formatted = formatNumber(1234567);
            assert.equal(formatted, '1,234,567');
            
            formatted = formatNumber(1234.56);
            assert.equal(formatted, '1,235'); // Should round
        });
    });

    describe('formatDuration function', function () {
        it('formats duration in seconds properly', function () {
            // Only seconds
            let formatted = formatDuration(45);
            assert.equal(formatted, '45s');
            
            // Minutes and seconds
            formatted = formatDuration(65);
            assert.equal(formatted, '1m 5s');
            
            // Hours, minutes, and seconds
            formatted = formatDuration(3665);
            assert.equal(formatted, '1h 1m 5s');
        });
        
        it('handles edge cases correctly', function () {
            // Zero values in various positions
            let formatted = formatDuration(3600);
            assert.equal(formatted, '1h 0m 0s');
            
            formatted = formatDuration(60);
            assert.equal(formatted, '1m 0s');
        });
    });

    describe('formatPercentage function', function () {
        it('formats a decimal as a percentage', function () {
            let formatted = formatPercentage(0.123);
            assert.equal(formatted, '12%');
            
            formatted = formatPercentage(0.789);
            assert.equal(formatted, '79%');
            
            formatted = formatPercentage(1);
            assert.equal(formatted, '100%');
        });
    });

    describe('getRangeForStartDate function', function () {
        beforeEach(function () {
            vi.useFakeTimers();
        });

        afterEach(function () {
            vi.restoreAllMocks();
        });

        it('demonstrates timezone issue with multi-day spans', function () {
            // Mock current time: 2024-01-12T07:00:00Z (UTC)
            // In UTC+8 timezone, this is 2024-01-12T15:00:00 (local)
            const mockCurrentTime = new Date('2024-01-12T07:00:00Z');
            vi.setSystemTime(mockCurrentTime);

            // Mock user's timezone to UTC+8
            vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
                timeZone: 'Asia/Shanghai',
                locale: 'en-US',
                calendar: 'gregory',
                numberingSystem: 'latn'
            });

            // Post published: 2024-01-10T08:00:00Z (UTC)
            // In UTC+8 timezone, this is 2024-01-10T16:00:00 (local)
            const publishedAt = '2024-01-10T08:00:00Z';

            // Current implementation (raw time difference)
            const currentResult = getRangeForStartDate(publishedAt);
            
            // Expected behavior: calendar days in user's timezone
            // Published: Jan 10th (local), Current: Jan 12th (local) = 3 days
            const expectedResult = 3;

            // The current implementation calculates ~1.96 days = Math.ceil(1.96) = 2
            // But it should be 3 calendar days in the user's timezone
            assert.equal(currentResult, 2, 'Current implementation returns 2 days (incorrect)');
            
            // This test demonstrates the bug - we expect 3 days but get 2
            assert.notEqual(currentResult, expectedResult, 'Current implementation does not match expected calendar days');
        });

        it('demonstrates same-day scenario is handled correctly', function () {
            // Mock current time: 2024-01-15T07:00:00Z (UTC)
            const mockCurrentTime = new Date('2024-01-15T07:00:00Z');
            vi.setSystemTime(mockCurrentTime);

            // Post published: 2024-01-15T06:00:00Z (UTC) - 1 hour ago
            const publishedAt = '2024-01-15T06:00:00Z';

            const result = getRangeForStartDate(publishedAt);
            
            // Math.max(diffInDays, 1) ensures minimum of 1 day
            assert.equal(result, 1, 'Same-day scenario returns 1 day (correct)');
        });

        it('shows the correct timezone-aware calculation', function () {
            // Mock current time: 2024-01-12T07:00:00Z (UTC)
            const mockCurrentTime = new Date('2024-01-12T07:00:00Z');
            vi.setSystemTime(mockCurrentTime);

            // Mock user's timezone to UTC+8
            vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue({
                timeZone: 'Asia/Shanghai',
                locale: 'en-US',
                calendar: 'gregory',
                numberingSystem: 'latn'
            });

            const publishedAt = '2024-01-10T08:00:00Z';

            // This is how it SHOULD be calculated:
            const timezone = 'Asia/Shanghai';
            const publishedDate = moment.tz(publishedAt, timezone).startOf('day');
            const today = moment.tz(timezone).startOf('day');
            const correctDiff = today.diff(publishedDate, 'days') + 1;

            assert.equal(correctDiff, 3, 'Correct timezone-aware calculation returns 3 days');
            
            // Compare with current (broken) implementation
            const currentResult = getRangeForStartDate(publishedAt);
            assert.equal(currentResult, 2, 'Current implementation returns 2 days');
            
            assert.notEqual(currentResult, correctDiff, 'Current implementation differs from correct calculation');
        });
    });
}); 