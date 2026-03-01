/**
 * AGSA - Admin Guru Super App
 * Schedule Service
 * 
 * Handles lesson schedule operations
 */

const ScheduleService = {
    cachedSchedule: null,

    /**
     * Get schedule
     * @param {boolean} forceRefresh 
     * @returns {Promise<Object|null>}
     */
    async getSchedule(forceRefresh = false) {
        try {
            if (this.cachedSchedule && !forceRefresh) {
                return this.cachedSchedule;
            }

            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();
            
            this.cachedSchedule = await DBService.read(COLLECTIONS.SCHEDULES, userId);
            return this.cachedSchedule;
        } catch (error) {
            AGSAHelpers.error('Schedule', 'Failed to get schedule:', error);
            throw error;
        }
    },

    /**
     * Check if schedule exists
     * @returns {Promise<boolean>}
     */
    async hasSchedule() {
        const schedule = await this.getSchedule();
        return !!schedule && Object.keys(schedule.jadwal || {}).length > 0;
    },

    /**
     * Initialize schedule with default time slots
     * @returns {Promise<Object>}
     */
    async initializeSchedule() {
        const jenjangConfig = await ProfileService.getJenjangConfig();
        const durasiJam = jenjangConfig.durasiJam || 40;
        const tahunAjar = await ProfileService.getTahunAjar();

        // Default time slots (8 periods)
        const durasiJamConfig = {};
        let currentTime = 7 * 60; // 07:00 in minutes

        for (let i = 1; i <= 10; i++) {
            const mulai = AGSADateUtils.minutesToTime(currentTime);
            const selesai = AGSADateUtils.minutesToTime(currentTime + durasiJam);
            
            durasiJamConfig[i] = {
                mulai,
                selesai,
                durasi: durasiJam
            };
            
            currentTime += durasiJam;
            
            // Add break after period 3 (15 min) and period 6 (15 min)
            if (i === 3 || i === 6) {
                currentTime += 15;
            }
        }

        const scheduleData = {
            tahunAjar,
            durasiJam: durasiJamConfig,
            istirahat: [
                { setelahJam: 3, durasi: 15, mulai: '09:15', selesai: '09:30' },
                { setelahJam: 6, durasi: 15, mulai: '11:30', selesai: '11:45' }
            ],
            jadwal: {},
            mapelDiajar: []
        };

        await this.saveSchedule(scheduleData);
        return scheduleData;
    },

    /**
     * Save schedule
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async saveSchedule(data) {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();

            await DBService.set(COLLECTIONS.SCHEDULES, userId, {
                ...data,
                updatedAt: DBService.serverTimestamp()
            });

            this.cachedSchedule = data;
            AGSAHelpers.log('Schedule', 'Schedule saved successfully');
        } catch (error) {
            AGSAHelpers.error('Schedule', 'Failed to save schedule:', error);
            throw error;
        }
    },

    /**
     * Update time slot duration
     * @param {Object} durasiJam 
     * @returns {Promise<void>}
     */
    async updateDurasiJam(durasiJam) {
        const schedule = await this.getSchedule() || await this.initializeSchedule();
        schedule.durasiJam = durasiJam;
        await this.saveSchedule(schedule);
    },

    /**
     * Update breaks
     * @param {Array} istirahat 
     * @returns {Promise<void>}
     */
    async updateIstirahat(istirahat) {
        const schedule = await this.getSchedule() || await this.initializeSchedule();
        schedule.istirahat = istirahat;
        await this.saveSchedule(schedule);
    },

    /**
     * Set schedule for a class on a day
     * @param {string} hari - 'senin', 'selasa', etc.
     * @param {string} kelasRombel - '7A', '8B', etc.
     * @param {Array} jadwalItems - Array of { jamKe, mapel, guru, catatan }
     * @returns {Promise<void>}
     */
    async setJadwal(hari, kelasRombel, jadwalItems) {
        const schedule = await this.getSchedule() || await this.initializeSchedule();
        
        if (!schedule.jadwal[hari]) {
            schedule.jadwal[hari] = {};
        }
        
        schedule.jadwal[hari][kelasRombel] = jadwalItems;
        
        // Update mapel diajar
        await this.updateMapelDiajar(schedule);
        
        await this.saveSchedule(schedule);
    },

    /**
     * Add single lesson to schedule
     * @param {string} hari 
     * @param {string} kelasRombel 
     * @param {Object} lesson 
     * @returns {Promise<Object>} Conflict info if any
     */
    async addLesson(hari, kelasRombel, lesson) {
        const schedule = await this.getSchedule() || await this.initializeSchedule();
        
        // Check for conflicts
        const conflict = this.checkConflict(schedule, hari, kelasRombel, lesson);
        if (conflict) {
            return { success: false, conflict };
        }

        if (!schedule.jadwal[hari]) {
            schedule.jadwal[hari] = {};
        }
        if (!schedule.jadwal[hari][kelasRombel]) {
            schedule.jadwal[hari][kelasRombel] = [];
        }

        schedule.jadwal[hari][kelasRombel].push(lesson);
        
        // Sort by jamKe
        schedule.jadwal[hari][kelasRombel].sort((a, b) => a.jamKe - b.jamKe);
        
        // Update mapel diajar
        await this.updateMapelDiajar(schedule);
        
        await this.saveSchedule(schedule);
        return { success: true };
    },

    /**
     * Remove lesson from schedule
     * @param {string} hari 
     * @param {string} kelasRombel 
     * @param {number} jamKe 
     * @returns {Promise<void>}
     */
    async removeLesson(hari, kelasRombel, jamKe) {
        const schedule = await this.getSchedule();
        if (!schedule?.jadwal?.[hari]?.[kelasRombel]) return;

        schedule.jadwal[hari][kelasRombel] = schedule.jadwal[hari][kelasRombel]
            .filter(l => l.jamKe !== jamKe);

        await this.updateMapelDiajar(schedule);
        await this.saveSchedule(schedule);
    },

    /**
     * Check for schedule conflicts
     * @param {Object} schedule 
     * @param {string} hari 
     * @param {string} kelasRombel 
     * @param {Object} newLesson 
     * @returns {Object|null} Conflict info or null
     */
    checkConflict(schedule, hari, kelasRombel, newLesson) {
        const daySchedule = schedule.jadwal[hari] || {};

        // 1. Check if rombel already has lesson at this time
        const rombelSchedule = daySchedule[kelasRombel] || [];
        const timeConflict = rombelSchedule.find(l => l.jamKe === newLesson.jamKe);
        if (timeConflict) {
            return {
                type: 'rombel_time',
                message: `${kelasRombel} sudah ada pelajaran ${timeConflict.mapel} di jam ke-${newLesson.jamKe}`
            };
        }

        // 2. Check if guru is teaching elsewhere at the same time
        // (This would check if the current user is already scheduled elsewhere)
        for (const [otherKelas, lessons] of Object.entries(daySchedule)) {
            if (otherKelas === kelasRombel) continue;
            
            const guruConflict = lessons.find(l => 
                l.jamKe === newLesson.jamKe && 
                (l.guruId === null || l.guruId === AuthService.getUserId())
            );
            
            if (guruConflict) {
                return {
                    type: 'guru_time',
                    message: `Anda sudah mengajar ${guruConflict.mapel} di ${otherKelas} pada jam ke-${newLesson.jamKe}`
                };
            }
        }

        // 3. Check if guru teaching same mapel at same time in different class
        // (already covered by #2 for the logged-in teacher)

        return null; // No conflict
    },

    /**
     * Update mapel yang diajar
     * @param {Object} schedule 
     */
    async updateMapelDiajar(schedule) {
        const mapelMap = {};

        for (const [hari, kelasSchedule] of Object.entries(schedule.jadwal || {})) {
            for (const [kelas, lessons] of Object.entries(kelasSchedule)) {
                for (const lesson of lessons) {
                    if (!lesson.mapel) continue;
                    
                    if (!mapelMap[lesson.mapel]) {
                        mapelMap[lesson.mapel] = {
                            mapel: lesson.mapel,
                            kelas: new Set(),
                            jamPerMinggu: 0
                        };
                    }
                    
                    mapelMap[lesson.mapel].kelas.add(kelas);
                    mapelMap[lesson.mapel].jamPerMinggu++;
                }
            }
        }

        schedule.mapelDiajar = Object.values(mapelMap).map(m => ({
            ...m,
            kelas: Array.from(m.kelas)
        }));
    },

    /**
     * Get schedule for specific day
     * @param {string} hari 
     * @returns {Promise<Object>}
     */
    async getJadwalHari(hari) {
        const schedule = await this.getSchedule();
        return schedule?.jadwal?.[hari] || {};
    },

    /**
     * Get schedule for specific class
     * @param {string} kelasRombel 
     * @returns {Promise<Object>} { hari: lessons }
     */
    async getJadwalKelas(kelasRombel) {
        const schedule = await this.getSchedule();
        const result = {};

        for (const [hari, kelasSchedule] of Object.entries(schedule?.jadwal || {})) {
            if (kelasSchedule[kelasRombel]) {
                result[hari] = kelasSchedule[kelasRombel];
            }
        }

        return result;
    },

    /**
     * Get days when teacher teaches specific mapel to specific class
     * @param {string} mapel 
     * @param {string} kelas 
     * @returns {Promise<Array>} Array of { hari, jamKe }
     */
    async getHariMengajar(mapel, kelas) {
        const schedule = await this.getSchedule();
        const result = [];

        for (const [hari, kelasSchedule] of Object.entries(schedule?.jadwal || {})) {
            const lessons = kelasSchedule[kelas] || [];
            const matchingLessons = lessons.filter(l => l.mapel === mapel);
            
            matchingLessons.forEach(l => {
                result.push({
                    hari,
                    hariIndex: AGSA_CONSTANTS.HARI.find(h => h.id === hari)?.index || 0,
                    jamKe: l.jamKe
                });
            });
        }

        // Sort by day index then by jam
        return result.sort((a, b) => {
            if (a.hariIndex !== b.hariIndex) return a.hariIndex - b.hariIndex;
            return a.jamKe - b.jamKe;
        });
    },

    /**
     * Get total JP per week for mapel in kelas
     * @param {string} mapel 
     * @param {string} kelas 
     * @returns {Promise<number>}
     */
    async getJPPerMinggu(mapel, kelas) {
        const hariMengajar = await this.getHariMengajar(mapel, kelas);
        return hariMengajar.length;
    },

    /**
     * Get time slot info
     * @param {number} jamKe 
     * @returns {Promise<Object>}
     */
    async getTimeSlot(jamKe) {
        const schedule = await this.getSchedule();
        return schedule?.durasiJam?.[jamKe] || null;
    },

    /**
     * Get all time slots
     * @returns {Promise<Object>}
     */
    async getAllTimeSlots() {
        const schedule = await this.getSchedule();
        return schedule?.durasiJam || {};
    },

    /**
     * Get mapel yang diajar
     * @returns {Promise<Array>}
     */
    async getMapelDiajar() {
        const schedule = await this.getSchedule();
        return schedule?.mapelDiajar || [];
    },

    /**
     * Get all kelas that are taught
     * @returns {Promise<Array>}
     */
    async getKelasDiajar() {
        const mapelDiajar = await this.getMapelDiajar();
        const allKelas = new Set();
        
        mapelDiajar.forEach(m => {
            m.kelas.forEach(k => allKelas.add(k));
        });

        return Array.from(allKelas).sort((a, b) => {
            const aNum = parseInt(a);
            const bNum = parseInt(b);
            if (aNum !== bNum) return aNum - bNum;
            return a.localeCompare(b);
        });
    },

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedSchedule = null;
    }
};

// Export
window.ScheduleService = ScheduleService;

console.log('⏰ Schedule Service loaded successfully');