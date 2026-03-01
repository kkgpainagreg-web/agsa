/**
 * AGSA - Admin Guru Super App
 * General Helper Functions
 * 
 * Utility functions yang digunakan di seluruh aplikasi
 */

const AGSAHelpers = {
    /**
     * Generate unique ID
     * @param {string} prefix - Optional prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = '') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
    },

    /**
     * Format currency to Indonesian Rupiah
     * @param {number} amount 
     * @returns {string}
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format number with Indonesian locale
     * @param {number} num 
     * @returns {string}
     */
    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    },

    /**
     * Capitalize first letter of each word
     * @param {string} str 
     * @returns {string}
     */
    capitalizeWords(str) {
        if (!str) return '';
        return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text 
     * @param {number} maxLength 
     * @returns {string}
     */
    truncate(text, maxLength = 50) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Slugify string for URL/ID
     * @param {string} str 
     * @returns {string}
     */
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Deep clone object
     * @param {Object} obj 
     * @returns {Object}
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    },

    /**
     * Debounce function
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     * @param {Function} func 
     * @param {number} limit 
     * @returns {Function}
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if object is empty
     * @param {Object} obj 
     * @returns {boolean}
     */
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === 'string') return obj.trim() === '';
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    /**
     * Get nested object value safely
     * @param {Object} obj 
     * @param {string} path - Dot notation path
     * @param {*} defaultValue 
     * @returns {*}
     */
    getNestedValue(obj, path, defaultValue = null) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined) return defaultValue;
            result = result[key];
        }
        
        return result !== undefined ? result : defaultValue;
    },

    /**
     * Set nested object value
     * @param {Object} obj 
     * @param {string} path 
     * @param {*} value 
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;
        
        for (const key of keys) {
            if (!(key in current)) current[key] = {};
            current = current[key];
        }
        
        current[lastKey] = value;
    },

    /**
     * Group array by key
     * @param {Array} array 
     * @param {string} key 
     * @returns {Object}
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key];
            if (!result[groupKey]) result[groupKey] = [];
            result[groupKey].push(item);
            return result;
        }, {});
    },

    /**
     * Sort array of objects by key
     * @param {Array} array 
     * @param {string} key 
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array}
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            
            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Remove duplicates from array
     * @param {Array} array 
     * @param {string} key - Optional key for objects
     * @returns {Array}
     */
    unique(array, key = null) {
        if (key) {
            const seen = new Set();
            return array.filter(item => {
                const value = item[key];
                if (seen.has(value)) return false;
                seen.add(value);
                return true;
            });
        }
        return [...new Set(array)];
    },

    /**
     * Convert file size to human readable
     * @param {number} bytes 
     * @returns {string}
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Validate email format
     * @param {string} email 
     * @returns {boolean}
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate Indonesian phone number
     * @param {string} phone 
     * @returns {boolean}
     */
    isValidPhone(phone) {
        const re = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
        return re.test(phone.replace(/[\s-]/g, ''));
    },

    /**
     * Format phone number to Indonesian format
     * @param {string} phone 
     * @returns {string}
     */
    formatPhone(phone) {
        let cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        } else if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned;
        }
        return cleaned;
    },

    /**
     * Get initials from name
     * @param {string} name 
     * @param {number} count 
     * @returns {string}
     */
    getInitials(name, count = 2) {
        if (!name) return '';
        return name
            .split(' ')
            .map(word => word[0])
            .slice(0, count)
            .join('')
            .toUpperCase();
    },

    /**
     * Generate random color
     * @returns {string} Hex color
     */
    randomColor() {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
            '#8B5CF6', '#EC4899', '#14B8A6', '#6366F1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Copy text to clipboard
     * @param {string} text 
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                textArea.remove();
            }
        }
    },

    /**
     * Download data as file
     * @param {string} data 
     * @param {string} filename 
     * @param {string} type 
     */
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Parse URL parameters
     * @param {string} url 
     * @returns {Object}
     */
    parseUrlParams(url = window.location.href) {
        const params = {};
        const searchParams = new URL(url).searchParams;
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * Build URL with parameters
     * @param {string} base 
     * @param {Object} params 
     * @returns {string}
     */
    buildUrl(base, params = {}) {
        const url = new URL(base, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.append(key, value);
            }
        });
        return url.toString();
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} str 
     * @returns {string}
     */
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Convert roman numeral to number
     * @param {string} roman 
     * @returns {number}
     */
    romanToNumber(roman) {
        const romanNumerals = {
            'I': 1, 'V': 5, 'X': 10, 'L': 50,
            'C': 100, 'D': 500, 'M': 1000
        };
        let result = 0;
        for (let i = 0; i < roman.length; i++) {
            const current = romanNumerals[roman[i].toUpperCase()];
            const next = romanNumerals[roman[i + 1]?.toUpperCase()];
            if (next && current < next) {
                result -= current;
            } else {
                result += current;
            }
        }
        return result;
    },

    /**
     * Convert number to roman numeral
     * @param {number} num 
     * @returns {string}
     */
    numberToRoman(num) {
        const romanNumerals = [
            ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
            ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
            ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
        ];
        let result = '';
        for (const [roman, value] of romanNumerals) {
            while (num >= value) {
                result += roman;
                num -= value;
            }
        }
        return result;
    },

    /**
     * Generate tahun ajar string
     * @param {number} tahunAwal 
     * @returns {string}
     */
    formatTahunAjar(tahunAwal) {
        return `${tahunAwal}/${tahunAwal + 1}`;
    },

    /**
     * Get current tahun ajar
     * @returns {Object} { tahunAwal, tahunAkhir, tahunAjar }
     */
    getCurrentTahunAjar() {
        const now = new Date();
        const month = now.getMonth() + 1; // 1-12
        const year = now.getFullYear();
        
        // Jika Juli atau setelahnya, tahun ajar dimulai
        // Jika sebelum Juli, masih tahun ajar sebelumnya
        const tahunAwal = month >= 7 ? year : year - 1;
        
        return {
            tahunAwal,
            tahunAkhir: tahunAwal + 1,
            tahunAjar: this.formatTahunAjar(tahunAwal)
        };
    },

    /**
     * Log with prefix
     * @param {string} module 
     * @param  {...any} args 
     */
    log(module, ...args) {
        console.log(`[AGSA/${module}]`, ...args);
    },

    /**
     * Error log with prefix
     * @param {string} module 
     * @param  {...any} args 
     */
    error(module, ...args) {
        console.error(`[AGSA/${module}]`, ...args);
    }
};

// Export
window.AGSAHelpers = AGSAHelpers;

console.log('🔧 Helpers loaded successfully');