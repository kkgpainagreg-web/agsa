/**
 * AGSA - Admin Guru Super App
 * Date Utility Functions
 * 
 * Semua operasi tanggal menggunakan utility ini
 */

const AGSADateUtils = {
    /**
     * Format date to Indonesian format
     * @param {Date|string|number} date 
     * @param {string} format - 'full', 'long', 'medium', 'short'
     * @returns {string}
     */
    format(date, format = 'long') {
        const d = this.toDate(date);
        if (!d) return '-';

        const options = {
            full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            long: { day: 'numeric', month: 'long', year: 'numeric' },
            medium: { day: 'numeric', month: 'short', year: 'numeric' },
            short: { day: '2-digit', month: '2-digit', year: 'numeric' }
        };

        return d.toLocaleDateString('id-ID', options[format] || options.long);
    },

    /**
     * Format date to input format (YYYY-MM-DD)
     * @param {Date|string|number} date 
     * @returns {string}
     */
    formatInput(date) {
        const d = this.toDate(date);
        if (!d) return '';
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    },

    /**
     * Format time
     * @param {Date|string} date 
     * @param {boolean} withSeconds 
     * @returns {string}
     */
    formatTime(date, withSeconds = false) {
        const d = this.toDate(date);
        if (!d) return '-';
        
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return withSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    },

    /**
     * Convert to Date object
     * @param {Date|string|number|Object} date - Date, string, timestamp, or Firestore timestamp
     * @returns {Date|null}
     */
    toDate(date) {
        if (!date) return null;
        if (date instanceof Date) return date;
        if (typeof date === 'number') return new Date(date);
        if (typeof date === 'string') return new Date(date);
        // Firestore Timestamp
        if (date.toDate && typeof date.toDate === 'function') return date.toDate();
        if (date.seconds) return new Date(date.seconds * 1000);
        return null;
    },

    /**
     * Get day name in Indonesian
     * @param {Date|string|number} date 
     * @param {boolean} short 
     * @returns {string}
     */
    getDayName(date, short = false) {
        const d = this.toDate(date);
        if (!d) return '-';
        
        const days = short 
            ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
            : ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        
        return days[d.getDay()];
    },

    /**
     * Get month name in Indonesian
     * @param {number} month - 1-12 or 0-11
     * @param {boolean} short 
     * @param {boolean} zeroIndexed 
     * @returns {string}
     */
    getMonthName(month, short = false, zeroIndexed = false) {
        const index = zeroIndexed ? month : month - 1;
        const months = short
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
            : ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        return months[index] || '';
    },

    /**
     * Get start of day
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    startOfDay(date) {
        const d = this.toDate(date) || new Date();
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    },

    /**
     * Get end of day
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    endOfDay(date) {
        const d = this.toDate(date) || new Date();
        return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    },

    /**
     * Get start of week (Monday)
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    startOfWeek(date) {
        const d = this.toDate(date) || new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
    },

    /**
     * Get end of week (Sunday)
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    endOfWeek(date) {
        const start = this.startOfWeek(date);
        return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
    },

    /**
     * Get start of month
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    startOfMonth(date) {
        const d = this.toDate(date) || new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    },

    /**
     * Get end of month
     * @param {Date|string|number} date 
     * @returns {Date}
     */
    endOfMonth(date) {
        const d = this.toDate(date) || new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    },

    /**
     * Get days in month
     * @param {number} year 
     * @param {number} month - 1-12
     * @returns {number}
     */
    getDaysInMonth(year, month) {
        return new Date(year, month, 0).getDate();
    },

    /**
     * Add days to date
     * @param {Date|string|number} date 
     * @param {number} days 
     * @returns {Date}
     */
    addDays(date, days) {
        const d = this.toDate(date) || new Date();
        const result = new Date(d);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Add weeks to date
     * @param {Date|string|number} date 
     * @param {number} weeks 
     * @returns {Date}
     */
    addWeeks(date, weeks) {
        return this.addDays(date, weeks * 7);
    },

    /**
     * Add months to date
     * @param {Date|string|number} date 
     * @param {number} months 
     * @returns {Date}
     */
    addMonths(date, months) {
        const d = this.toDate(date) || new Date();
        const result = new Date(d);
        result.setMonth(result.getMonth() + months);
        return result;
    },

    /**
     * Difference between two dates in days
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {number}
     */
    diffInDays(date1, date2) {
        const d1 = this.startOfDay(date1);
        const d2 = this.startOfDay(date2);
        const diff = Math.abs(d2 - d1);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    },

    /**
     * Difference between two dates in weeks
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {number}
     */
    diffInWeeks(date1, date2) {
        return Math.floor(this.diffInDays(date1, date2) / 7);
    },

    /**
     * Check if date is same day
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {boolean}
     */
    isSameDay(date1, date2) {
        const d1 = this.toDate(date1);
        const d2 = this.toDate(date2);
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    },

    /**
     * Check if date is same month
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {boolean}
     */
    isSameMonth(date1, date2) {
        const d1 = this.toDate(date1);
        const d2 = this.toDate(date2);
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth();
    },

    /**
     * Check if date is today
     * @param {Date|string|number} date 
     * @returns {boolean}
     */
    isToday(date) {
        return this.isSameDay(date, new Date());
    },

    /**
     * Check if date is before another date
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {boolean}
     */
    isBefore(date1, date2) {
        const d1 = this.toDate(date1);
        const d2 = this.toDate(date2);
        if (!d1 || !d2) return false;
        return d1 < d2;
    },

    /**
     * Check if date is after another date
     * @param {Date|string|number} date1 
     * @param {Date|string|number} date2 
     * @returns {boolean}
     */
    isAfter(date1, date2) {
        const d1 = this.toDate(date1);
        const d2 = this.toDate(date2);
        if (!d1 || !d2) return false;
        return d1 > d2;
    },

    /**
     * Check if date is between two dates
     * @param {Date|string|number} date 
     * @param {Date|string|number} start 
     * @param {Date|string|number} end 
     * @param {boolean} inclusive 
     * @returns {boolean}
     */
    isBetween(date, start, end, inclusive = true) {
        const d = this.toDate(date);
        const s = this.toDate(start);
        const e = this.toDate(end);
        if (!d || !s || !e) return false;
        
        if (inclusive) {
            return d >= s && d <= e;
        }
        return d > s && d < e;
    },

    /**
     * Check if date is weekend
     * @param {Date|string|number} date 
     * @returns {boolean}
     */
    isWeekend(date) {
        const d = this.toDate(date);
        if (!d) return false;
        const day = d.getDay();
        return day === 0 || day === 6;
    },

    /**
     * Check if date is weekday
     * @param {Date|string|number} date 
     * @returns {boolean}
     */
    isWeekday(date) {
        return !this.isWeekend(date);
    },

    /**
     * Get week number in year
     * @param {Date|string|number} date 
     * @returns {number}
     */
    getWeekNumber(date) {
        const d = this.toDate(date) || new Date();
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    },

    /**
     * Get week number in month
     * @param {Date|string|number} date 
     * @returns {number}
     */
    getWeekOfMonth(date) {
        const d = this.toDate(date) || new Date();
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
        return Math.ceil((d.getDate() + firstDay) / 7);
    },

    /**
     * Get all dates in a month
     * @param {number} year 
     * @param {number} month - 1-12
     * @returns {Date[]}
     */
    getDatesInMonth(year, month) {
        const dates = [];
        const daysInMonth = this.getDaysInMonth(year, month);
        
        for (let day = 1; day <= daysInMonth; day++) {
            dates.push(new Date(year, month - 1, day));
        }
        
        return dates;
    },

    /**
     * Get weekdays in a month
     * @param {number} year 
     * @param {number} month - 1-12
     * @param {number[]} weekdays - Array of day indices (0=Sunday, 1=Monday, etc.)
     * @returns {Date[]}
     */
    getWeekdaysInMonth(year, month, weekdays = [1, 2, 3, 4, 5]) {
        const dates = this.getDatesInMonth(year, month);
        return dates.filter(d => weekdays.includes(d.getDay()));
    },

    /**
     * Get specific day occurrences in a month
     * @param {number} year 
     * @param {number} month - 1-12
     * @param {number} dayIndex - 0=Sunday, 1=Monday, etc.
     * @returns {Date[]}
     */
    getDayOccurrencesInMonth(year, month, dayIndex) {
        const dates = this.getDatesInMonth(year, month);
        return dates.filter(d => d.getDay() === dayIndex);
    },

    /**
     * Calculate effective weeks between two dates
     * @param {Date|string|number} start 
     * @param {Date|string|number} end 
     * @param {Date[]} holidays - Array of holiday dates
     * @returns {Object} { totalDays, totalWeeks, effectiveWeeks, holidayCount }
     */
    calculateEffectiveWeeks(start, end, holidays = []) {
        const startDate = this.startOfDay(start);
        const endDate = this.endOfDay(end);
        
        if (!startDate || !endDate) {
            return { totalDays: 0, totalWeeks: 0, effectiveWeeks: 0, holidayCount: 0 };
        }

        const totalDays = this.diffInDays(startDate, endDate) + 1;
        const totalWeeks = Math.ceil(totalDays / 7);
        
        // Count holidays that fall on weekdays
        const holidayDates = holidays.map(h => this.startOfDay(h));
        let holidayCount = 0;
        
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (!this.isWeekend(currentDate)) {
                const isHoliday = holidayDates.some(h => this.isSameDay(h, currentDate));
                if (isHoliday) holidayCount++;
            }
            currentDate = this.addDays(currentDate, 1);
        }
        
        // Calculate effective days (excluding weekends and holidays)
        let effectiveDays = 0;
        currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            if (!this.isWeekend(currentDate)) {
                const isHoliday = holidayDates.some(h => this.isSameDay(h, currentDate));
                if (!isHoliday) effectiveDays++;
            }
            currentDate = this.addDays(currentDate, 1);
        }
        
        const effectiveWeeks = Math.ceil(effectiveDays / 5); // 5 weekdays per week
        
        return {
            totalDays,
            totalWeeks,
            effectiveDays,
            effectiveWeeks,
            holidayCount
        };
    },

    /**
     * Get last working day of month (not weekend, not holiday)
     * @param {number} year 
     * @param {number} month - 1-12
     * @param {Date[]} holidays 
     * @returns {Date}
     */
    getLastWorkingDayOfMonth(year, month, holidays = []) {
        const endOfMonth = this.endOfMonth(new Date(year, month - 1, 1));
        const holidayDates = holidays.map(h => this.startOfDay(h));
        
        let date = new Date(endOfMonth);
        while (this.isWeekend(date) || holidayDates.some(h => this.isSameDay(h, date))) {
            date = this.addDays(date, -1);
        }
        
        return date;
    },

    /**
     * Parse time string to minutes
     * @param {string} timeStr - Format "HH:mm"
     * @returns {number} Total minutes
     */
    timeToMinutes(timeStr) {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 60) + minutes;
    },

    /**
     * Convert minutes to time string
     * @param {number} minutes 
     * @returns {string} Format "HH:mm"
     */
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    },

    /**
     * Add minutes to time string
     * @param {string} timeStr - Format "HH:mm"
     * @param {number} minutesToAdd 
     * @returns {string}
     */
    addMinutesToTime(timeStr, minutesToAdd) {
        const totalMinutes = this.timeToMinutes(timeStr) + minutesToAdd;
        return this.minutesToTime(totalMinutes);
    },

    /**
     * Relative time (e.g., "2 jam yang lalu")
     * @param {Date|string|number} date 
     * @returns {string}
     */
    relativeTime(date) {
        const d = this.toDate(date);
        if (!d) return '-';
        
        const now = new Date();
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
        
        if (seconds < 60) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit yang lalu`;
        if (hours < 24) return `${hours} jam yang lalu`;
        if (days < 7) return `${days} hari yang lalu`;
        if (weeks < 4) return `${weeks} minggu yang lalu`;
        if (months < 12) return `${months} bulan yang lalu`;
        return `${years} tahun yang lalu`;
    }
};

// Export
window.AGSADateUtils = AGSADateUtils;

console.log('📅 Date Utils loaded successfully');