// =====================================================
// EXPORT MODULE - export.js
// Export to Word (DOCX) and PDF
// =====================================================

const { Document, Packer, Paragraph, Table, TableRow, TableCell, 
        TextRun, HeadingLevel, AlignmentType, BorderStyle,
        WidthType, Header, Footer, PageNumber, PageBreak } = docx;

import { getCurrentUserData, getCurrentSchoolData } from './auth.js';

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Show loading
function showLoading(message = 'Mengekspor dokumen...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.querySelector('p').textContent = message;
        overlay.classList.remove('hidden');
    }
}

// Hide loading
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// =====================================================
// PDF EXPORT
// =====================================================

export async function exportToPDF(elementId, filename, options = {}) {
    showLoading('Menghasilkan PDF...');
    
    try {
        const { jsPDF } = window.jspdf;
        const element = document.getElementById(elementId);
        
        if (!element) {
            throw new Error('Element tidak ditemukan');
        }
        
        // Create clone for printing
        const clone = element.cloneNode(true);
        clone.style.width = '210mm';
        clone.style.padding = '20mm';
        clone.style.background = 'white';
        clone.classList.add('print-mode');
        
        // Temporarily append to body
        document.body.appendChild(clone);
        
        const canvas = await html2canvas(clone, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        document.body.removeChild(clone);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: options.orientation || 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 20; // 10mm margin each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 10;
        let page = 1;
        
        // First page
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 20);
        
        // Additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pageHeight - 20);
            page++;
        }
        
        pdf.save(`${filename}.pdf`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File PDF berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export PDF error:', error);
        hideLoading();
        showToast('error', 'Gagal', 'Gagal mengekspor PDF: ' + error.message);
        return { success: false, error: error.message };
    }
}

// Advanced PDF with multiple pages
export async function exportMultiPagePDF(pages, filename) {
    showLoading('Menghasilkan PDF multi-halaman...');
    
    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        for (let i = 0; i < pages.length; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            
            const pageElement = pages[i];
            const canvas = await html2canvas(pageElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, Math.min(imgHeight, pageHeight - 20));
        }
        
        pdf.save(`${filename}.pdf`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File PDF berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export multi-page PDF error:', error);
        hideLoading();
        return { success: false, error: error.message };
    }
}

// =====================================================
// WORD (DOCX) EXPORT
// =====================================================

// Create document header
function createDocHeader(schoolData) {
    return new Header({
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: schoolData.namaSekolah || 'NAMA SEKOLAH',
                        bold: true,
                        size: 28
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: schoolData.alamat || 'Alamat Sekolah',
                        size: 20
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                    bottom: {
                        style: BorderStyle.DOUBLE,
                        size: 6,
                        color: '000000'
                    }
                },
                children: []
            })
        ]
    });
}

// Create document footer
function createDocFooter() {
    return new Footer({
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: 'Halaman ',
                        size: 20
                    }),
                    new TextRun({
                        children: [PageNumber.CURRENT]
                    }),
                    new TextRun({
                        text: ' dari '
                    }),
                    new TextRun({
                        children: [PageNumber.TOTAL_PAGES]
                    })
                ]
            })
        ]
    });
}

