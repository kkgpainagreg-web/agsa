/**
 * AGSA - Admin Guru Super App
 * Calendar Service
 * 
 * Handles educational calendar operations
 */

const CalendarService = {
    cachedCalendar: null,

    /**
     * Get calendar for current tahun ajar
     * @param {boolean} forceRefresh 
     * @returns {Promise<Object|null>}
     */
    async getCalendar(forceRefresh = false) {
        try {
            if (this.cachedCalendar && !forceRefresh) {
                return this.cachedCalendar;
            }

            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();
            
            const doc = await DBService.read(COLLECTIONS.CALENDARS, userId);
            
            if (doc) {
                const tahunAjar = await ProfileService.getTahunAjarObj();
                const tahunAjarId = `${tahunAjar.tahunAwal}-${tahunAjar.tahunAkhir}`;
                
                this.cachedCalendar = doc.years?.[tahunAjarId] || null;
            }
            
            return this.cachedCalendar;
        } catch (error) {
            AGSAHelpers.error('Calendar', 'Failed to get calendar:', error);
            throw error;
        }
    },

    /**
     * Check if calendar exists
     * @returns {Promise<boolean>}
     */
    async hasCalendar() {
        const calendar = await this.getCalendar();
        return !!calendar;
    },

    /**
     * Initialize calendar with default values
     * @returns {Promise<Object>}
     */
    async initializeCalendar() {
        const tahunAjar = await ProfileService.getTahunAjarObj();
        const { tahunAwal, tahunAkhir } = tahunAjar;

        // Default semester dates
        const semester1 = {
            mulai: new Date(tahunAwal, 6, 15), // 15 Juli
            selesai: new Date(tahunAwal, 11, 20), // 20 Desember
            tanggalRapor: new Date(tahunAwal, 11, 23) // 23 Desember
        };

        const semester2 = {
            mulai: new Date(tahunAkhir, 0, 6), // 6 Januari
            selesai: new Date(tahunAkhir, 5, 20), // 20 Juni
            tanggalRapor: new Date(tahunAkhir, 5, 25) // 25 Juni
        };

        // Get national holidays for this year
        const hariLiburNasional = this.getDefaultHolidays(tahunAwal, tahunAkhir);

        // Get jenjang config for kelas akhir
        const jenjangConfig = await ProfileService.getJenjangConfig();
        const kelasAkhir = jenjangConfig.kelasAkhir || [];

        const calendarData = {
            tahunAjar: `${tahunAwal}/${tahunAkhir}`,
            tahunAwal,
            tahunAkhir,
            semester1,
            semester2,
            hariLiburNasional,
            liburLokal: [],
            liburCustom: [],
            kelasAkhirConfig: {
                semester2SelesaiLebihAwal: true,
                tanggalSelesai: new Date(tahunAkhir, 4, 15), // 15 Mei
                kelasAkhir
            }
        };

        await this.saveCalendar(calendarData);
        return calendarData;
    },

    /**
     * Save calendar
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async saveCalendar(data) {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();
            const tahunAjarId = `${data.tahunAwal}-${data.tahunAkhir}`;

            await DBService.set(COLLECTIONS.CALENDARS, userId, {
                years: {
                    [tahunAjarId]: {
                        ...data,
                        updatedAt: DBService.serverTimestamp()
                    }
                }
            });

            this.cachedCalendar = data;
            AGSAHelpers.log('Calendar', 'Calendar saved successfully');
        } catch (error) {
            AGSAHelpers.error('Calendar', 'Failed to save calendar:', error);
            throw error;
        }
    },

    /**
     * Update semester dates
     * @param {number} semester - 1 or 2
     * @param {Object} dates 
     * @returns {Promise<void>}
     */
    async updateSemester(semester, dates) {
        const calendar = await this.getCalendar();
        if (!calendar) {
            throw new Error('Kalender belum diinisialisasi');
        }

        const key = semester === 1 ? 'semester1' : 'semester2';
        calendar[key] = {
            ...calendar[key],
            ...dates
        };

        await this.saveCalendar(calendar);
    },

    /**
     * Add holiday
     * @param {Object} holiday 
     * @param {string} type - 'nasional', 'lokal', 'custom'
     * @returns {Promise<void>}
     */
    async addHoliday(holiday, type = 'custom') {
        const calendar = await this.getCalendar();
        if (!calendar) {
            throw new Error('Kalender belum diinisialisasi');
        }

        const holidayData = {
            id: AGSAHelpers.generateId('libur'),
            ...holiday,
            isDefault: false
        };

        switch (type) {
            case 'nasional':
                calendar.hariLiburNasional.push(holidayData);
                break;
            case 'lokal':
                calendar.liburLokal.push(holidayData);
                break;
            case 'custom':
            default:
                calendar.liburCustom.push(holidayData);
                break;
        }

        await this.saveCalendar(calendar);
    },

    /**
     * Remove holiday
     * @param {string} holidayId 
     * @param {string} type 
     * @returns {Promise<void>}
     */
    async removeHoliday(holidayId, type) {
        const calendar = await this.getCalendar();
        if (!calendar) return;

        const key = type === 'nasional' ? 'hariLiburNasional' : 
                    type === 'lokal' ? 'liburLokal' : 'liburCustom';

        calendar[key] = calendar[key].filter(h => h.id !== holidayId);
        await this.saveCalendar(calendar);
    },

    /**
     * Update holiday
     * @param {string} holidayId 
     * @param {Object} data 
     * @param {string} type 
     * @returns {Promise<void>}
     */
    async updateHoliday(holidayId, data, type) {
        const calendar = await this.getCalendar();
        if (!calendar) return;

        const key = type === 'nasional' ? 'hariLiburNasional' : 
                    type === 'lokal' ? 'liburLokal' : 'liburCustom';

        const index = calendar[key].findIndex(h => h.id === holidayId);
        if (index > -1) {
            calendar[key][index] = { ...calendar[key][index], ...data };
            await this.saveCalendar(calendar);
        }
    },

    /**
     * Get all holidays combined
     * @returns {Promise<Array>}
     */
    async getAllHolidays() {
        const calendar = await this.getCalendar();
        if (!calendar) return [];

        const holidays = [
            ...(calendar.hariLiburNasional || []).map(h => ({ ...h, jenis: 'nasional' })),
            ...(calendar.liburLokal || []).map(h => ({ ...h, jenis: 'lokal' })),
            ...(calendar.liburCustom || []).map(h => ({ ...h, jenis: 'custom' }))
        ];

        // Sort by date
        return holidays.sort((a, b) => {
            const dateA = a.tanggal || a.tanggalMulai;
            const dateB = b.tanggal || b.tanggalMulai;
            return new Date(dateA) - new Date(dateB);
        });
    },

    /**
     * Get holidays in date range
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Promise<Array>}
     */
    async getHolidaysInRange(startDate, endDate) {
        const holidays = await this.getAllHolidays();
        
        return holidays.filter(h => {
            const holidayStart = AGSADateUtils.toDate(h.tanggal || h.tanggalMulai);
            const holidayEnd = AGSADateUtils.toDate(h.tanggalSelesai || h.tanggal || h.tanggalMulai);
            
            return (holidayStart >= startDate && holidayStart <= endDate) ||
                   (holidayEnd >= startDate && holidayEnd <= endDate) ||
                   (holidayStart <= startDate && holidayEnd >= endDate);
        });
    },

    /**
     * Check if date is holiday
     * @param {Date} date 
     * @returns {Promise<Object|null>}
     */
    async isHoliday(date) {
        const holidays = await this.getAllHolidays();
        const targetDate = AGSADateUtils.startOfDay(date);

        for (const holiday of holidays) {
            const start = AGSADateUtils.startOfDay(holiday.tanggal || holiday.tanggalMulai);
            const end = AGSADateUtils.startOfDay(holiday.tanggalSelesai || holiday.tanggal || holiday.tanggalMulai);
            
            if (targetDate >= start && targetDate <= end) {
                return holiday;
            }
        }

        return null;
    },

    /**
     * Get effective weeks for semester
     * @param {number} semester 
     * @returns {Promise<Object>}
     */
    async getEffectiveWeeks(semester) {
        const calendar = await this.getCalendar();
        if (!calendar) {
            return { totalWeeks: 0, effectiveWeeks: 0, holidays: [] };
        }

        const semesterData = semester === 1 ? calendar.semester1 : calendar.semester2;
        const startDate = AGSADateUtils.toDate(semesterData.mulai);
        const endDate = AGSADateUtils.toDate(semesterData.selesai);

        const holidays = await this.getHolidaysInRange(startDate, endDate);
        const holidayDates = [];

        // Expand holiday ranges to individual dates
        holidays.forEach(h => {
            const start = AGSADateUtils.toDate(h.tanggal || h.tanggalMulai);
            const end = AGSADateUtils.toDate(h.tanggalSelesai || h.tanggal || h.tanggalMulai);
            
            let current = new Date(start);
            while (current <= end) {
                holidayDates.push(new Date(current));
                current = AGSADateUtils.addDays(current, 1);
            }
        });

        const calculation = AGSADateUtils.calculateEffectiveWeeks(startDate, endDate, holidayDates);

        return {
            ...calculation,
            holidays,
            semester,
            startDate,
            endDate
        };
    },

    /**
     * Get month data for calendar display
     * @param {number} year 
     * @param {number} month - 1-12
     * @returns {Promise<Object>}
     */
    async getMonthData(year, month) {
        const calendar = await this.getCalendar();
        const daysInMonth = AGSADateUtils.getDaysInMonth(year, month);
        const firstDay = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

        const days = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const holiday = await this.isHoliday(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            days.push({
                day,
                date,
                dayName: AGSADateUtils.getDayName(date, true),
                isWeekend,
                isHoliday: !!holiday,
                holiday,
                isToday: AGSADateUtils.isToday(date)
            });
        }

        // Determine which semester this month belongs to
        let semester = null;
        if (calendar) {
            const monthDate = new Date(year, month - 1, 15);
            const sem1Start = AGSADateUtils.toDate(calendar.semester1?.mulai);
            const sem1End = AGSADateUtils.toDate(calendar.semester1?.selesai);
            const sem2Start = AGSADateUtils.toDate(calendar.semester2?.mulai);
            const sem2End = AGSADateUtils.toDate(calendar.semester2?.selesai);

            if (sem1Start && sem1End && monthDate >= sem1Start && monthDate <= sem1End) {
                semester = 1;
            } else if (sem2Start && sem2End && monthDate >= sem2Start && monthDate <= sem2End) {
                semester = 2;
            }
        }

        return {
            year,
            month,
            monthName: AGSADateUtils.getMonthName(month),
            daysInMonth,
            firstDay,
            days,
            semester
        };
    },

    /**
     * Get default national holidays
     * @param {number} tahunAwal 
     * @param {number} tahunAkhir 
     * @returns {Array}
     */
    getDefaultHolidays(tahunAwal, tahunAkhir) {
        const holidays = [];
        const defaultHolidays = AGSA_CONSTANTS.LIBUR_NASIONAL_DEFAULT;

        defaultHolidays.forEach((holiday, index) => {
            if (!holiday.isFlexible && holiday.tanggal && holiday.bulan) {
                // Fixed date holidays
                const year = holiday.bulan >= 7 ? tahunAwal : tahunAkhir;
                holidays.push({
                    id: `default_${index}`,
                    tanggal: new Date(year, holiday.bulan - 1, holiday.tanggal),
                    nama: holiday.nama,
                    isDefault: true,
                    isFlexible: false
                });
            } else if (holiday.isFlexible) {
                // Flexible holidays (need manual date input)
                holidays.push({
                    id: `flex_${index}`,
                    tanggal: null,
                    nama: holiday.nama,
                    isDefault: true,
                    isFlexible: true,
                    needsDate: true
                });
            }
        });

        return holidays;
    },

    /**
     * Get last working day of month
     * @param {number} year 
     * @param {number} month 
     * @returns {Promise<Date>}
     */
    async getLastWorkingDay(year, month) {
        const holidays = await this.getAllHolidays();
        const holidayDates = holidays.map(h => 
            AGSADateUtils.startOfDay(h.tanggal || h.tanggalMulai)
        );

        return AGSADateUtils.getLastWorkingDayOfMonth(year, month, holidayDates);
    },

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedCalendar = null;
    }
};

// Export
window.CalendarService = CalendarService;

console.log('📅 Calendar Service loaded successfully');