// Utility Functions

// Format Date to Indonesian
function formatDateID(date, format = 'long') {
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    const d = new Date(date);
    
    if (format === 'long') {
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } else if (format === 'full') {
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } else if (format === 'short') {
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } else if (format === 'day') {
        return days[d.getDay()];
    }
    
    return d.toLocaleDateString('id-ID');
}

// Parse CSV
function parseCSV(csvText, delimiter = ';') {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index].trim();
            });
            data.push(row);
        }
    }
    
    return { headers, data };
}

// Generate CSV from array of objects
function generateCSV(data, headers, delimiter = ';') {
    let csv = headers.join(delimiter) + '\n';
    
    data.forEach(row => {
        const values = headers.map(h => row[h] || '');
        csv += values.join(delimiter) + '\n';
    });
    
    return csv;
}

// Download file
function downloadFile(content, filename, type = 'text/csv') {
    const blob = new Blob([content], { type: type + ';charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Get weeks between two dates
function getWeeksBetweenDates(startDate, endDate) {
    const weeks = [];
    let currentDate = new Date(startDate);
    let weekNumber = 1;
    
    while (currentDate <= endDate) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        if (weekEnd > endDate) {
            weekEnd.setTime(endDate.getTime());
        }
        
        weeks.push({
            weekNumber,
            startDate: new Date(weekStart),
            endDate: new Date(weekEnd)
        });
        
        currentDate.setDate(currentDate.getDate() + 7);
        weekNumber++;
    }
    
    return weeks;
}

// Calculate effective days (excluding holidays and Sundays)
function calculateEffectiveDays(startDate, endDate, holidays = [], excludeSunday = true) {
    let count = 0;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Skip Sunday if excluded
        if (excludeSunday && dayOfWeek === 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }
        
        // Skip holidays
        if (!holidays.includes(dateStr)) {
            count++;
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
}

// Get teaching dates for a subject based on schedule
function getTeachingDates(schedule, startDate, endDate, holidays = []) {
    const dates = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dayName = formatDateID(currentDate, 'day');
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Check if this day is in schedule and not a holiday
        if (schedule.includes(dayName) && !holidays.includes(dateStr)) {
            dates.push(new Date(currentDate));
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// Generate unique ID
function generateUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format number with leading zero
function padZero(num, size = 2) {
    let s = num.toString();
    while (s.length < size) s = '0' + s;
    return s;
}

// Get Fase from Kelas
function getFaseFromKelas(kelas) {
    const kelasNum = parseInt(kelas);
    if (kelasNum <= 2) return 'A';
    if (kelasNum <= 4) return 'B';
    if (kelasNum <= 6) return 'C';
    if (kelasNum <= 9) return 'D';
    if (kelasNum === 10) return 'E';
    return 'F';
}

// Validate time format HH:MM
function isValidTime(time) {
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

// Convert time to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes to time
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${padZero(hours)}:${padZero(mins)}`;
}

// Check time overlap
function isTimeOverlap(start1, end1, start2, end2) {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    
    return (s1 < e2 && e1 > s2);
}

// Truncate text
function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Escape HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load CSV from URL (Google Spreadsheet published CSV)
async function loadCSVFromURL(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch CSV');
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV:', error);
        throw error;
    }
}

// Print element
function printElement(elementId, title = 'Print') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <link href="https://cdn.tailwindcss.com" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; padding: 20px; }
                .arabic-text { font-family: 'Amiri', serif; }
                @media print {
                    body { padding: 0; }
                }
            </style>
        </head>
        <body>
            ${element.innerHTML}
            <script>
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 500);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

console.log('Utils Module Loaded');