// Export ATP to Word
export async function exportATPToWord(atpData) {
    showLoading('Menghasilkan dokumen Word...');
    
    try {
        const schoolData = getCurrentSchoolData();
        const userData = getCurrentUserData();
        
        const doc = new Document({
            sections: [{
                headers: {
                    default: createDocHeader(schoolData)
                },
                footers: {
                    default: createDocFooter()
                },
                children: [
                    // Title
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        children: [
                            new TextRun({
                                text: 'ALUR TUJUAN PEMBELAJARAN (ATP)',
                                bold: true,
                                size: 28
                            })
                        ]
                    }),
                    
                    // Info Table
                    createInfoTable([
                        ['Mata Pelajaran', atpData.mapelNama],
                        ['Kelas', atpData.kelas],
                        ['Tahun Pelajaran', atpData.tahunAjaran],
                        ['Nama Guru', userData.namaGuru],
                        ['Sekolah', schoolData.namaSekolah]
                    ]),
                    
                    new Paragraph({ spacing: { before: 400 } }),
                    
                    // Section: Capaian Pembelajaran
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'A. CAPAIAN PEMBELAJARAN',
                                bold: true,
                                size: 24
                            })
                        ]
                    }),
                    
                    ...atpData.capaianPembelajaran.map(cp => 
                        new Paragraph({
                            spacing: { before: 100 },
                            children: [
                                new TextRun({
                                    text: `Fase ${cp.fase} - ${cp.elemen}: `,
                                    bold: true
                                }),
                                new TextRun({
                                    text: cp.deskripsiCP
                                })
                            ]
                        })
                    ),
                    
                    new Paragraph({ spacing: { before: 400 } }),
                    
                    // Section: Alur Tujuan Pembelajaran
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'B. ALUR TUJUAN PEMBELAJARAN',
                                bold: true,
                                size: 24
                            })
                        ]
                    }),
                    
                    new Paragraph({ spacing: { before: 200 } }),
                    
                    // ATP Table
                    createATPTable(atpData.alurTP),
                    
                    new Paragraph({ spacing: { before: 600 } }),
                    
                    // Signature
                    createSignatureSection(schoolData, userData)
                ]
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `ATP_${atpData.mapelNama}_${atpData.kelas}.docx`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File Word berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export ATP to Word error:', error);
        hideLoading();
        showToast('error', 'Gagal', 'Gagal mengekspor: ' + error.message);
        return { success: false, error: error.message };
    }
}

// Export Prota to Word
export async function exportProtaToWord(protaData) {
    showLoading('Menghasilkan dokumen Word...');
    
    try {
        const schoolData = getCurrentSchoolData();
        const userData = getCurrentUserData();
        
        const doc = new Document({
            sections: [{
                headers: {
                    default: createDocHeader(schoolData)
                },
                footers: {
                    default: createDocFooter()
                },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400, after: 200 },
                        children: [
                            new TextRun({
                                text: 'PROGRAM TAHUNAN (PROTA)',
                                bold: true,
                                size: 28
                            })
                        ]
                    }),
                    
                    createInfoTable([
                        ['Satuan Pendidikan', schoolData.namaSekolah],
                        ['Mata Pelajaran', protaData.mapelNama],
                        ['Kelas', protaData.kelas],
                        ['Tahun Pelajaran', protaData.tahunAjaran],
                        ['Guru Pengampu', userData.namaGuru]
                    ]),
                    
                    new Paragraph({ spacing: { before: 400 } }),
                    
                    // Semester 1
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'SEMESTER 1 (GANJIL)',
                                bold: true,
                                size: 24
                            })
                        ]
                    }),
                    
                    new Paragraph({ spacing: { before: 200 } }),
                    
                    createProtaTable(protaData.semester1.items),
                    
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 100 },
                        children: [
                            new TextRun({
                                text: `Total JP Semester 1: ${protaData.semester1.totalJP} JP`,
                                bold: true
                            })
                        ]
                    }),
                    
                    new Paragraph({ children: [new PageBreak()] }),
                    
                    // Semester 2
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'SEMESTER 2 (GENAP)',
                                bold: true,
                                size: 24
                            })
                        ]
                    }),
                    
                    new Paragraph({ spacing: { before: 200 } }),
                    
                    createProtaTable(protaData.semester2.items),
                    
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 100 },
                        children: [
                            new TextRun({
                                text: `Total JP Semester 2: ${protaData.semester2.totalJP} JP`,
                                bold: true
                            })
                        ]
                    }),
                    
                    new Paragraph({ spacing: { before: 600 } }),
                    
                    createSignatureSection(schoolData, userData)
                ]
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `PROTA_${protaData.mapelNama}_${protaData.kelas}.docx`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File Word berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export Prota to Word error:', error);
        hideLoading();
        return { success: false, error: error.message };
    }
}

