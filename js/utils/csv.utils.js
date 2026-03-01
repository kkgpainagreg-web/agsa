/**
 * AGSA - Admin Guru Super App
 * CSV Utility Functions
 * 
 * Parsing dan generating CSV
 */

const CSVUtils = {
    /**
     * Parse CSV string to array of objects
     * @param {string} csvString - CSV content
     * @param {Object} options - Parsing options
     * @returns {Object} { headers, data, errors }
     */
    parse(csvString, options = {}) {
        const {
            delimiter = ';',
            hasHeader = true,
            trimValues = true,
            skipEmptyLines = true,
            expectedHeaders = null
        } = options;

        const result = {
            headers: [],
            data: [],
            errors: [],
            rawRows: []
        };

        if (!csvString || typeof csvString !== 'string') {
            result.errors.push({ row: 0, message: 'CSV kosong atau tidak valid' });
            return result;
        }

        // Normalize line endings
        const normalizedCSV = csvString.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Split into lines
        const lines = normalizedCSV.split('\n');
        
        // Filter empty lines if needed
        const filteredLines = skipEmptyLines 
            ? lines.filter(line => line.trim() !== '')
            : lines;

        if (filteredLines.length === 0) {
            result.errors.push({ row: 0, message: 'CSV tidak memiliki data' });
            return result;
        }

        // Parse header
        if (hasHeader) {
            const headerLine = filteredLines[0];
            result.headers = this.parseLine(headerLine, delimiter, trimValues);
            
            // Validate headers if expected headers provided
            if (expectedHeaders) {
                const missingHeaders = expectedHeaders.filter(
                    h => !result.headers.some(rh => rh.toLowerCase() === h.toLowerCase())
                );
                if (missingHeaders.length > 0) {
                    result.errors.push({
                        row: 1,
                        message: `Header tidak lengkap. Kurang: ${missingHeaders.join(', ')}`
                    });
                }
            }
        }

        // Parse data rows
        const startIndex = hasHeader ? 1 : 0;
        
        for (let i = startIndex; i < filteredLines.length; i++) {
            const line = filteredLines[i];
            const rowNumber = i + 1;
            
            try {
                const values = this.parseLine(line, delimiter, trimValues);
                result.rawRows.push(values);
                
                if (hasHeader && result.headers.length > 0) {
                    // Convert to object
                    const rowObj = {};
                    result.headers.forEach((header, index) => {
                        rowObj[header] = values[index] || '';
                    });
                    result.data.push(rowObj);
                } else {
                    result.data.push(values);
                }
            } catch (error) {
                result.errors.push({
                    row: rowNumber,
                    message: `Error parsing baris ${rowNumber}: ${error.message}`
                });
            }
        }

        return result;
    },

    /**
     * Parse single CSV line
     * @param {string} line 
     * @param {string} delimiter 
     * @param {boolean} trimValues 
     * @returns {Array}
     */
    parseLine(line, delimiter = ';', trimValues = true) {
        const values = [];
        let currentValue = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (insideQuotes && nextChar === '"') {
                    // Escaped quote
                    currentValue += '"';
                    i++; // Skip next quote
                } else {
                    // Toggle quote mode
                    insideQuotes = !insideQuotes;
                }
            } else if (char === delimiter && !insideQuotes) {
                // End of value
                values.push(trimValues ? currentValue.trim() : currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add last value
        values.push(trimValues ? currentValue.trim() : currentValue);
        
        return values;
    },

    /**
     * Parse CP CSV specifically
     * Format: Mata Pelajaran;Fase;Kelas;Semester;Bab;CP;TP;Profil Lulusan
     * @param {string} csvString 
     * @returns {Object}
     */
    parseCP(csvString) {
        const expectedHeaders = AGSA_CONSTANTS.CSV.CP_HEADERS;
        
        const result = this.parse(csvString, {
            delimiter: ';',
            hasHeader: true,
            expectedHeaders
        });

        if (result.errors.length > 0) {
            return result;
        }

        // Process and validate CP data
        const processedData = [];
        const uniqueMapel = new Set();
        const uniqueKelas = new Set();
        const uniqueFase = new Set();

        result.data.forEach((row, index) => {
            const rowNum = index + 2; // Account for header
            
            // Validate required fields
            const requiredFields = ['Mata Pelajaran', 'Fase', 'Kelas', 'Semester', 'CP', 'TP'];
            const missing = requiredFields.filter(f => !row[f] || row[f].trim() === '');
            
            if (missing.length > 0) {
                result.errors.push({
                    row: rowNum,
                    message: `Baris ${rowNum}: Field kosong - ${missing.join(', ')}`
                });
                return;
            }

            // Validate Profil Lulusan
            const profilLulusan = row['Profil Lulusan']?.trim();
            const validProfil = AGSA_CONSTANTS.PROFIL_LULUSAN.map(p => p.nama.toLowerCase());
            
            if (profilLulusan && !validProfil.includes(profilLulusan.toLowerCase())) {
                result.errors.push({
                    row: rowNum,
                    message: `Baris ${rowNum}: Profil Lulusan "${profilLulusan}" tidak valid`
                });
            }

            // Process row
            const cpItem = {
                id: AGSAHelpers.generateId('cp'),
                mataPelajaran: row['Mata Pelajaran'].trim(),
                fase: row['Fase'].trim().toUpperCase(),
                kelas: row['Kelas'].trim(),
                semester: row['Semester'].trim(),
                bab: row['Bab']?.trim() || '1',
                cp: row['CP'].trim(),
                tp: row['TP'].trim(),
                profilLulusan: profilLulusan || '',
                kodeTP: '' // Will be generated
            };

            // Generate TP code: Semester.Bab.Urutan
            cpItem.kodeTP = `${cpItem.semester}.${cpItem.bab}.${processedData.filter(
                p => p.mataPelajaran === cpItem.mataPelajaran && 
                     p.kelas === cpItem.kelas &&
                     p.semester === cpItem.semester &&
                     p.bab === cpItem.bab
            ).length + 1}`;

            processedData.push(cpItem);

            // Track unique values
            uniqueMapel.add(cpItem.mataPelajaran);
            uniqueKelas.add(cpItem.kelas);
            uniqueFase.add(cpItem.fase);
        });

        return {
            ...result,
            data: processedData,
            meta: {
                totalRows: processedData.length,
                mapel: Array.from(uniqueMapel),
                kelas: Array.from(uniqueKelas).sort((a, b) => parseInt(a) - parseInt(b)),
                fase: Array.from(uniqueFase).sort()
            }
        };
    },

    /**
     * Parse Siswa CSV
     * Format: NIS;NISN;Nama;Jenis Kelamin;Tempat Lahir;Tanggal Lahir;Alamat;Nama Orangtua;No HP Orangtua
     * @param {string} csvString 
     * @returns {Object}
     */
    parseSiswa(csvString) {
        const expectedHeaders = AGSA_CONSTANTS.CSV.SISWA_HEADERS;
        
        const result = this.parse(csvString, {
            delimiter: ';',
            hasHeader: true,
            expectedHeaders
        });

        if (result.errors.length > 0) {
            return result;
        }

        // Process siswa data
        const processedData = [];
        let jumlahL = 0;
        let jumlahP = 0;

        result.data.forEach((row, index) => {
            const rowNum = index + 2;
            
            // Validate required fields
            if (!row['Nama'] || row['Nama'].trim() === '') {
                result.errors.push({
                    row: rowNum,
                    message: `Baris ${rowNum}: Nama siswa tidak boleh kosong`
                });
                return;
            }

            const jk = (row['Jenis Kelamin'] || '').trim().toUpperCase();
            if (jk !== 'L' && jk !== 'P') {
                result.errors.push({
                    row: rowNum,
                    message: `Baris ${rowNum}: Jenis Kelamin harus L atau P`
                });
                return;
            }

            // Parse tanggal lahir
            let tanggalLahir = null;
            if (row['Tanggal Lahir']) {
                tanggalLahir = this.parseDate(row['Tanggal Lahir']);
            }

            const siswa = {
                id: AGSAHelpers.generateId('siswa'),
                nis: row['NIS']?.trim() || '',
                nisn: row['NISN']?.trim() || '',
                nama: row['Nama'].trim(),
                jenisKelamin: jk,
                tempatLahir: row['Tempat Lahir']?.trim() || '',
                tanggalLahir: tanggalLahir,
                alamat: row['Alamat']?.trim() || '',
                namaOrangtua: row['Nama Orangtua']?.trim() || '',
                noHpOrangtua: row['No HP Orangtua']?.trim() || '',
                foto: ''
            };

            processedData.push(siswa);

            if (jk === 'L') jumlahL++;
            else jumlahP++;
        });

        return {
            ...result,
            data: processedData,
            meta: {
                totalSiswa: processedData.length,
                jumlahL,
                jumlahP
            }
        };
    },

    /**
     * Parse date string to Date object
     * Supports: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
     * @param {string} dateStr 
     * @returns {Date|null}
     */
    parseDate(dateStr) {
        if (!dateStr) return null;

        const cleaned = dateStr.trim();
        let parts;

        // Try DD/MM/YYYY or DD-MM-YYYY
        if (cleaned.includes('/')) {
            parts = cleaned.split('/');
            if (parts.length === 3) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }
        } else if (cleaned.includes('-') && cleaned.indexOf('-') > 2) {
            // DD-MM-YYYY
            parts = cleaned.split('-');
            if (parts.length === 3 && parts[0].length <= 2) {
                return new Date(parts[2], parts[1] - 1, parts[0]);
            }
        }

        // Try YYYY-MM-DD
        if (cleaned.includes('-') && cleaned.indexOf('-') === 4) {
            parts = cleaned.split('-');
            if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }

        // Try native parsing
        const date = new Date(cleaned);
        return isNaN(date.getTime()) ? null : date;
    },

    /**
     * Generate CSV string from data
     * @param {Array} data - Array of objects or arrays
     * @param {Object} options 
     * @returns {string}
     */
    generate(data, options = {}) {
        const {
            delimiter = ';',
            includeHeader = true,
            headers = null,
            lineEnding = '\n'
        } = options;

        if (!data || data.length === 0) {
            return '';
        }

        const lines = [];
        
        // Determine headers
        let csvHeaders = headers;
        if (!csvHeaders && typeof data[0] === 'object' && !Array.isArray(data[0])) {
            csvHeaders = Object.keys(data[0]);
        }

        // Add header line
        if (includeHeader && csvHeaders) {
            lines.push(csvHeaders.map(h => this.escapeValue(h, delimiter)).join(delimiter));
        }

        // Add data lines
        data.forEach(row => {
            let values;
            
            if (Array.isArray(row)) {
                values = row;
            } else if (csvHeaders) {
                values = csvHeaders.map(h => row[h] ?? '');
            } else {
                values = Object.values(row);
            }

            lines.push(values.map(v => this.escapeValue(v, delimiter)).join(delimiter));
        });

        return lines.join(lineEnding);
    },

    /**
     * Escape CSV value
     * @param {any} value 
     * @param {string} delimiter 
     * @returns {string}
     */
    escapeValue(value, delimiter = ';') {
        if (value === null || value === undefined) {
            return '';
        }

        let str = String(value);

        // Check if escaping needed
        const needsEscape = str.includes(delimiter) || 
                           str.includes('"') || 
                           str.includes('\n') || 
                           str.includes('\r');

        if (needsEscape) {
            // Escape quotes by doubling them
            str = str.replace(/"/g, '""');
            // Wrap in quotes
            str = `"${str}"`;
        }

        return str;
    },

    /**
     * Generate CP template CSV
     * @param {Object} options 
     * @returns {string}
     */
    generateCPTemplate(options = {}) {
        const { mapel = 'Matematika', jenjang = 'SMP' } = options;
        
        const headers = AGSA_CONSTANTS.CSV.CP_HEADERS;
        const sampleData = [
            [mapel, 'D', '7', '1', '1', 'Peserta didik mampu memahami bilangan bulat dan operasinya', 'Menjelaskan konsep bilangan bulat positif dan negatif', 'Penalaran Kritis'],
            [mapel, 'D', '7', '1', '1', 'Peserta didik mampu memahami bilangan bulat dan operasinya', 'Melakukan operasi penjumlahan bilangan bulat', 'Penalaran Kritis'],
            [mapel, 'D', '7', '1', '2', 'Peserta didik mampu memahami pecahan', 'Menjelaskan konsep pecahan biasa dan campuran', 'Penalaran Kritis'],
        ];

        return this.generate(sampleData, {
            delimiter: ';',
            includeHeader: true,
            headers
        });
    },

    /**
     * Generate Siswa template CSV
     * @returns {string}
     */
    generateSiswaTemplate() {
        const headers = AGSA_CONSTANTS.CSV.SISWA_HEADERS;
        const sampleData = [
            ['001', '0012345678', 'Ahmad Budi Santoso', 'L', 'Jakarta', '15/05/2010', 'Jl. Merdeka No. 10', 'Budi Santoso', '081234567890'],
            ['002', '0012345679', 'Siti Aminah', 'P', 'Bandung', '20/08/2010', 'Jl. Pahlawan No. 5', 'Ahmad Aminah', '081234567891'],
        ];

        return this.generate(sampleData, {
            delimiter: ';',
            includeHeader: true,
            headers
        });
    },

    /**
     * Fetch CSV from URL
     * @param {string} url 
     * @returns {Promise<string>}
     */
    async fetchFromUrl(url) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            return text;
        } catch (error) {
            throw new Error(`Gagal mengambil CSV dari URL: ${error.message}`);
        }
    },

    /**
     * Detect delimiter from CSV string
     * @param {string} csvString 
     * @returns {string}
     */
    detectDelimiter(csvString) {
        const firstLine = csvString.split('\n')[0] || '';
        
        const delimiters = [';', ',', '\t', '|'];
        let maxCount = 0;
        let detected = ';';

        delimiters.forEach(d => {
            const count = (firstLine.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length;
            if (count > maxCount) {
                maxCount = count;
                detected = d;
            }
        });

        return detected;
    },

    /**
     * Validate CSV format
     * @param {string} csvString 
     * @param {string} type - 'cp' or 'siswa'
     * @returns {Object} { valid, errors }
     */
    validate(csvString, type) {
        const result = { valid: true, errors: [] };

        if (!csvString || csvString.trim() === '') {
            result.valid = false;
            result.errors.push('CSV kosong');
            return result;
        }

        const expectedHeaders = type === 'cp' 
            ? AGSA_CONSTANTS.CSV.CP_HEADERS 
            : AGSA_CONSTANTS.CSV.SISWA_HEADERS;

        const parsed = this.parse(csvString, {
            delimiter: ';',
            hasHeader: true
        });

        // Check headers
        const missingHeaders = expectedHeaders.filter(
            h => !parsed.headers.some(ph => ph.toLowerCase() === h.toLowerCase())
        );

        if (missingHeaders.length > 0) {
            result.valid = false;
            result.errors.push(`Header tidak lengkap: ${missingHeaders.join(', ')}`);
        }

        // Check data rows
        if (parsed.data.length === 0) {
            result.valid = false;
            result.errors.push('Tidak ada data');
        }

        result.errors.push(...parsed.errors.map(e => e.message));
        if (result.errors.length > 0) {
            result.valid = false;
        }

        return result;
    }
};

// Export
window.CSVUtils = CSVUtils;

console.log('📊 CSV Utils loaded successfully');