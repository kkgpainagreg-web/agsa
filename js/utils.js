// Utility Functions - Complete Version

// Show toast notification
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.log(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 transform translate-x-full transition-transform duration-300`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Show loading overlay
function showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

// Format date to Indonesian locale
function formatDate(date, options = {}) {
    const defaultOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    try {
        return new Date(date).toLocaleDateString('id-ID', { ...defaultOptions, ...options });
    } catch (e) {
        return '-';
    }
}

// Format short date
function formatShortDate(date) {
    try {
        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (e) {
        return '-';
    }
}

// Format date for input
function formatDateForInput(date) {
    try {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    } catch (e) {
        return '';
    }
}

// Get day name in Indonesian
function getDayName(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    try {
        return days[new Date(date).getDay()];
    } catch (e) {
        return '-';
    }
}

// Get month name in Indonesian
function getMonthName(month) {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month] || '-';
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Parse CSV
function parseCSV(text, delimiter = ',') {
    const lines = text.split('\n');
    if (lines.length === 0) return { headers: [], data: [] };
    
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, '').replace(/\s+/g, '_'));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        data.push(row);
    }

    return { headers, data };
}

// Calculate effective days between two dates
function calculateEffectiveDays(startDate, endDate, holidays = [], excludeSunday = true, excludeSaturday = false) {
    let count = 0;
    
    try {
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        const holidaySet = new Set(holidays.map(d => {
            try {
                return formatDateForInput(d);
            } catch (e) {
                return '';
            }
        }));

        while (current <= end) {
            const dayOfWeek = current.getDay();
            const dateStr = formatDateForInput(current);
            
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isHoliday = holidaySet.has(dateStr);

            if (!isHoliday && !(excludeSunday && isSunday) && !(excludeSaturday && isSaturday)) {
                count++;
            }

            current.setDate(current.getDate() + 1);
        }
    } catch (e) {
        console.error('Error calculating effective days:', e);
    }

    return count;
}

// Get weeks between two dates
function getWeeksBetween(startDate, endDate) {
    try {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.ceil(diffDays / 7);
    } catch (e) {
        return 0;
    }
}

// Group array by key
function groupBy(array, key) {
    if (!array || !Array.isArray(array)) return {};
    return array.reduce((result, item) => {
        const keyValue = item[key];
        (result[keyValue] = result[keyValue] || []).push(item);
        return result;
    }, {});
}

// Check if premium feature
function isPremiumFeature(feature) {
    const premiumFeatures = ['promes', 'modul-ajar', 'lkpd', 'bank-soal', 'kktp', 'daftar-nilai', 'jurnal', 'nilai', 'absensi'];
    return premiumFeatures.includes(feature);
}

// Validate email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate Gmail
function isGmail(email) {
    return email && email.toLowerCase().endsWith('@gmail.com');
}

// Download file
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

console.log('Utils.js loaded successfully');
