/**
 * AGSA - Admin Guru Super App
 * Validation Utilities
 * 
 * Input validation functions
 */

const Validators = {
    /**
     * Validate required field
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object} { valid, message }
     */
    required(value, fieldName = 'Field') {
        const isValid = value !== null && 
                       value !== undefined && 
                       String(value).trim() !== '';
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} wajib diisi`
        };
    },

    /**
     * Validate email format
     * @param {string} email 
     * @returns {Object}
     */
    email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = re.test(email);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'Format email tidak valid'
        };
    },

    /**
     * Validate Indonesian phone number
     * @param {string} phone 
     * @returns {Object}
     */
    phone(phone) {
        if (!phone) return { valid: true, message: '' }; // Optional
        
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');
        const re = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
        const isValid = re.test(cleaned);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'Format nomor HP tidak valid'
        };
    },

    /**
     * Validate NIP (18 digits)
     * @param {string} nip 
     * @returns {Object}
     */
    nip(nip) {
        if (!nip) return { valid: true, message: '' }; // Optional
        
        const cleaned = nip.replace(/\s/g, '');
        const re = /^\d{18}$/;
        const isValid = re.test(cleaned);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'NIP harus 18 digit angka'
        };
    },

    /**
     * Validate NPSN (8 digits)
     * @param {string} npsn 
     * @returns {Object}
     */
    npsn(npsn) {
        const re = /^\d{8}$/;
        const isValid = re.test(npsn);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'NPSN harus 8 digit angka'
        };
    },

    /**
     * Validate NISN (10 digits)
     * @param {string} nisn 
     * @returns {Object}
     */
    nisn(nisn) {
        if (!nisn) return { valid: true, message: '' }; // Optional
        
        const re = /^\d{10}$/;
        const isValid = re.test(nisn);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'NISN harus 10 digit angka'
        };
    },

    /**
     * Validate NIS
     * @param {string} nis 
     * @returns {Object}
     */
    nis(nis) {
        if (!nis) return { valid: true, message: '' }; // Optional
        
        const re = /^[A-Za-z0-9]{1,20}$/;
        const isValid = re.test(nis);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'Format NIS tidak valid'
        };
    },

    /**
     * Validate minimum length
     * @param {string} value 
     * @param {number} min 
     * @param {string} fieldName 
     * @returns {Object}
     */
    minLength(value, min, fieldName = 'Field') {
        const isValid = value && value.length >= min;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} minimal ${min} karakter`
        };
    },

    /**
     * Validate maximum length
     * @param {string} value 
     * @param {number} max 
     * @param {string} fieldName 
     * @returns {Object}
     */
    maxLength(value, max, fieldName = 'Field') {
        const isValid = !value || value.length <= max;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} maksimal ${max} karakter`
        };
    },

    /**
     * Validate number
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    number(value, fieldName = 'Field') {
        const isValid = !isNaN(value) && isFinite(value);
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} harus berupa angka`
        };
    },

    /**
     * Validate integer
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    integer(value, fieldName = 'Field') {
        const isValid = Number.isInteger(Number(value));
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} harus berupa bilangan bulat`
        };
    },

    /**
     * Validate number range
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @param {string} fieldName 
     * @returns {Object}
     */
    range(value, min, max, fieldName = 'Field') {
        const num = Number(value);
        const isValid = !isNaN(num) && num >= min && num <= max;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} harus antara ${min} dan ${max}`
        };
    },

    /**
     * Validate score (0-100)
     * @param {number} value 
     * @returns {Object}
     */
    score(value) {
        return this.range(value, 0, 100, 'Nilai');
    },

    /**
     * Validate date
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    date(value, fieldName = 'Tanggal') {
        if (!value) return { valid: true, message: '' };
        
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} tidak valid`
        };
    },

    /**
     * Validate date is not in past
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    notPastDate(value, fieldName = 'Tanggal') {
        if (!value) return { valid: true, message: '' };
        
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isValid = date >= today;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} tidak boleh di masa lalu`
        };
    },

    /**
     * Validate date is not in future
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    notFutureDate(value, fieldName = 'Tanggal') {
        if (!value) return { valid: true, message: '' };
        
        const date = new Date(value);
        const today = new Date();
        
        const isValid = date <= today;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} tidak boleh di masa depan`
        };
    },

    /**
     * Validate time format (HH:mm)
     * @param {string} value 
     * @returns {Object}
     */
    time(value) {
        if (!value) return { valid: true, message: '' };
        
        const re = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        const isValid = re.test(value);
        
        return {
            valid: isValid,
            message: isValid ? '' : 'Format waktu tidak valid (HH:mm)'
        };
    },

    /**
     * Validate URL
     * @param {string} url 
     * @returns {Object}
     */
    url(url) {
        if (!url) return { valid: true, message: '' };
        
        try {
            new URL(url);
            return { valid: true, message: '' };
        } catch {
            return { valid: false, message: 'Format URL tidak valid' };
        }
    },

    /**
     * Validate year
     * @param {any} value 
     * @param {string} fieldName 
     * @returns {Object}
     */
    year(value, fieldName = 'Tahun') {
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        const isValid = Number.isInteger(year) && year >= 2000 && year <= currentYear + 10;
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} tidak valid`
        };
    },

    /**
     * Validate selection from list
     * @param {any} value 
     * @param {Array} allowedValues 
     * @param {string} fieldName 
     * @returns {Object}
     */
    inList(value, allowedValues, fieldName = 'Field') {
        const isValid = allowedValues.includes(value);
        
        return {
            valid: isValid,
            message: isValid ? '' : `${fieldName} tidak valid`
        };
    },

    /**
     * Validate jenjang
     * @param {string} value 
     * @returns {Object}
     */
    jenjang(value) {
        const allowed = Object.keys(AGSA_CONSTANTS.JENJANG);
        return this.inList(value, allowed, 'Jenjang');
    },

    /**
     * Validate profil lulusan
     * @param {string} value 
     * @returns {Object}
     */
    profilLulusan(value) {
        if (!value) return { valid: true, message: '' };
        
        const allowed = AGSA_CONSTANTS.PROFIL_LULUSAN.map(p => p.nama.toLowerCase());
        const isValid = allowed.includes(value.toLowerCase());
        
        return {
            valid: isValid,
            message: isValid ? '' : 'Profil Lulusan tidak valid'
        };
    },

    /**
     * Run multiple validations
     * @param {any} value 
     * @param {Array} rules - Array of { validator, params, message }
     * @returns {Object} { valid, messages }
     */
    validate(value, rules) {
        const result = { valid: true, messages: [] };

        for (const rule of rules) {
            let validation;

            if (typeof rule === 'string') {
                // Simple rule like 'required', 'email'
                validation = this[rule](value);
            } else if (typeof rule === 'object') {
                // Complex rule with params
                const { validator, params = [], message } = rule;
                validation = this[validator](value, ...params);
                
                if (message && !validation.valid) {
                    validation.message = message;
                }
            }

            if (validation && !validation.valid) {
                result.valid = false;
                if (validation.message) {
                    result.messages.push(validation.message);
                }
            }
        }

        return result;
    },

    /**
     * Validate form data
     * @param {Object} data - Form data object
     * @param {Object} schema - Validation schema
     * @returns {Object} { valid, errors }
     */
    validateForm(data, schema) {
        const result = { valid: true, errors: {} };

        for (const [field, rules] of Object.entries(schema)) {
            const value = data[field];
            const validation = this.validate(value, rules);

            if (!validation.valid) {
                result.valid = false;
                result.errors[field] = validation.messages[0] || 'Tidak valid';
            }
        }

        return result;
    },

    /**
     * Profile validation schema
     */
    schemas: {
        profile: {
            namaGuru: [{ validator: 'required', params: ['Nama Guru'] }],
            namaSatuan: [{ validator: 'required', params: ['Nama Satuan Pendidikan'] }],
            npsn: ['npsn'],
            jenjang: ['jenjang'],
            tahunAwalAjar: [{ validator: 'year', params: ['Tahun Ajar'] }]
        },

        siswa: {
            nama: [{ validator: 'required', params: ['Nama'] }],
            nis: ['nis'],
            nisn: ['nisn'],
            jenisKelamin: [{ validator: 'inList', params: [['L', 'P'], 'Jenis Kelamin'] }]
        },

        jadwal: {
            mapel: [{ validator: 'required', params: ['Mata Pelajaran'] }],
            jamKe: [{ validator: 'integer', params: ['Jam Ke'] }]
        }
    }
};

// Export
window.Validators = Validators;

console.log('✅ Validators loaded successfully');