// Export Modul Ajar to Word
export async function exportModulAjarToWord(modulData) {
    showLoading('Menghasilkan dokumen Word...');
    
    try {
        const schoolData = getCurrentSchoolData();
        const userData = getCurrentUserData();
        
        const sections = [];
        
        // Main section
        sections.push({
            headers: { default: createDocHeader(schoolData) },
            footers: { default: createDocFooter() },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 400, after: 400 },
                    children: [
                        new TextRun({
                            text: 'MODUL AJAR',
                            bold: true,
                            size: 32
                        })
                    ]
                }),
                
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [
                        new TextRun({
                            text: modulData.mapelNama,
                            bold: true,
                            size: 28
                        })
                    ]
                }),
                
                // Informasi Umum
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' A. INFORMASI UMUM',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                createInfoTable([
                    ['Penyusun', modulData.informasiUmum.penyusun],
                    ['Instansi', modulData.informasiUmum.instansi],
                    ['Tahun Penyusunan', modulData.informasiUmum.tahunPenyusunan],
                    ['Jenjang Sekolah', modulData.informasiUmum.jenjang],
                    ['Kelas', modulData.informasiUmum.kelas],
                    ['Fase', modulData.informasiUmum.fase],
                    ['Alokasi Waktu', `${modulData.informasiUmum.alokasi} JP`]
                ]),
                
                new Paragraph({ spacing: { before: 300 } }),
                
                // Capaian Pembelajaran
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' B. CAPAIAN PEMBELAJARAN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: modulData.capaianPembelajaran })
                    ]
                }),
                
                new Paragraph({ spacing: { before: 300 } }),
                
                // Tujuan Pembelajaran
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' C. TUJUAN PEMBELAJARAN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                ...modulData.tujuanPembelajaran.map((tp, idx) =>
                    new Paragraph({
                        spacing: { before: 50 },
                        children: [
                            new TextRun({ text: `${idx + 1}. ${tp}` })
                        ]
                    })
                ),
                
                new Paragraph({ spacing: { before: 300 } }),
                
                // Profil Pelajar Pancasila (8 Dimensi)
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' D. DIMENSI PROFIL LULUSAN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ 
                            text: modulData.profilLulusan.join(', ') || '-'
                        })
                    ]
                }),
                
                new Paragraph({ children: [new PageBreak()] }),
                
                // Kegiatan Pembelajaran
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' E. KEGIATAN PEMBELAJARAN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                new Paragraph({
                    spacing: { before: 200 },
                    children: [
                        new TextRun({ text: '1. PENDAHULUAN', bold: true })
                    ]
                }),
                ...modulData.kegiatanPembelajaran.pendahuluan.map(item =>
                    new Paragraph({
                        bullet: { level: 0 },
                        children: [new TextRun({ text: item })]
                    })
                ),
                
                new Paragraph({
                    spacing: { before: 200 },
                    children: [
                        new TextRun({ text: '2. INTI', bold: true })
                    ]
                }),
                ...modulData.kegiatanPembelajaran.inti.map(item =>
                    new Paragraph({
                        bullet: { level: 0 },
                        children: [new TextRun({ text: item })]
                    })
                ),
                
                new Paragraph({
                    spacing: { before: 200 },
                    children: [
                        new TextRun({ text: '3. PENUTUP', bold: true })
                    ]
                }),
                ...modulData.kegiatanPembelajaran.penutup.map(item =>
                    new Paragraph({
                        bullet: { level: 0 },
                        children: [new TextRun({ text: item })]
                    })
                ),
                
                new Paragraph({ spacing: { before: 300 } }),
                
                // Asesmen
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' F. ASESMEN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                createInfoTable([
                    ['Asesmen Diagnostik', modulData.asesmen.diagnostik],
                    ['Asesmen Formatif', modulData.asesmen.formatif],
                    ['Asesmen Sumatif', modulData.asesmen.sumatif]
                ]),
                
                new Paragraph({ spacing: { before: 300 } }),
                
                // Pengayaan & Remedial
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' G. PENGAYAAN DAN REMEDIAL',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                }),
                
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: 'Pengayaan: ', bold: true }),
                        new TextRun({ text: modulData.pengayaan })
                    ]
                }),
                
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: 'Remedial: ', bold: true }),
                        new TextRun({ text: modulData.remedial })
                    ]
                }),
                
                new Paragraph({ spacing: { before: 600 } }),
                
                createSignatureSection(schoolData, userData)
            ]
        });
        
        const doc = new Document({ sections });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `MODUL_AJAR_${modulData.mapelNama}.docx`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File Word berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export Modul Ajar to Word error:', error);
        hideLoading();
        return { success: false, error: error.message };
    }
}

