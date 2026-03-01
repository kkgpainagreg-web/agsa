/**
 * AGSA - Admin Guru Super App
 * CP (Capaian Pembelajaran) Service
 * 
 * Handles CP/CSV data operations
 */

const CPService = {
    cachedCP: null,

    /**
     * Get CP data
     * @param {boolean} forceRefresh 
     * @returns {Promise<Object|null>}
     */
    async getCP(forceRefresh = false) {
        try {
            if (this.cachedCP && !forceRefresh) {
                return this.cachedCP;
            }

            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();
            
            this.cachedCP = await DBService.read(COLLECTIONS.CP, userId);
            return this.cachedCP;
        } catch (error) {
            AGSAHelpers.error('CP', 'Failed to get CP:', error);
            throw error;
        }
    },

    /**
     * Check if CP data exists
     * @returns {Promise<boolean>}
     */
    async hasCP() {
        const cp = await this.getCP();
        return !!cp && cp.items?.length > 0;
    },

    /**
     * Import CP from CSV string
     * @param {string} csvString 
     * @param {string} sourceType - 'paste' or 'url'
     * @param {string} sourceUrl - URL if sourceType is 'url'
     * @returns {Promise<Object>} Import result
     */
    async importFromCSV(csvString, sourceType = 'paste', sourceUrl = null) {
        try {
            // Parse CSV
            const parseResult = CSVUtils.parseCP(csvString);

            if (parseResult.errors.length > 0) {
                return {
                    success: false,
                    errors: parseResult.errors,
                    data: null
                };
            }

            // Detect jenjang from kelas
            const detectedJenjang = this.detectJenjang(parseResult.meta.kelas);

            // Prepare CP data
            const cpData = {
                sourceType,
                sourceUrl,
                lastImportAt: new Date(),
                detectedJenjang,
                detectedMapel: parseResult.meta.mapel,
                detectedKelas: parseResult.meta.kelas,
                items: parseResult.data
            };

            // Save to Firestore
            await this.saveCP(cpData);

            return {
                success: true,
                errors: [],
                data: cpData,
                meta: parseResult.meta
            };
        } catch (error) {
            AGSAHelpers.error('CP', 'Import failed:', error);
            return {
                success: false,
                errors: [{ message: error.message }],
                data: null
            };
        }
    },

    /**
     * Import CP from URL
     * @param {string} url 
     * @returns {Promise<Object>}
     */
    async importFromUrl(url) {
        try {
            const csvString = await CSVUtils.fetchFromUrl(url);
            return this.importFromCSV(csvString, 'url', url);
        } catch (error) {
            return {
                success: false,
                errors: [{ message: `Gagal mengambil data dari URL: ${error.message}` }],
                data: null
            };
        }
    },

    /**
     * Save CP data
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async saveCP(data) {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();

            await DBService.set(COLLECTIONS.CP, userId, {
                ...data,
                updatedAt: DBService.serverTimestamp()
            });

            this.cachedCP = data;
            AGSAHelpers.log('CP', 'CP saved successfully');
        } catch (error) {
            AGSAHelpers.error('CP', 'Failed to save CP:', error);
            throw error;
        }
    },

    /**
     * Update single CP item
     * @param {string} itemId 
     * @param {Object} updates 
     * @returns {Promise<void>}
     */
    async updateItem(itemId, updates) {
        const cp = await this.getCP();
        if (!cp) return;

        const index = cp.items.findIndex(item => item.id === itemId);
        if (index > -1) {
            cp.items[index] = { ...cp.items[index], ...updates };
            await this.saveCP(cp);
        }
    },

    /**
     * Delete CP item
     * @param {string} itemId 
     * @returns {Promise<void>}
     */
    async deleteItem(itemId) {
        const cp = await this.getCP();
        if (!cp) return;

        cp.items = cp.items.filter(item => item.id !== itemId);
        
        // Update meta
        cp.detectedMapel = [...new Set(cp.items.map(i => i.mataPelajaran))];
        cp.detectedKelas = [...new Set(cp.items.map(i => i.kelas))].sort((a, b) => parseInt(a) - parseInt(b));
        
        await this.saveCP(cp);
    },

    /**
     * Add new CP item
     * @param {Object} item 
     * @returns {Promise<void>}
     */
    async addItem(item) {
        const cp = await this.getCP() || {
            sourceType: 'manual',
            sourceUrl: null,
            lastImportAt: new Date(),
            detectedJenjang: '',
            detectedMapel: [],
            detectedKelas: [],
            items: []
        };

        // Generate TP code
        const existingCount = cp.items.filter(
            i => i.mataPelajaran === item.mataPelajaran && 
                 i.kelas === item.kelas &&
                 i.semester === item.semester &&
                 i.bab === item.bab
        ).length;

        const newItem = {
            ...item,
            id: AGSAHelpers.generateId('cp'),
            kodeTP: `${item.semester}.${item.bab}.${existingCount + 1}`
        };

        cp.items.push(newItem);
        
        // Update meta
        if (!cp.detectedMapel.includes(item.mataPelajaran)) {
            cp.detectedMapel.push(item.mataPelajaran);
        }
        if (!cp.detectedKelas.includes(item.kelas)) {
            cp.detectedKelas.push(item.kelas);
            cp.detectedKelas.sort((a, b) => parseInt(a) - parseInt(b));
        }
        
        await this.saveCP(cp);
    },

    /**
     * Get CP items by filters
     * @param {Object} filters 
     * @returns {Promise<Array>}
     */
    async getItems(filters = {}) {
        const cp = await this.getCP();
        if (!cp?.items) return [];

        let items = [...cp.items];

        if (filters.mapel) {
            items = items.filter(i => i.mataPelajaran === filters.mapel);
        }
        if (filters.kelas) {
            items = items.filter(i => i.kelas === filters.kelas);
        }
        if (filters.semester) {
            items = items.filter(i => i.semester === filters.semester);
        }
        if (filters.bab) {
            items = items.filter(i => i.bab === filters.bab);
        }
        if (filters.fase) {
            items = items.filter(i => i.fase === filters.fase);
        }

        return items;
    },

    /**
     * Get unique mata pelajaran
     * @returns {Promise<Array>}
     */
    async getMapelList() {
        const cp = await this.getCP();
        return cp?.detectedMapel || [];
    },

    /**
     * Get unique kelas
     * @returns {Promise<Array>}
     */
    async getKelasList() {
        const cp = await this.getCP();
        return cp?.detectedKelas || [];
    },

    /**
     * Get TP list for specific mapel, kelas, semester
     * @param {string} mapel 
     * @param {string} kelas 
     * @param {string} semester 
     * @returns {Promise<Array>}
     */
    async getTPList(mapel, kelas, semester) {
        const items = await this.getItems({ mapel, kelas, semester });
        return items.map(i => ({
            id: i.id,
            kode: i.kodeTP,
            deskripsi: i.tp,
            bab: i.bab,
            profilLulusan: i.profilLulusan,
            cp: i.cp
        }));
    },

    /**
     * Get bab list for specific mapel, kelas, semester
     * @param {string} mapel 
     * @param {string} kelas 
     * @param {string} semester 
     * @returns {Promise<Array>}
     */
    async getBabList(mapel, kelas, semester) {
        const items = await this.getItems({ mapel, kelas, semester });
        const babSet = new Set(items.map(i => i.bab));
        return Array.from(babSet).sort((a, b) => parseInt(a) - parseInt(b));
    },

    /**
     * Get CP text for specific mapel, kelas, semester, bab
     * @param {string} mapel 
     * @param {string} kelas 
     * @param {string} semester 
     * @param {string} bab 
     * @returns {Promise<string>}
     */
    async getCPText(mapel, kelas, semester, bab) {
        const items = await this.getItems({ mapel, kelas, semester, bab });
        if (items.length > 0) {
            return items[0].cp;
        }
        return '';
    },

    /**
     * Detect jenjang from kelas list
     * @param {Array} kelasList 
     * @returns {string}
     */
    detectJenjang(kelasList) {
        if (!kelasList || kelasList.length === 0) return '';

        const minKelas = Math.min(...kelasList.map(k => parseInt(k)));
        const maxKelas = Math.max(...kelasList.map(k => parseInt(k)));

        if (minKelas >= 1 && maxKelas <= 6) return 'SD';
        if (minKelas >= 7 && maxKelas <= 9) return 'SMP';
        if (minKelas >= 10 && maxKelas <= 12) return 'SMA';
        
        return 'SMP'; // Default
    },

    /**
     * Get fase for kelas
     * @param {string} kelas 
     * @param {string} jenjang 
     * @returns {string}
     */
    getFaseForKelas(kelas, jenjang) {
        const config = AGSA_CONSTANTS.JENJANG[jenjang];
        if (config?.fase) {
            return config.fase[kelas] || '';
        }
        return '';
    },

    /**
     * Export CP to CSV
     * @returns {Promise<string>}
     */
    async exportToCSV() {
        const cp = await this.getCP();
        if (!cp?.items) return '';

        const data = cp.items.map(item => ({
            'Mata Pelajaran': item.mataPelajaran,
            'Fase': item.fase,
            'Kelas': item.kelas,
            'Semester': item.semester,
            'Bab': item.bab,
            'CP': item.cp,
            'TP': item.tp,
            'Profil Lulusan': item.profilLulusan
        }));

        return CSVUtils.generate(data, {
            delimiter: ';',
            headers: AGSA_CONSTANTS.CSV.CP_HEADERS
        });
    },

    /**
     * Clear all CP data
     * @returns {Promise<void>}
     */
    async clearAll() {
        const { COLLECTIONS } = AGSA_CONSTANTS;
        const userId = DBService.getUserId();
        
        await DBService.delete(COLLECTIONS.CP, userId);
        this.cachedCP = null;
    },

    /**
     * Get statistics
     * @returns {Promise<Object>}
     */
    async getStats() {
        const cp = await this.getCP();
        if (!cp?.items) {
            return {
                totalCP: 0,
                totalMapel: 0,
                totalKelas: 0,
                totalTP: 0,
                byMapel: {},
                byKelas: {},
                bySemester: { '1': 0, '2': 0 }
            };
        }

        const stats = {
            totalCP: cp.items.length,
            totalMapel: cp.detectedMapel?.length || 0,
            totalKelas: cp.detectedKelas?.length || 0,
            totalTP: cp.items.length,
            byMapel: {},
            byKelas: {},
            bySemester: { '1': 0, '2': 0 }
        };

        cp.items.forEach(item => {
            // By Mapel
            if (!stats.byMapel[item.mataPelajaran]) {
                stats.byMapel[item.mataPelajaran] = 0;
            }
            stats.byMapel[item.mataPelajaran]++;

            // By Kelas
            if (!stats.byKelas[item.kelas]) {
                stats.byKelas[item.kelas] = 0;
            }
            stats.byKelas[item.kelas]++;

            // By Semester
            if (item.semester === '1' || item.semester === '2') {
                stats.bySemester[item.semester]++;
            }
        });

        return stats;
    },

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedCP = null;
    }
};

// Export
window.CPService = CPService;

console.log('📄 CP Service loaded successfully');