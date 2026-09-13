import * as XLSX from 'xlsx';
import { Student, SchoolClass, Teacher, TEACHER_POSITIONS } from '../types';

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
    dormitoryName: string;
    halaqoh: string;
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

export interface ParsedTeacherRow {
  rowNumber: number;
  data: {
    teacherId: string;
    niy: string;
    nip: string;
    fullName: string;
    gender: 'L' | 'P';
    email: string;
    phone: string;
    address: string;
    positions: string[];
    subjects: string[];
    classIds: string[];
    status: 'active' | 'inactive';
  };
  isValid: boolean;
  errors: string[];
}

export interface ParseTeacherExcelResult {
  fileName: string;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  rows: ParsedTeacherRow[];
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
      'Gedung / Kamar Asrama': 'Asrama Abu Bakar (Kamar A-01)',
      'Halaqoh (Ustaz Pembimbing)': 'Halaqoh Ustadz Ahmad Fauzi, Lc.',
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
      'Gedung / Kamar Asrama': 'Asrama Abu Bakar (Kamar A-02)',
      'Halaqoh (Ustaz Pembimbing)': 'Halaqoh Ustadz Wildan Hakim, Lc.',
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
      'Gedung / Kamar Asrama': '-',
      'Halaqoh (Ustaz Pembimbing)': 'Halaqoh Ustadz Farhan Hidayat, S.Pd.',
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
    { wch: 30 }, // Asrama
    { wch: 32 }, // Halaqoh
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
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '4. Kelas diisi sesuai rombel (contoh: VII A, VII B, VIII A, VIII B, IX A).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '5. Status Asrama diisi "Boarding" (Santri Asrama) atau "Non-Boarding" (Fullday).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '6. Gedung / Kamar Asrama diisi nama asrama (misal: Asrama Abu Bakar Shiddiq).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '7. Halaqoh (Ustaz Pembimbing) diisi nama halaqoh (misal: Halaqoh Ustadz Ahmad Fauzi, Lc.).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '8. Tanggal lahir berformat YYYY-MM-DD (Contoh: 2013-05-20).' },
    { 'PANDUAN PENGISIAN FORMAT EXCEL DATA SANTRI AL-HANIF': '9. Setelah mengisi, simpan file sebagai .xlsx lalu unggah di tombol "Impor Excel".' }
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
        
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
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
          const rowNumber = index + 2;

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
          const rawBoarding = findVal('Status Asrama', 'Status Asrama (Boarding/Non-Boarding)', 'statusAsrama', 'boardingStatus');
          
          const boardingStatus: 'boarding' | 'non_boarding' = 
            rawBoarding.toLowerCase().includes('non') || rawBoarding.toLowerCase().includes('fullday')
              ? 'non_boarding'
              : 'boarding';

          const dormitoryName = findVal(
            'Gedung / Kamar Asrama', 'Asrama', 'Nama Asrama', 'Kamar Asrama',
            'asrama', 'namaAsrama', 'gedungAsrama', 'dormitoryName'
          );

          const halaqoh = findVal(
            'Halaqoh (Ustaz Pembimbing)', 'Halaqoh', 'Nama Halaqoh', 'Ustaz Halaqoh',
            'Kelompok Halaqoh', 'halaqoh', 'namaHalaqoh', 'ustadzHalaqoh'
          );

          const birthPlace = findVal('Tempat Lahir', 'Kota Lahir', 'tempatLahir', 'birthPlace');
          let birthDate = findVal('Tanggal Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'tanggalLahir', 'birthDate');
          
          if (birthDate && birthDate.includes('T')) {
            birthDate = birthDate.split('T')[0];
          }

          const religion = findVal('Agama', 'agama', 'religion') || 'Islam';
          const parentName = findVal('Nama Orang Tua / Wali', 'Nama Orang Tua', 'Nama Wali', 'namaOrangTua', 'parentName');
          const parentPhone = findVal('No HP Orang Tua (WhatsApp)', 'No HP Orang Tua', 'No HP Ortu', 'noHpOrangTua', 'parentPhone', 'No WA Ortu');
          const phone = findVal('No HP Siswa', 'No HP', 'phone', 'noHpSiswa');
          const address = findVal('Alamat Lengkap', 'Alamat', 'alamat', 'address');

          if (!fullName) {
            errors.push('Nama santri tidak boleh kosong');
          }

          if (!nis) {
            nis = `260${String(Date.now()).slice(-4)}${index}`;
          }

          let matchedClass = classMap.get(classNameInput.toLowerCase().trim());
          if (!matchedClass && existingClasses.length > 0) {
            matchedClass = existingClasses[0];
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
              boardingStatus,
              dormitoryName: dormitoryName || (boardingStatus === 'boarding' ? 'Asrama Abu Bakar' : '-'),
              halaqoh: halaqoh || 'Halaqoh Tahfidz Al-Qur\'an'
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
    'Gedung / Kamar Asrama': s.dormitoryName || '-',
    'Halaqoh (Ustaz)': s.halaqoh || '-',
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

/**
 * Unduh format / template Excel resmi untuk impor Guru & Asatidz SMP IT Putra Al-Hanif
 */
export const downloadTeacherExcelTemplate = () => {
  const sampleData = [
    {
      'NIY': 'YAH-1988-001',
      'Nama Lengkap & Gelar': 'Ustadz Ahmad Fauzi, Lc.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Waka Kurikulum, Wali Kelas, Musyrif Halaqoh',
      'Mata Pelajaran': 'Tahfidz Al-Qur\'an, Bahasa Arab, Fiqih',
      'Email (Opsional)': 'ahmad.fauzi@alhanif.sch.id',
      'No WhatsApp / HP': '081234567801',
      'Alamat Lengkap': 'Kompleks Asrama Guru Al-Hanif Blok A2'
    },
    {
      'NIY': 'YAH-1991-002',
      'Nama Lengkap & Gelar': 'Ustadz Rizky Ananda, S.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Kabid Kesantrian, Musyrif Asrama',
      'Mata Pelajaran': 'Matematika, IPA Terpadu',
      'Email (Opsional)': '',
      'No WhatsApp / HP': '081234567802',
      'Alamat Lengkap': 'Jl. Pesantren No. 14, Sukmajaya'
    },
    {
      'NIY': 'YAH-1985-003',
      'Nama Lengkap & Gelar': 'Ustadz Muhammad Ridwan, M.Pd.',
      'Jenis Kelamin (L/P)': 'L',
      'Jabatan': 'Mudir, Guru Mapel',
      'Mata Pelajaran': 'Akidah Akhlak',
      'Email (Opsional)': 'ridwan@alhanif.sch.id',
      'No WhatsApp / HP': '081234567805',
      'Alamat Lengkap': 'Kompleks Guru Al-Hanif Blok A1'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 16 }, // NIY
    { wch: 32 }, // Nama Lengkap
    { wch: 18 }, // Jenis Kelamin
    { wch: 45 }, // Jabatan
    { wch: 38 }, // Mata Pelajaran
    { wch: 28 }, // Email
    { wch: 20 }, // No HP
    { wch: 45 }  // Alamat
  ];

  const instructions = [
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '1. NIY (Nomor Induk Yayasan) dan Nama Lengkap wajib diisi.' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '2. Email bersifat OPSIONAL (tidak wajib diisi jika guru belum memiliki email resmi).' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '3. Satu orang guru dapat mengemban LEBIH DARI SATU JABATAN.' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '   Daftar Jabatan Resmi Al-Hanif: Mudir, Kepala Sekolah, Kabid Kesantrian, Kabid TU, Kabid Kepala Rumah Tangga, Waka Kurikulum, Wali Kelas, Guru Mapel, Musyrif Asrama, Musyrif Halaqoh.' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '   Gunakan tanda koma (,) jika memegang lebih dari satu jabatan (Contoh: "Waka Kurikulum, Wali Kelas, Musyrif Halaqoh").' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '4. Mata Pelajaran dapat diisi lebih dari satu dipisahkan tanda koma.' },
    { 'PANDUAN IMPOR DATA GURU & ASATIDZ AL-HANIF': '5. Simpan file sebagai .xlsx lalu unggah pada tombol "Impor Excel" di halaman Data Guru.' }
  ];
  const wsGuide = XLSX.utils.json_to_sheet(instructions);
  wsGuide['!cols'] = [{ wch: 100 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, 'Format_Impor_Guru_SMPIT_AlHanif.xlsx');
};

/**
 * Parsing file Excel guru / asatidz
 */
export const parseTeacherExcelFile = async (
  file: File,
  existingCount = 0
): Promise<ParseTeacherExcelResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const wb = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
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

        const parsedRows: ParsedTeacherRow[] = rawRows.map((row, index) => {
          const errors: string[] = [];
          const rowNumber = index + 2;

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
            'Nama Lengkap & Gelar', 'Nama Lengkap', 'Nama Guru', 'Nama', 'fullName', 'namaGuru'
          );

          let niy = findVal('NIY', 'Nomor Induk Yayasan', 'NIP', 'niy', 'nip');
          const rawGender = findVal('Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'Gender', 'L/P');
          const gender: 'L' | 'P' = rawGender.toUpperCase().startsWith('P') ? 'P' : 'L';

          const positionsStr = findVal('Jabatan', 'Posisi', 'positions', 'jabatan', 'role');
          const positions = positionsStr
            ? positionsStr.split(',').map(s => s.trim()).filter(Boolean)
            : ['Guru Mapel'];

          const subjectsStr = findVal('Mata Pelajaran', 'Mapel', 'subjects', 'mataPelajaran');
          const subjects = subjectsStr
            ? subjectsStr.split(',').map(s => s.trim()).filter(Boolean)
            : ['Tahfidz Al-Qur\'an'];

          const email = findVal('Email (Opsional)', 'Email', 'surel', 'email');
          const phone = findVal('No WhatsApp / HP', 'No WhatsApp', 'No HP', 'phone', 'telepon');
          const address = findVal('Alamat Lengkap', 'Alamat', 'address', 'alamat');

          if (!fullName) {
            errors.push('Nama ustadz / guru tidak boleh kosong');
          }

          if (!niy) {
            niy = `YAH-2026-${String(existingCount + index + 1).padStart(3, '0')}`;
          }

          const teacherId = `TCH-2026-${String(existingCount + index + 1).padStart(4, '0')}`;

          return {
            rowNumber,
            data: {
              teacherId,
              niy,
              nip: niy,
              fullName,
              gender,
              email,
              phone,
              address,
              positions,
              subjects,
              classIds: [],
              status: 'active'
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
        reject(new Error(`Gagal membaca file Excel Guru: ${err?.message || 'Format file tidak valid'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Ekspor data guru ke Excel
 */
export const exportTeachersToExcel = (teachers: Teacher[], fileName = 'Data_Guru_AlHanif.xlsx') => {
  const exportData = teachers.map((t, idx) => ({
    'No': idx + 1,
    'NIY': t.niy || t.nip || '-',
    'Nama Lengkap & Gelar': t.fullName,
    'Jenis Kelamin': t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    'Jabatan': (t.positions && t.positions.length > 0) ? t.positions.join(', ') : 'Guru Mapel',
    'Mata Pelajaran': (t.subjects && t.subjects.length > 0) ? t.subjects.join(', ') : '-',
    'Email': t.email || '-',
    'No WhatsApp / HP': t.phone || '-',
    'Alamat': t.address || '-',
    'Status': t.status === 'active' ? 'Aktif' : 'Non-Aktif'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Guru Al-Hanif');
  XLSX.writeFile(wb, fileName);
};