// Export LKPD to Word
export async function exportLKPDToWord(lkpdData) {
    showLoading('Menghasilkan dokumen Word...');
    
    try {
        const schoolData = getCurrentSchoolData();
        
        const children = [
            // Header
            new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                    bottom: { style: BorderStyle.DOUBLE, size: 6, color: '000000' }
                },
                children: [
                    new TextRun({
                        text: 'LEMBAR KERJA PESERTA DIDIK (LKPD)',
                        bold: true,
                        size: 28
                    })
                ]
            }),
            
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 },
                children: [
                    new TextRun({
                        text: lkpdData.judul,
                        bold: true,
                        size: 24
                    })
                ]
            }),
            
            // Info
            createInfoTable([
                ['Mata Pelajaran', lkpdData.mapelNama],
                ['Kelas/Semester', `${lkpdData.kelas} / ${lkpdData.semester}`],
                ['Alokasi Waktu', `${lkpdData.alokasi} menit`]
            ]),
            
            new Paragraph({ spacing: { before: 300 } }),
            
            // Identitas Siswa
            new Paragraph({
                shading: { fill: 'E5E7EB' },
                children: [
                    new TextRun({ text: ' IDENTITAS PESERTA DIDIK', bold: true })
                ]
            }),
            
            new Paragraph({
                spacing: { before: 100 },
                children: [
                    new TextRun({ text: 'Nama\t\t: ........................................................' })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Kelas\t\t: ........................................................' })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: 'Tanggal\t\t: ........................................................' })
                ]
            }),
            
            new Paragraph({ spacing: { before: 300 } }),
            
            // Tujuan Pembelajaran
            new Paragraph({
                shading: { fill: 'E5E7EB' },
                children: [
                    new TextRun({ text: ' TUJUAN PEMBELAJARAN', bold: true })
                ]
            }),
            
            ...lkpdData.tujuanPembelajaran.map((tp, idx) =>
                new Paragraph({
                    spacing: { before: 50 },
                    children: [
                        new TextRun({ text: `${idx + 1}. ${tp}` })
                    ]
                })
            ),
            
            new Paragraph({ spacing: { before: 300 } }),
            
            // Petunjuk
            new Paragraph({
                shading: { fill: 'E5E7EB' },
                children: [
                    new TextRun({ text: ' PETUNJUK', bold: true })
                ]
            }),
            
            ...lkpdData.petunjukUmum.map((p, idx) =>
                new Paragraph({
                    spacing: { before: 50 },
                    children: [
                        new TextRun({ text: `${idx + 1}. ${p}` })
                    ]
                })
            ),
            
            new Paragraph({ spacing: { before: 300 } }),
            
            // Materi Singkat
            ...(lkpdData.materiSingkat ? [
                new Paragraph({
                    shading: { fill: 'E5E7EB' },
                    children: [
                        new TextRun({ text: ' MATERI SINGKAT', bold: true })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: lkpdData.materiSingkat })
                    ]
                }),
                new Paragraph({ spacing: { before: 300 } })
            ] : []),
            
            // Kegiatan
            new Paragraph({
                shading: { fill: 'E5E7EB' },
                children: [
                    new TextRun({ text: ' KEGIATAN', bold: true })
                ]
            })
        ];
        
        // Add kegiatan/soal
        lkpdData.kegiatan.forEach((k, idx) => {
            children.push(
                new Paragraph({
                    spacing: { before: 200 },
                    children: [
                        new TextRun({ text: `${idx + 1}. `, bold: true }),
                        new TextRun({ text: k.instruksi })
                    ]
                })
            );
            
            if (k.jenis === 'uraian' || k.jenis === 'isian') {
                // Add answer space
                for (let i = 0; i < (k.ruangJawab || 3); i++) {
                    children.push(
                        new Paragraph({
                            spacing: { before: 50 },
                            children: [
                                new TextRun({ text: '.................................................................................................................................' })
                            ]
                        })
                    );
                }
            }
        });
        
        // Kesimpulan
        if (lkpdData.kesimpulan.show) {
            children.push(
                new Paragraph({ spacing: { before: 300 } }),
                new Paragraph({
                    shading: { fill: 'E5E7EB' },
                    children: [
                        new TextRun({ text: ' KESIMPULAN', bold: true })
                    ]
                }),
                new Paragraph({
                    spacing: { before: 100 },
                    children: [
                        new TextRun({ text: lkpdData.kesimpulan.template })
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: '.................................................................................................................................' })
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: '.................................................................................................................................' })
                    ]
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: '.................................................................................................................................' })
                    ]
                })
            );
        }
        
        const doc = new Document({
            sections: [{
                children: children
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `LKPD_${lkpdData.judul}.docx`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File Word berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export LKPD to Word error:', error);
        hideLoading();
        return { success: false, error: error.message };
    }
}

// Export Bank Soal to Word
export async function exportBankSoalToWord(soalList, config = {}) {
    showLoading('Menghasilkan dokumen Word...');
    
    try {
        const schoolData = getCurrentSchoolData();
        const userData = getCurrentUserData();
        
        const children = [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: schoolData.namaSekolah,
                        bold: true,
                        size: 28
                    })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                border: {
                    bottom: { style: BorderStyle.DOUBLE, size: 6, color: '000000' }
                },
                spacing: { after: 400 },
                children: [
                    new TextRun({
                        text: schoolData.alamat,
                        size: 20
                    })
                ]
            }),
            
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({
                        text: config.judul || 'BANK SOAL',
                        bold: true,
                        size: 28
                    })
                ]
            }),
            
            createInfoTable([
                ['Mata Pelajaran', config.mapelNama || '-'],
                ['Kelas', config.kelas || '-'],
                ['Jenis Ujian', config.jenisUjian || '-'],
                ['Waktu', `${config.waktu || 60} menit`]
            ]),
            
            new Paragraph({ spacing: { before: 400 } }),
            
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'PETUNJUK UMUM:',
                        bold: true
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '1. Tulislah identitas Anda pada lembar jawaban yang disediakan.'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '2. Bacalah setiap soal dengan cermat sebelum menjawab.'
                    })
                ]
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: '3. Kerjakan soal yang dianggap mudah terlebih dahulu.'
                    })
                ]
            }),
            
            new Paragraph({ spacing: { before: 400 } }),
            
            new Paragraph({
                shading: { fill: '2563EB' },
                children: [
                    new TextRun({
                        text: ' SOAL',
                        bold: true,
                        size: 24,
                        color: 'FFFFFF'
                    })
                ]
            })
        ];
        
        // Add soal
        soalList.forEach((soal, idx) => {
            children.push(
                new Paragraph({
                    spacing: { before: 300 },
                    children: [
                        new TextRun({
                            text: `${idx + 1}. `,
                            bold: true
                        }),
                        new TextRun({
                            text: soal.pertanyaan
                        })
                    ]
                })
            );
            
            // Add options for multiple choice
            if (soal.tipeSoal === 'pilgan' && soal.opsi) {
                soal.opsi.forEach(opsi => {
                    children.push(
                        new Paragraph({
                            indent: { left: 720 },
                            children: [
                                new TextRun({
                                    text: `${opsi.label}. ${opsi.teks}`
                                })
                            ]
                        })
                    );
                });
            }
            
            // Add answer space for essay
            if (soal.tipeSoal === 'uraian') {
                for (let i = 0; i < 3; i++) {
                    children.push(
                        new Paragraph({
                            indent: { left: 720 },
                            spacing: { before: 50 },
                            children: [
                                new TextRun({
                                    text: '.................................................................................................................................'
                                })
                            ]
                        })
                    );
                }
            }
        });
        
        // Add kunci jawaban if requested
        if (config.includeKey) {
            children.push(
                new Paragraph({ children: [new PageBreak()] }),
                new Paragraph({
                    shading: { fill: '2563EB' },
                    children: [
                        new TextRun({
                            text: ' KUNCI JAWABAN',
                            bold: true,
                            size: 24,
                            color: 'FFFFFF'
                        })
                    ]
                })
            );
            
            soalList.forEach((soal, idx) => {
                children.push(
                    new Paragraph({
                        spacing: { before: 100 },
                        children: [
                            new TextRun({
                                text: `${idx + 1}. `,
                                bold: true
                            }),
                            new TextRun({
                                text: soal.kunciJawaban
                            })
                        ]
                    })
                );
                
                if (soal.pembahasan) {
                    children.push(
                        new Paragraph({
                            indent: { left: 360 },
                            children: [
                                new TextRun({
                                    text: 'Pembahasan: ',
                                    bold: true,
                                    italics: true
                                }),
                                new TextRun({
                                    text: soal.pembahasan,
                                    italics: true
                                })
                            ]
                        })
                    );
                }
            });
        }
        
        const doc = new Document({
            sections: [{
                children: children
            }]
        });
        
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${config.filename || 'Bank_Soal'}.docx`);
        
        hideLoading();
        showToast('success', 'Berhasil', 'File Word berhasil diunduh');
        return { success: true };
    } catch (error) {
        console.error('Export Bank Soal to Word error:', error);
        hideLoading();
        return { success: false, error: error.message };
    }
}

// =====================================================
// HELPER FUNCTIONS FOR WORD EXPORT
// =====================================================

// Create info table
function createInfoTable(rows) {
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: rows.map(row => new TableRow({
            children: [
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: row[0], bold: true })
                            ]
                        })
                    ]
                }),
                new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `: ${row[1]}` })
                            ]
                        })
                    ]
                })
            ]
        }))
    });
}

// Create ATP table
function createATPTable(alurTP) {
    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            createHeaderCell('NO', 8),
            createHeaderCell('ELEMEN', 20),
            createHeaderCell('KODE TP', 12),
            createHeaderCell('TUJUAN PEMBELAJARAN', 45),
            createHeaderCell('JP', 15)
        ]
    });
    
    const dataRows = alurTP.map((tp, idx) => new TableRow({
        children: [
            createDataCell(String(idx + 1), AlignmentType.CENTER),
            createDataCell(tp.elemen),
            createDataCell(tp.kode, AlignmentType.CENTER),
            createDataCell(tp.deskripsi),
            createDataCell(String(tp.alokasi), AlignmentType.CENTER)
        ]
    }));
    
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows]
    });
}

// Create Prota table
function createProtaTable(items) {
    const headerRow = new TableRow({
        tableHeader: true,
        children: [
            createHeaderCell('NO', 8),
            createHeaderCell('ELEMEN', 20),
            createHeaderCell('TUJUAN PEMBELAJARAN', 50),
            createHeaderCell('ALOKASI WAKTU (JP)', 22)
        ]
    });
    
    const dataRows = items.map((item, idx) => new TableRow({
        children: [
            createDataCell(String(idx + 1), AlignmentType.CENTER),
            createDataCell(item.elemen),
            createDataCell(item.deskripsiTP),
            createDataCell(String(item.alokasi), AlignmentType.CENTER)
        ]
    }));
    
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows]
    });
}

// Create header cell
function createHeaderCell(text, width) {
    return new TableCell({
        width: { size: width, type: WidthType.PERCENTAGE },
        shading: { fill: '2563EB' },
        children: [
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: text,
                        bold: true,
                        color: 'FFFFFF',
                        size: 20
                    })
                ]
            })
        ]
    });
}

// Create data cell
function createDataCell(text, alignment = AlignmentType.LEFT) {
    return new TableCell({
        children: [
            new Paragraph({
                alignment: alignment,
                children: [
                    new TextRun({
                        text: text,
                        size: 20
                    })
                ]
            })
        ]
    });
}

// Create signature section
function createSignatureSection(schoolData, userData) {
    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const location = schoolData.alamat?.split(',')[0] || '';
    
    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: 'Mengetahui,' })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: 'Kepala Sekolah' })
                                ]
                            }),
                            new Paragraph({ spacing: { before: 1000 } }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: schoolData.kepalaSekolah || '.............................',
                                        bold: true,
                                        underline: {}
                                    })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `NIP. ${schoolData.nipKepsek || '.............................'}`
                                    })
                                ]
                            })
                        ]
                    }),
                    new TableCell({
                        width: { size: 50, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: `${location}, ${today}` })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: 'Guru Mata Pelajaran' })
                                ]
                            }),
                            new Paragraph({ spacing: { before: 1000 } }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: userData.namaGuru || '.............................',
                                        bold: true,
                                        underline: {}
                                    })
                                ]
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `NIP. ${userData.nip || '.............................'}`
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        ]
    });
}

// Print functionality
export function printDocument(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showToast('error', 'Error', 'Element tidak ditemukan');
        return;
    }
    
    // Add print class
    element.classList.add('print-ready');
    
    // Trigger print
    window.print();
    
    // Remove print class after printing
    setTimeout(() => {
        element.classList.remove('print-ready');
    }, 1000);
}

// SaveAs helper (for browsers that don't support it)
function saveAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}