import { doc, setDoc, getDocs, collection, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from './config';
import { SchoolClass, Teacher, Staff, Student, UserProfile } from '../../types';
import { generateAttendanceId } from './attendanceService';
import { handleFirestoreError, OperationType } from './firestoreError';

export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    const [classesSnap, studentsSnap] = await Promise.all([
      getDocs(collection(db, 'classes')),
      getDocs(collection(db, 'students'))
    ]);
    return !classesSnap.empty && !studentsSnap.empty;
  } catch (err: any) {
    console.warn('Check db error:', err);
    return false;
  }
};

export const seedInitialSchoolData = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // 1. Classes
    const sampleClasses: SchoolClass[] = [
      {
        classId: 'CLS-7A-2026',
        className: 'VII A',
        grade: 7,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0003',
        homeroomTeacherName: 'Ustadz Farhan Hidayat, S.Pd.',
        studentCount: 28,
        status: 'active'
      },
      {
        classId: 'CLS-7B-2026',
        className: 'VII B',
        grade: 7,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0004',
        homeroomTeacherName: 'Ustadz Wildan Hakim, Lc.',
        studentCount: 26,
        status: 'active'
      },
      {
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        grade: 8,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0001',
        homeroomTeacherName: 'Ustadz Ahmad Fauzi, Lc.',
        studentCount: 27,
        status: 'active'
      },
      {
        classId: 'CLS-8B-2026',
        className: 'VIII B',
        grade: 8,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0002',
        homeroomTeacherName: 'Ustadz Rizky Ananda, S.Pd.',
        studentCount: 25,
        status: 'active'
      },
      {
        classId: 'CLS-9A-2026',
        className: 'IX A',
        grade: 9,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0005',
        homeroomTeacherName: 'Ustadz Muhammad Ridwan, M.Pd.',
        studentCount: 24,
        status: 'active'
      },
      {
        classId: 'CLS-9B-2026',
        className: 'IX B',
        grade: 9,
        academicYear: '2026/2027',
        homeroomTeacherId: 'TCH-2026-0006',
        homeroomTeacherName: 'Ustadz Danang Prasetyo, S.Si.',
        studentCount: 25,
        status: 'active'
      }
    ];

    for (const c of sampleClasses) {
      await setDoc(doc(db, 'classes', c.classId), {
        ...c,
        namaKelas: c.className,
        tingkat: c.grade,
        tahunAjaran: c.academicYear,
        namaWaliKelas: c.homeroomTeacherName,
        idWaliKelas: c.homeroomTeacherId,
        jumlahSiswa: c.studentCount,
        statusKelas: c.status,
        waktuDibuat: serverTimestamp(),
        waktuDiperbarui: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // 2. Teachers
    const sampleTeachers: Teacher[] = [
      {
        teacherId: 'TCH-2026-0001',
        nip: '198804122015031001',
        fullName: 'Ustadz Ahmad Fauzi, Lc.',
        gender: 'L',
        email: 'guru@alhanif.sch.id',
        phone: '081234567801',
        address: 'Kompleks Asrama Guru Al-Hanif Blok A2',
        subjects: ['Tahfidz Al-Qur\'an', 'Bahasa Arab', 'Fiqih Sunnah'],
        classIds: ['CLS-8A-2026', 'CLS-8B-2026'],
        status: 'active'
      },
      {
        teacherId: 'TCH-2026-0002',
        nip: '199106182016041002',
        fullName: 'Ustadz Rizky Ananda, S.Pd.',
        gender: 'L',
        email: 'rizky.ananda@alhanif.sch.id',
        phone: '081234567802',
        address: 'Jl. Pesantren No. 14, Sukmajaya',
        subjects: ['Matematika', 'Fisika Dasar'],
        classIds: ['CLS-8B-2026', 'CLS-9A-2026'],
        status: 'active'
      },
      {
        teacherId: 'TCH-2026-0003',
        nip: '199203152018041003',
        fullName: 'Ustadz Farhan Hidayat, S.Pd.',
        gender: 'L',
        email: 'farhan@alhanif.sch.id',
        phone: '081234567803',
        address: 'Kompleks Asrama Guru Blok B1',
        subjects: ['Bahasa Inggris', 'Informatika & Coding'],
        classIds: ['CLS-7A-2026'],
        status: 'active'
      },
      {
        teacherId: 'TCH-2026-0004',
        nip: '199011282017051004',
        fullName: 'Ustadz Wildan Hakim, Lc.',
        gender: 'L',
        email: 'wildan@alhanif.sch.id',
        phone: '081234567804',
        address: 'Jl. KH. Noer Ali No. 8',
        subjects: ['Akidah Akhlak', 'Tarikh Islam'],
        classIds: ['CLS-7B-2026'],
        status: 'active'
      },
      {
        teacherId: 'TCH-2026-0005',
        nip: '198507202012011002',
        fullName: 'Ustadz Muhammad Ridwan, M.Pd.',
        gender: 'L',
        email: 'ridwan@alhanif.sch.id',
        phone: '081234567805',
        address: 'Kompleks Asrama Guru Blok A1',
        subjects: ['IPA Terpadu', 'Matematika'],
        classIds: ['CLS-9A-2026'],
        status: 'active'
      }
    ];

    for (const t of sampleTeachers) {
      await setDoc(doc(db, 'teachers', t.teacherId), {
        ...t,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // 3. Staff / Tendik
    const sampleStaff: Staff[] = [
      {
        staffId: 'STF-2026-0001',
        nip: '198302102010011005',
        fullName: 'Haji Sukirman, S.E.',
        position: 'Kepala Bagian Tata Usaha',
        email: 'sukirman@alhanif.sch.id',
        phone: '081399887711',
        address: 'Jl. Rawa Silang No. 22',
        status: 'active'
      },
      {
        staffId: 'STF-2026-0002',
        nip: '199105122019021006',
        fullName: 'Bambang Sutrisno, S.Kom.',
        position: 'Operator Dapodik & SIM',
        email: 'tendik@alhanif.sch.id',
        phone: '081399887722',
        address: 'Jl. Mawar Melati Indah No. 5',
        status: 'active'
      },
      {
        staffId: 'STF-2026-0003',
        nip: '198908222016031007',
        fullName: 'Ustadz Syamsul Hadi',
        position: 'Mudir Kesantrian & Asrama',
        email: 'syamsul@alhanif.sch.id',
        phone: '081399887733',
        address: 'Gedung Asrama Putra Lt. 1',
        status: 'active'
      }
    ];

    for (const st of sampleStaff) {
      await setDoc(doc(db, 'staff', st.staffId), {
        ...st,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // 4. Students (focusing on VIII A and others)
    const sampleStudents: Student[] = [
      {
        studentId: 'STU-2026-0001',
        nis: '2608001',
        nisn: '0098765431',
        fullName: 'Ahmad Fauzan Al-Baqir',
        gender: 'L',
        birthPlace: 'Bandung',
        birthDate: '2012-05-14',
        religion: 'Islam',
        address: 'Kompleks Griya Asri Blok D3 No. 12, Bandung',
        phone: '081299001101',
        parentName: 'Hendra Gunawan, S.T.',
        parentPhone: '081299001102',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0002',
        nis: '2608002',
        nisn: '0098765432',
        fullName: 'Muhammad Fatih Al-Ayyubi',
        gender: 'L',
        birthPlace: 'Jakarta',
        birthDate: '2012-08-20',
        religion: 'Islam',
        address: 'Jl. Cempaka Putih Tengah No. 45, Jakarta Pusat',
        phone: '081299001103',
        parentName: 'dr. Fakhri Rahman, Sp.A',
        parentPhone: '081299001104',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0003',
        nis: '2608003',
        nisn: '0098765433',
        fullName: 'Abdullah Rayhan Pratama',
        gender: 'L',
        birthPlace: 'Bekasi',
        birthDate: '2012-03-10',
        religion: 'Islam',
        address: 'Kemang Pratama 2 Blok AF No. 8, Bekasi',
        phone: '081299001105',
        parentName: 'Ir. Agus Pratama',
        parentPhone: '081299001106',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0004',
        nis: '2608004',
        nisn: '0098765434',
        fullName: 'Zaid bin Tsabit Ramadhan',
        gender: 'L',
        birthPlace: 'Bogor',
        birthDate: '2012-09-01',
        religion: 'Islam',
        address: 'Jl. Pajajaran No. 102, Bogor',
        phone: '081299001107',
        parentName: 'Ust. Ramadhan Effendi',
        parentPhone: '081299001108',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0005',
        nis: '2608005',
        nisn: '0098765435',
        fullName: 'Bilal Hafizh Al-Ghazali',
        gender: 'L',
        birthPlace: 'Tangerang',
        birthDate: '2012-11-12',
        religion: 'Islam',
        address: 'Bintaro Jaya Sektor 9, Tangerang Selatan',
        phone: '081299001109',
        parentName: 'H. Dedi Supriyadi',
        parentPhone: '081299001110',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0006',
        nis: '2608006',
        nisn: '0098765436',
        fullName: 'Salman Al-Farisi Rabbani',
        gender: 'L',
        birthPlace: 'Depok',
        birthDate: '2012-02-18',
        religion: 'Islam',
        address: 'Pesona Khayangan Blok AB No. 19, Depok',
        phone: '081299001111',
        parentName: 'Dr. Rabbani Syahputra',
        parentPhone: '081299001112',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0007',
        nis: '2608007',
        nisn: '0098765437',
        fullName: 'Usamah bin Zaid Athallah',
        gender: 'L',
        birthPlace: 'Cirebon',
        birthDate: '2012-07-25',
        religion: 'Islam',
        address: 'Jl. Siliwangi No. 54, Cirebon',
        phone: '081299001113',
        parentName: 'H. Athallah Malik',
        parentPhone: '081299001114',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0008',
        nis: '2608008',
        nisn: '0098765438',
        fullName: 'Hamzah Asadullah Wafi',
        gender: 'L',
        birthPlace: 'Sukabumi',
        birthDate: '2012-04-05',
        religion: 'Islam',
        address: 'Jl. Bhayangkara No. 88, Sukabumi',
        phone: '081299001115',
        parentName: 'Wafiuddin Al-Khattab',
        parentPhone: '081299001116',
        classId: 'CLS-8A-2026',
        className: 'VIII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0009',
        nis: '2607001',
        nisn: '0108765401',
        fullName: 'Tariq Ziyad Al-Farabi',
        gender: 'L',
        birthPlace: 'Jakarta',
        birthDate: '2013-01-15',
        religion: 'Islam',
        address: 'Tebet Timur Dalam No. 11, Jakarta Selatan',
        phone: '081299001117',
        parentName: 'M. Farabi Anwar',
        parentPhone: '081299001118',
        classId: 'CLS-7A-2026',
        className: 'VII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0010',
        nis: '2607002',
        nisn: '0108765402',
        fullName: 'Ibrahim Khalilurrahman',
        gender: 'L',
        birthPlace: 'Bandung',
        birthDate: '2013-06-22',
        religion: 'Islam',
        address: 'Antapani Tengah No. 20, Bandung',
        phone: '081299001119',
        parentName: 'Prof. Ir. Mansyur Khalil',
        parentPhone: '081299001120',
        classId: 'CLS-7A-2026',
        className: 'VII A',
        status: 'active',
        boardingStatus: 'boarding'
      },
      {
        studentId: 'STU-2026-0011',
        nis: '2609001',
        nisn: '0088765301',
        fullName: 'Muadz bin Jabal Firdaus',
        gender: 'L',
        birthPlace: 'Semarang',
        birthDate: '2011-09-14',
        religion: 'Islam',
        address: 'Banyumanik Indah Blok C5, Semarang',
        phone: '081299001121',
        parentName: 'Firdaus Hidayatullah',
        parentPhone: '081299001122',
        classId: 'CLS-9A-2026',
        className: 'IX A',
        status: 'active',
        boardingStatus: 'boarding'
      }
    ];

    for (const s of sampleStudents) {
      await setDoc(doc(db, 'students', s.studentId), {
        ...s,
        namaSiswa: s.fullName,
        nis: s.nis,
        nisn: s.nisn || '',
        jenisKelamin: s.gender,
        tempatLahir: s.birthPlace || '',
        tanggalLahir: s.birthDate || '',
        agama: s.religion || 'Islam',
        alamat: s.address || '',
        noHpSiswa: s.phone || '',
        namaOrangTua: s.parentName || '',
        noHpOrangTua: s.parentPhone || '',
        namaKelas: s.className || '',
        idKelas: s.classId || '',
        statusSantri: s.status || 'active',
        statusAsrama: s.boardingStatus,
        waktuDibuat: serverTimestamp(),
        waktuDiperbarui: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // 5. Settings
    await setDoc(doc(db, 'settings', 'attendance_rules'), {
      allowLate: true,
      lateThreshold: '07:30',
      allowEdit: true,
      maxEditDays: 3,
      defaultStatus: 'HADIR',
      requiredNoteForPermission: true,
      updatedAt: serverTimestamp()
    });

    await setDoc(doc(db, 'settings', 'school_profile'), {
      schoolName: 'SMP IT Putra Al-Hanif',
      institution: 'Al-Hanif Islamic Boarding School',
      npsn: '69958124',
      academicYear: '2026/2027',
      address: 'Kompleks Kampus Putra Al-Hanif Boarding School, Jawa Barat',
      phone: '(021) 8899-2211 / 0811-2233-4455',
      email: 'smpitputra@alhanif.sch.id',
      website: 'https://alhanif.sch.id',
      mudir: 'KH. Abdullah Munir, Lc., M.A.',
      updatedAt: serverTimestamp()
    });

    // 6. Pre-fill sample attendance for past 3 days and today
    const dates = [
      '2026-09-10',
      '2026-09-11',
      '2026-09-12'
    ];

    const batch = writeBatch(db);
    dates.forEach(dt => {
      sampleStudents.slice(0, 8).forEach((st, idx) => {
        const attId = generateAttendanceId(dt, st.studentId);
        let status = 'HADIR';
        let note = null;
        let checkInTime = '07:15';

        if (idx === 2 && dt === '2026-09-12') {
          status = 'TERLAMBAT';
          checkInTime = '07:42';
          note = 'Antrian wudhu asrama';
        } else if (idx === 4 && dt === '2026-09-11') {
          status = 'IZIN';
          note = 'Keperluan keluarga di luar kota';
        } else if (idx === 6 && dt === '2026-09-10') {
          status = 'SAKIT';
          note = 'Istirahat di Klinik Asrama (Demam)';
        }

        const docRef = doc(db, 'attendance', attId);
        batch.set(docRef, {
          attendanceId: attId,
          studentId: st.studentId,
          studentName: st.fullName,
          classId: st.classId,
          className: st.className,
          date: dt,
          status,
          checkInTime: status === 'HADIR' || status === 'TERLAMBAT' ? checkInTime : null,
          note,
          recordedBy: 'seed-admin',
          recordedByName: 'Ustadz Ahmad Fauzi, Lc.',
          // Kolom Bahasa Indonesia di Firestore
          namaSiswa: st.fullName,
          namaKelas: st.className,
          idKelas: st.classId,
          tanggalPresensi: dt,
          statusKehadiran: status,
          waktuPresensi: status === 'HADIR' || status === 'TERLAMBAT' ? checkInTime : null,
          catatan: note,
          namaPencatat: 'Ustadz Ahmad Fauzi, Lc.',
          waktuDibuat: serverTimestamp(),
          waktuDiperbarui: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      });
    });

    await batch.commit();

    // 7. Seed Initial Demo Users in `users` collection so that instant login works smoothly
    const demoUsers: UserProfile[] = [
      {
        uid: 'demo-admin-uid',
        email: 'admin@alhanif.sch.id',
        fullName: 'Ust. H. Rahmat Hidayat, M.Pd.',
        role: 'admin',
        username: 'admin',
        status: 'active',
        phone: '08111222333',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      },
      {
        uid: 'demo-guru-uid',
        email: 'guru@alhanif.sch.id',
        fullName: 'Ustadz Ahmad Fauzi, Lc.',
        role: 'guru',
        username: 'ahmadfauzi',
        teacherId: 'TCH-2026-0001',
        classId: 'CLS-8A-2026',
        status: 'active',
        phone: '081234567801',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      },
      {
        uid: 'demo-tendik-uid',
        email: 'tendik@alhanif.sch.id',
        fullName: 'Bambang Sutrisno, S.Kom.',
        role: 'tendik',
        username: 'bambang',
        staffId: 'STF-2026-0002',
        status: 'active',
        phone: '081399887722',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      },
      {
        uid: 'demo-siswa-uid',
        email: 'siswa@alhanif.sch.id',
        fullName: 'Ahmad Fauzan Al-Baqir',
        role: 'siswa',
        username: 'fauzan',
        studentId: 'STU-2026-0001',
        classId: 'CLS-8A-2026',
        status: 'active',
        phone: '081299001101',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
    ];

    for (const u of demoUsers) {
      await setDoc(doc(db, 'users', u.uid), u, { merge: true });
    }

    return { 
      success: true, 
      message: 'Database SMP IT Putra Al-Hanif berhasil diinisialisasi dengan data kelas, santri, ustadz, dan absensi!' 
    };
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, 'initial_seed');
    }
    console.error('Error seeding initial school data:', error);
    return { 
      success: false, 
      message: `Gagal menginisialisasi database: ${error.message || error}` 
    };
  }
};

export const seedInitialData = seedInitialSchoolData;

/**
 * Memastikan semua data yang tersimpan di Firestore memiliki nama kolom
 * Bahasa Indonesia (seperti namaSiswa, namaKelas, tanggalPresensi, dll.)
 */
export const syncAllIndonesianFieldNames = async (): Promise<{ success: boolean; updatedCount: number; message: string }> => {
  try {
    let totalUpdated = 0;

    // 1. Sync Students
    const studentsSnap = await getDocs(collection(db, 'students'));
    const studentBatch = writeBatch(db);
    let studentCount = 0;

    studentsSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      const needsSync = !data.namaSiswa || !data.namaKelas;
      if (needsSync) {
        studentBatch.update(docSnap.ref, {
          namaSiswa: data.fullName || data.namaSiswa || '',
          nis: data.nis || '',
          nisn: data.nisn || '',
          jenisKelamin: data.gender || 'L',
          tempatLahir: data.birthPlace || '',
          tanggalLahir: data.birthDate || '',
          agama: data.religion || 'Islam',
          alamat: data.address || '',
          noHpSiswa: data.phone || '',
          namaOrangTua: data.parentName || '',
          noHpOrangTua: data.parentPhone || '',
          namaKelas: data.className || '',
          idKelas: data.classId || '',
          statusSantri: data.status || 'active',
          statusAsrama: data.boardingStatus || 'boarding',
          waktuDiperbarui: serverTimestamp()
        });
        studentCount++;
      }
    });

    if (studentCount > 0) {
      await studentBatch.commit();
      totalUpdated += studentCount;
    }

    // 2. Sync Classes
    const classesSnap = await getDocs(collection(db, 'classes'));
    const classBatch = writeBatch(db);
    let classCount = 0;

    classesSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.namaKelas) {
        classBatch.update(docSnap.ref, {
          namaKelas: data.className || '',
          tingkat: data.grade || 7,
          tahunAjaran: data.academicYear || '2026/2027',
          namaWaliKelas: data.homeroomTeacherName || '',
          idWaliKelas: data.homeroomTeacherId || '',
          jumlahSiswa: data.studentCount || 0,
          statusKelas: data.status || 'active',
          waktuDiperbarui: serverTimestamp()
        });
        classCount++;
      }
    });

    if (classCount > 0) {
      await classBatch.commit();
      totalUpdated += classCount;
    }

    return {
      success: true,
      updatedCount: totalUpdated,
      message: `Sinkronisasi kolom Bahasa Indonesia selesai (${totalUpdated} data diperbarui).`
    };
  } catch (err: any) {
    console.error('Error syncing Indonesian field names:', err);
    return {
      success: false,
      updatedCount: 0,
      message: `Gagal sinkronisasi data: ${err?.message || err}`
    };
  }
};
