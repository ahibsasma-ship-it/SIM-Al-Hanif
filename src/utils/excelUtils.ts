import * as XLSX from 'xlsx';
import { Student, SchoolClass } from '../types';

export interface ParsedStudentRow {
  rowNumber: number;
  data: {
    studentId: string;
    fullName: string;
    nis: string;
    nisn: string;
    gender: 'L' | 'P';
    birthPlace: string;
    birthDate: string;
    religion: string;
    address: string;
    phone: string;
    parentName: string;
    parentPhone: string;
    classId: string;
    className: string;
    status: 'active' | 'graduated' | 'transferred' | 'inactive';
    boardingStatus: 'boarding' | 'non_boarding';
  };
  isValid: boolean;
  errors: string[];
}

export interface ParseExcelResult {
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: ParsedStudentRow[];
}

/**
 * Unduh format / template Excel resmi untuk impor santri SMP IT Putra Al-Hanif
 */
export const downloadStudentExcelTemplate = () => {
  // 1. Data Sheet
  const sampleData = [
    {
      'NIS': '2608021',
      'NISN': '0098123451',
      'Nama Santri': 'Muhammad Rizky Pratama',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas': 'VII A',
      'Status Asrama': 'Boarding',
      'Tempat Lahir': 'Bandung',
      'Tanggal Lahir': '2013-04-12',
      'Agama': 'Islam',
      'Nama Orang Tua / Wali': 'H. Bambang Susanto, S.T.',
      'No HP Orang Tua (WhatsApp)': '081234567890',
      'No HP Siswa': '081234567891',
      'Alamat Lengkap': 'Jl. Terusan Buah Batu No. 45, Bandung'
    },
    {
      'NIS': '2608022',
      'NISN': '0098123452',
      'Nama Santri': 'Abdullah Faqih Al-Banna',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas': 'VII A',
      'Status Asrama': 'Boarding',
      'Tempat Lahir': 'Jakarta',
      'Tanggal Lahir': '2013-08-25',
      'Agama': 'Islam',
      'Nama Orang Tua / Wali': 'dr. Fathurrahman, Sp.PD',
      'No HP Orang Tua (WhatsApp)': '081398765432',
      'No HP Siswa': '',
      'Alamat Lengkap': 'Kompleks Pesona Cempaka Blok B2 No. 8, Jakarta Timur'
    },
    {
      'NIS': '2608023',
      'NISN': '0098123453',
      'Nama Santri': 'Faris Azhar Mubarak',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas': 'VII B',
      'Status Asrama': 'Non-Boarding',
      'Tempat Lahir': 'Bekasi',
      'Tanggal Lahir': '2013-02-18',
      'Agama': 'Islam',
      'Nama Orang Tua / Wali': 'Ir. Hendra Kurniawan',
      'No HP Orang Tua (WhatsApp)': '081512349876',
      'No HP Siswa': '081512349877',
      'Alamat Lengkap': 'Perumahan Galaxy Indah No. 12, Bekasi Barat'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 12 }, // NIS
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama Santri
    { wch: 18 }, // Jenis Kelamin
    { wch: 12 }, // Kelas
    { wch: 16 }, // Status Asrama
    { wch: 16 }, // Tempat Lahir
    { wch: 16 }, // Tanggal Lahir
    { wch: 10 }, // Agama
    { wch: 28 }, // Nama Orang Tua
    { wch: 24 }, // No HP Orang Tua
    { wch: 18 }, // No HP Siswa
    { wch: 45 }  // Alamat Lengkap
  ];

  // 2. Instructions Sheet
  const instructions = [
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '1. Kolom Wajib: "NIS", "Nama Santri", dan "Kelas" wajib diisi.' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '2. Format NIS harus berupa angka unik (misal: 2608001).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '3. Jenis Kelamin diisi "L" (Laki-laki) atau "P" (Perempuan).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '4. Kelas diisi sesuai nama kelas yang ada di sistem (contoh: VII A, VII B, VIII A, VIII B, IX A).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '5. Status Asrama diisi "Boarding" (Santri Asrama) atau "Non-Boarding" (Fullday).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '6. Tanggal lahir berformat YYYY-MM-DD (Contoh: 2013-05-20).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '7. Setelah mengisi, simpan file sebagai .xlsx atau .csv lalu unggah di tombol "Impor Excel".' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(instructions);
  wsGuide['!cols'] = [{ wch: 90 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Santri');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  // Trigger download
  XLSX.writeFile(wb, 'Format_Impor_Santri_SMPIT_AlHanif.xlsx');
};

/**
 * Parsing file Excel/CSV santri
 */
export const parseStudentExcelFile = async (
  file: File,
  existingClasses: SchoolClass[]
): Promise<ParseExcelResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary', cellDates: true });
        
        // Use first sheet
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        // Convert to array of objects
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          resolve({
            fileName: file.name,
            totalRows: 0,
            validCount: 0,
            invalidCount: 0,
            rows: []
          });
          return;
        }

        const classMap = new Map<string, SchoolClass>();
        existingClasses.forEach(c => {
          classMap.set(c.className.toLowerCase().trim(), c);
          classMap.set(`kelas ${c.className.toLowerCase().trim()}`, c);
          classMap.set(c.classId.toLowerCase().trim(), c);
        });

        const parsedRows: ParsedStudentRow[] = rawRows.map((row, index) => {
          const errors: string[] = [];
          const rowNumber = index + 2; // header is row 1

          // Flexible key lookup helper
          const findVal = (...keys: string[]) => {
            for (const k of keys) {
              const matchingKey = Object.keys(row).find(
                rk => rk.toLowerCase().trim() === k.toLowerCase().trim()
              );
              if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null) {
                return String(row[matchingKey]).trim();
              }
            }
            return '';
          };

          const fullName = findVal(
            'Nama Santri', 'Nama Siswa', 'Nama Lengkap', 'Nama Lengkap Siswa',
            'Nama', 'namaSiswa', 'fullName', 'nama_siswa'
          );
          
          let nis = findVal('NIS', 'Nomor Induk', 'nis', 'no_induk');
          const nisn = findVal('NISN', 'nisn');
          
          const rawGender = findVal('Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'Gender', 'L/P');
          const gender: 'L' | 'P' = rawGender.toUpperCase().startsWith('P') ? 'P' : 'L';

          const classNameInput = findVal('Kelas', 'Rombel', 'namaKelas', 'className');
          const rawBoarding = findVal('Status Asrama', 'Status Asrama (Boarding/Non-Boarding)', 'Asrama', 'statusAsrama', 'boardingStatus');
          
          const boardingStatus: 'boarding' | 'non_boarding' = 
            rawBoarding.toLowerCase().includes('non') || rawBoarding.toLowerCase().includes('fullday')
              ? 'non_boarding'
              : 'boarding';

          const birthPlace = findVal('Tempat Lahir', 'Kota Lahir', 'tempatLahir', 'birthPlace');
          let birthDate = findVal('Tanggal Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'tanggalLahir', 'birthDate');
          
          // Format date if needed
          if (birthDate && birthDate.includes('T')) {
            birthDate = birthDate.split('T')[0];
          }

          const religion = findVal('Agama', 'agama', 'religion') || 'Islam';
          const parentName = findVal('Nama Orang Tua / Wali', 'Nama Orang Tua', 'Nama Wali', 'namaOrangTua', 'parentName');
          const parentPhone = findVal('No HP Orang Tua (WhatsApp)', 'No HP Orang Tua', 'No HP Ortu', 'noHpOrangTua', 'parentPhone', 'No WA Ortu');
          const phone = findVal('No HP Siswa', 'No HP', 'phone', 'noHpSiswa');
          const address = findVal('Alamat Lengkap', 'Alamat', 'alamat', 'address');

          // Validations
          if (!fullName) {
            errors.push('Nama santri tidak boleh kosong');
          }

          if (!nis) {
            // Auto generate fallback NIS if missing
            nis = `260${String(Date.now()).slice(-4)}${index}`;
          }

          // Match class
          let matchedClass = classMap.get(classNameInput.toLowerCase().trim());
          if (!matchedClass && existingClasses.length > 0) {
            matchedClass = existingClasses[0]; // fallback to first class
          }

          const studentId = `STU-${new Date().getFullYear()}-${nis}`;

          return {
            rowNumber,
            data: {
              studentId,
              fullName,
              nis,
              nisn,
              gender,
              birthPlace,
              birthDate,
              religion,
              address,
              phone,
              parentName,
              parentPhone,
              classId: matchedClass?.classId || 'CLS-7A-2026',
              className: matchedClass?.className || classNameInput || 'VII A',
              status: 'active',
              boardingStatus
            },
            isValid: errors.length === 0,
            errors
          };
        });

        const validCount = parsedRows.filter(r => r.isValid).length;
        const invalidCount = parsedRows.length - validCount;

        resolve({
          fileName: file.name,
          totalRows: parsedRows.length,
          validCount,
          invalidCount,
          rows: parsedRows
        });
      } catch (err: any) {
        reject(new Error(`Gagal membaca file Excel: ${err?.message || 'Format file tidak valid'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Ekspor data santri yang sedang aktif ke Excel
 */
export const exportStudentsToExcel = (students: Student[], fileName = 'Data_Santri_AlHanif.xlsx') => {
  const exportData = students.map((s, idx) => ({
    'No': idx + 1,
    'NIS': s.nis,
    'NISN': s.nisn || '-',
    'Nama Santri': s.fullName,
    'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    'Kelas': s.className,
    'Status Asrama': s.boardingStatus === 'boarding' ? 'Boarding (Asrama)' : 'Non-Boarding',
    'Tempat Lahir': s.birthPlace || '-',
    'Tanggal Lahir': s.birthDate || '-',
    'Nama Orang Tua / Wali': s.parentName || '-',
    'No HP Orang Tua': s.parentPhone || '-',
    'No HP Santri': s.phone || '-',
    'Alamat': s.address || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Santri Al-Hanif');
  XLSX.writeFile(wb, fileName);
};
