/**
 * AGSA - Admin Guru Super App
 * Profile Service
 * 
 * Handles teacher and school profile operations
 */

const ProfileService = {
    cachedProfile: null,
    listeners: [],

    /**
     * Get profile
     * @param {boolean} forceRefresh 
     * @returns {Promise<Object|null>}
     */
    async getProfile(forceRefresh = false) {
        try {
            if (this.cachedProfile && !forceRefresh) {
                return this.cachedProfile;
            }

            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();
            
            const profile = await DBService.read(COLLECTIONS.PROFILES, userId);
            this.cachedProfile = profile;
            
            return profile;
        } catch (error) {
            AGSAHelpers.error('Profile', 'Failed to get profile:', error);
            throw error;
        }
    },

    /**
     * Check if profile exists
     * @returns {Promise<boolean>}
     */
    async hasProfile() {
        const profile = await this.getProfile();
        return !!profile;
    },

    /**
     * Check if profile is complete
     * @returns {Promise<Object>} { isComplete, missingFields }
     */
    async checkProfileCompletion() {
        const profile = await this.getProfile();
        
        if (!profile) {
            return {
                isComplete: false,
                missingFields: ['all'],
                completionPercent: 0
            };
        }

        const requiredFields = [
            'namaGuru',
            'nipGuru',
            'namaKepsek',
            'nipKepsek',
            'namaSatuan',
            'npsn',
            'jenjang',
            'tahunAwalAjar'
        ];

        const missingFields = requiredFields.filter(field => !profile[field]);
        const completionPercent = Math.round(
            ((requiredFields.length - missingFields.length) / requiredFields.length) * 100
        );

        return {
            isComplete: missingFields.length === 0,
            missingFields,
            completionPercent
        };
    },

    /**
     * Save profile
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async saveProfile(data) {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();

            // Process data
            const profileData = {
                // Guru
                namaGuru: data.namaGuru?.trim() || '',
                nipGuru: data.nipGuru?.trim() || '',
                
                // Kepala Sekolah
                namaKepsek: data.namaKepsek?.trim() || '',
                nipKepsek: data.nipKepsek?.trim() || '',
                
                // Satuan Pendidikan
                namaSatuan: data.namaSatuan?.trim() || '',
                npsn: data.npsn?.trim() || '',
                jenjang: data.jenjang || '',
                
                // Lokasi
                provinsi: data.provinsi?.trim() || '',
                kabupaten: data.kabupaten?.trim() || '',
                kecamatan: data.kecamatan?.trim() || '',
                desa: data.desa?.trim() || '',
                alamatLengkap: data.alamatLengkap?.trim() || '',
                
                // Tahun Ajar
                tahunAwalAjar: parseInt(data.tahunAwalAjar) || new Date().getFullYear(),
                
                // Tanggal Pengesahan
                tanggalPengesahan: data.tanggalPengesahan || null,
                tanggalPengesahanJurnal: data.tanggalPengesahanJurnal || null,
                
                // Logo
                logoUrl: data.logoUrl || ''
            };

            // Check if profile exists
            const exists = await DBService.exists(COLLECTIONS.PROFILES, userId);
            
            if (exists) {
                await DBService.update(COLLECTIONS.PROFILES, userId, profileData);
            } else {
                await DBService.set(COLLECTIONS.PROFILES, userId, {
                    ...profileData,
                    createdAt: DBService.serverTimestamp()
                });
            }

            // Update cache
            this.cachedProfile = { id: userId, ...profileData };
            
            // Notify listeners
            this.notifyListeners();

            AGSAHelpers.log('Profile', 'Profile saved successfully');
        } catch (error) {
            AGSAHelpers.error('Profile', 'Failed to save profile:', error);
            throw error;
        }
    },

    /**
     * Update specific fields
     * @param {Object} fields 
     * @returns {Promise<void>}
     */
    async updateFields(fields) {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = DBService.getUserId();

            await DBService.update(COLLECTIONS.PROFILES, userId, fields);
            
            // Update cache
            if (this.cachedProfile) {
                this.cachedProfile = { ...this.cachedProfile, ...fields };
            }

            this.notifyListeners();
        } catch (error) {
            AGSAHelpers.error('Profile', 'Failed to update fields:', error);
            throw error;
        }
    },

    /**
     * Get tahun ajar string
     * @returns {Promise<string>}
     */
    async getTahunAjar() {
        const profile = await this.getProfile();
        if (profile?.tahunAwalAjar) {
            return AGSAHelpers.formatTahunAjar(profile.tahunAwalAjar);
        }
        return AGSAHelpers.getCurrentTahunAjar().tahunAjar;
    },

    /**
     * Get tahun ajar object
     * @returns {Promise<Object>}
     */
    async getTahunAjarObj() {
        const profile = await this.getProfile();
        if (profile?.tahunAwalAjar) {
            const tahunAwal = profile.tahunAwalAjar;
            return {
                tahunAwal,
                tahunAkhir: tahunAwal + 1,
                tahunAjar: AGSAHelpers.formatTahunAjar(tahunAwal)
            };
        }
        return AGSAHelpers.getCurrentTahunAjar();
    },

    /**
     * Get jenjang config
     * @returns {Promise<Object>}
     */
    async getJenjangConfig() {
        const profile = await this.getProfile();
        const jenjang = profile?.jenjang || 'SD';
        return AGSA_CONSTANTS.JENJANG[jenjang] || AGSA_CONSTANTS.JENJANG.SD;
    },

    /**
     * Get header data for documents
     * @returns {Promise<Object>}
     */
    async getDocumentHeader() {
        const profile = await this.getProfile();
        
        return {
            namaGuru: profile?.namaGuru || '',
            nipGuru: profile?.nipGuru || '',
            namaKepsek: profile?.namaKepsek || '',
            nipKepsek: profile?.nipKepsek || '',
            namaSatuan: profile?.namaSatuan || '',
            npsn: profile?.npsn || '',
            jenjang: profile?.jenjang || '',
            alamatLengkap: profile?.alamatLengkap || '',
            tahunAjar: await this.getTahunAjar(),
            logoUrl: profile?.logoUrl || '',
            tanggalPengesahan: profile?.tanggalPengesahan || null
        };
    },

    /**
     * Get pengesahan dates
     * @returns {Promise<Object>}
     */
    async getPengesahanDates() {
        const profile = await this.getProfile();
        return {
            dokumen: profile?.tanggalPengesahan || null,
            jurnal: profile?.tanggalPengesahanJurnal || null
        };
    },

    /**
     * Subscribe to profile changes
     * @param {Function} callback 
     * @returns {Function} Unsubscribe
     */
    subscribe(callback) {
        this.listeners.push(callback);
        
        // Start real-time listener if first subscriber
        if (this.listeners.length === 1) {
            this.startRealtimeListener();
        }

        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
            
            // Stop listener if no more subscribers
            if (this.listeners.length === 0 && this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
        };
    },

    /**
     * Start real-time listener
     */
    startRealtimeListener() {
        try {
            const { COLLECTIONS } = AGSA_CONSTANTS;
            const userId = AuthService.getUserId();
            
            if (!userId) return;

            this.unsubscribe = DBService.onDocChange(
                COLLECTIONS.PROFILES,
                userId,
                (profile) => {
                    this.cachedProfile = profile;
                    this.notifyListeners();
                }
            );
        } catch (error) {
            AGSAHelpers.error('Profile', 'Real-time listener error:', error);
        }
    },

    /**
     * Notify listeners
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.cachedProfile);
            } catch (error) {
                console.error('Profile listener error:', error);
            }
        });
    },

    /**
     * Clear cache
     */
    clearCache() {
        this.cachedProfile = null;
    },

    /**
     * Validate NPSN format
     * @param {string} npsn 
     * @returns {boolean}
     */
    validateNPSN(npsn) {
        // NPSN is 8 digits
        return /^\d{8}$/.test(npsn);
    },

    /**
     * Validate NIP format
     * @param {string} nip 
     * @returns {boolean}
     */
    validateNIP(nip) {
        // NIP is 18 digits
        return /^\d{18}$/.test(nip.replace(/\s/g, ''));
    }
};

// Export
window.ProfileService = ProfileService;

console.log('👤 Profile Service loaded successfully');