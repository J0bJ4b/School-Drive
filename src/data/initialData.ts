import {
  User,
  UserGroup,
  Category,
  Folder,
  DocumentFile,
  AuditLog,
  BackupSnapshot,
  RestoreLog,
  SystemNotification,
  SystemSettings
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  schoolName: 'โรงเรียนสาธิตเทศบาลนครพัฒนาศึกษา',
  systemName: 'ระบบ School Drive',
  loginMode: 'hybrid', // 'google' | 'credentials' | 'hybrid'
  maxFileSizeMB: 100,
  disallowedExtensions: ['exe', 'bat', 'sh', 'vbs', 'msi', 'cmd', 'scr'],
  isPublicLinkGlobalEnabled: true,
  autoBackupTime: '03:00',
  isMaintenanceMode: false,
  lastAutoBackupTimestamp: '2026-09-30T03:00:00.000Z',
  autoBackupStatus: 'success',
  userDefaultQuotaMB: 5120, // 5GB per user
  totalSystemStorageGB: 200,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'u-admin',
    username: 'admin',
    name: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    position: 'ผู้อำนวยการ / ผู้ดูแลระบบสูงสุด',
    email: 'admin@school.ac.th',
    role: 'admin',
    department: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    groupIds: ['g-admin', 'g-board'],
    mustChangePassword: false,
    failedAttempts: 0,
    storageUsedBytes: 1420000000,
    storageQuotaBytes: 53687091200, // 50GB
    isGoogleAccount: false,
    passwordHash: 'A12345678+',
  },
  {
    id: 'u-head-academic',
    username: 'head_academic',
    name: 'ครูวิภาดา กิตติคุณ',
    position: 'หัวหน้ากลุ่มงานวิชาการ',
    email: 'wipada.k@school.ac.th',
    role: 'head',
    department: 'academic',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    groupIds: ['g-academic', 'g-board'],
    mustChangePassword: false,
    failedAttempts: 0,
    storageUsedBytes: 2840000000,
    storageQuotaBytes: 21474836480, // 20GB
    isGoogleAccount: true,
    passwordHash: 'A12345678+',
  },
  {
    id: 'u-head-finance',
    username: 'head_finance',
    name: 'ครูกิตติศักดิ์ เจริญศรี',
    position: 'หัวหน้างานการเงินและพัสดุ',
    email: 'kittisak.c@school.ac.th',
    role: 'head',
    department: 'finance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    groupIds: ['g-finance', 'g-board'],
    mustChangePassword: false,
    failedAttempts: 0,
    storageUsedBytes: 1980000000,
    storageQuotaBytes: 21474836480,
    isGoogleAccount: false,
    passwordHash: 'A12345678+',
  },
  {
    id: 'u-teacher-somchai',
    username: 'teacher_somchai',
    name: 'ครูสมชาย มีสุข',
    position: 'ครูชำนาญการพิเศษ กลุ่มสาระคณิตศาสตร์',
    email: 'somchai.m@school.ac.th',
    role: 'staff',
    department: 'academic',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    groupIds: ['g-academic', 'g-math'],
    mustChangePassword: false,
    failedAttempts: 0,
    storageUsedBytes: 850000000,
    storageQuotaBytes: 5368709120, // 5GB
    isGoogleAccount: true,
    passwordHash: 'A12345678+',
  },
  {
    id: 'u-teacher-preecha',
    username: 'teacher_preecha',
    name: 'ครูปรีชา รักษ์ดี',
    position: 'เจ้าหน้าที่งานทะเบียนและพัฒนาบุคลากร',
    email: 'preecha.r@school.ac.th',
    role: 'staff',
    department: 'personnel',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    groupIds: ['g-personnel'],
    mustChangePassword: true, // Needs to change password on first login
    failedAttempts: 0,
    storageUsedBytes: 420000000,
    storageQuotaBytes: 5368709120,
    isGoogleAccount: false,
    passwordHash: 'A12345678+',
  },
  {
    id: 'u-viewer-guest',
    username: 'viewer_guest',
    name: 'นายนิพนธ์ ใจเย็น',
    position: 'เจ้าหน้าที่ตรวจสอบคุณภาพภายนอก (ผู้อ่าน)',
    email: 'niphon.audit@external.org',
    role: 'viewer',
    department: 'others',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    groupIds: [],
    mustChangePassword: false,
    failedAttempts: 0,
    storageUsedBytes: 0,
    storageQuotaBytes: 1073741824, // 1GB
    isGoogleAccount: false,
    passwordHash: 'A12345678+',
  }
];

export const INITIAL_GROUPS: UserGroup[] = [
  {
    id: 'g-math',
    name: 'ครูกลุ่มสาระคณิตศาสตร์',
    description: 'ครูผู้สอนวิชาคณิตศาสตร์ ระดับมัธยมศึกษาปีที่ 1-6',
    memberUserIds: ['u-teacher-somchai', 'u-head-academic'],
    color: 'emerald',
  },
  {
    id: 'g-academic',
    name: 'งานวิชาการและพัฒนาหลักสูตร',
    description: 'คณะทำงานพัฒนาหลักสูตร งานวัดผล และประกันคุณภาพการศึกษา',
    memberUserIds: ['u-head-academic', 'u-teacher-somchai'],
    color: 'blue',
  },
  {
    id: 'g-finance',
    name: 'งานพัสดุ การเงินและงบประมาณ',
    description: 'เจ้าหน้าที่และครูผู้รับผิดชอบการเบิกจ่ายและจัดซื้อจัดจ้าง',
    memberUserIds: ['u-head-finance', 'u-admin'],
    color: 'amber',
  },
  {
    id: 'g-personnel',
    name: 'งานบริหารงานบุคคลและสวัสดิการ',
    description: 'งานทะเบียนประวัติ วันลา การประเมินวิทยฐานะ และสวัสดิการครู',
    memberUserIds: ['u-teacher-preecha', 'u-admin'],
    color: 'purple',
  },
  {
    id: 'g-board',
    name: 'คณะกรรมการบริหารสถานศึกษา',
    description: 'ผู้อำนวยการ และหัวหน้ากลุ่มงาน 4 ฝ่าย',
    memberUserIds: ['u-admin', 'u-head-academic', 'u-head-finance'],
    color: 'indigo',
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-admin',
    name: 'บริหาร',
    code: 'admin',
    iconName: 'Building2',
    description: 'งานบริหารทั่วไป คำสั่ง นโยบาย รายงานการประชุมคณะกรรมการ',
    order: 1,
  },
  {
    id: 'cat-academic',
    name: 'วิชาการ',
    code: 'academic',
    iconName: 'GraduationCap',
    description: 'แผนการจัดการเรียนรู้ สื่อการสอน งานวัดและประเมินผล วิจัยในชั้นเรียน',
    order: 2,
  },
  {
    id: 'cat-personnel',
    name: 'บุคคล',
    code: 'personnel',
    iconName: 'Users',
    description: 'ประวัติบุคลากร คำสั่งไปราชการ พัฒนาวิชาชีพ ว.PA และวันลา',
    order: 3,
  },
  {
    id: 'cat-finance',
    name: 'การเงิน',
    code: 'finance',
    iconName: 'Coins',
    description: 'งบประมาณ จัดซื้อจัดจ้าง ใบสำคัญเบิกจ่าย พัสดุและครุภัณฑ์',
    order: 4,
  },
  {
    id: 'cat-others',
    name: 'อื่นๆ',
    code: 'others',
    iconName: 'FolderArchive',
    description: 'เอกสารกิจกรรมสัมพันธ์ โครงการพิเศษ กิจกรรมชุมชน สมาคมผู้ปกครอง',
    order: 5,
  }
];

export const INITIAL_FOLDERS: Folder[] = [
  // Academic Category Folders (Demonstrating nested up to 6 levels in initial seed, capable up to 10)
  {
    id: 'f-acad-1',
    name: 'แผนการจัดการเรียนรู้ 2569',
    categoryId: 'cat-academic',
    parentFolderId: null,
    depth: 1,
    createdAt: '2026-05-10T08:00:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z',
    createdByUserId: 'u-head-academic',
    createdByUserName: 'ครูวิภาดา กิตติคุณ',
    sharedWith: [
      {
        id: 'sp-1',
        targetType: 'group',
        targetId: 'g-academic',
        targetName: 'งานวิชาการและพัฒนาหลักสูตร',
        role: 'editor',
        grantedAt: '2026-05-10T08:00:00.000Z',
        grantedByUserId: 'u-head-academic',
        grantedByUserName: 'ครูวิภาดา กิตติคุณ'
      }
    ]
  },
  {
    id: 'f-acad-1-sem1',
    name: 'ภาคเรียนที่ 1',
    categoryId: 'cat-academic',
    parentFolderId: 'f-acad-1',
    depth: 2,
    createdAt: '2026-05-12T09:00:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z',
    createdByUserId: 'u-head-academic',
    createdByUserName: 'ครูวิภาดา กิตติคุณ',
    sharedWith: []
  },
  {
    id: 'f-acad-1-sem1-m3',
    name: 'ระดับมัธยมศึกษาปีที่ 3',
    categoryId: 'cat-academic',
    parentFolderId: 'f-acad-1-sem1',
    depth: 3,
    createdAt: '2026-05-15T11:00:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z',
    createdByUserId: 'u-teacher-somchai',
    createdByUserName: 'ครูสมชาย มีสุข',
    sharedWith: []
  },
  {
    id: 'f-acad-1-sem1-m3-math',
    name: 'กลุ่มสาระคณิตศาสตร์ ม.3',
    categoryId: 'cat-academic',
    parentFolderId: 'f-acad-1-sem1-m3',
    depth: 4,
    createdAt: '2026-05-16T13:00:00.000Z',
    updatedAt: '2026-09-22T14:10:00.000Z',
    createdByUserId: 'u-teacher-somchai',
    createdByUserName: 'ครูสมชาย มีสุข',
    sharedWith: [
      {
        id: 'sp-2',
        targetType: 'group',
        targetId: 'g-math',
        targetName: 'ครูกลุ่มสาระคณิตศาสตร์',
        role: 'editor',
        grantedAt: '2026-05-16T13:00:00.000Z',
        grantedByUserId: 'u-teacher-somchai',
        grantedByUserName: 'ครูสมชาย มีสุข'
      }
    ]
  },
  {
    id: 'f-acad-assessment',
    name: 'งานวัดและประเมินผล',
    categoryId: 'cat-academic',
    parentFolderId: null,
    depth: 1,
    createdAt: '2026-06-01T09:00:00.000Z',
    updatedAt: '2026-09-25T11:20:00.000Z',
    createdByUserId: 'u-head-academic',
    createdByUserName: 'ครูวิภาดา กิตติคุณ',
    sharedWith: []
  },
  // Finance Folders
  {
    id: 'f-fin-1',
    name: 'งบประมาณแผ่นดิน ปี 2569',
    categoryId: 'cat-finance',
    parentFolderId: null,
    depth: 1,
    createdAt: '2026-01-05T08:30:00.000Z',
    updatedAt: '2026-09-18T16:00:00.000Z',
    createdByUserId: 'u-head-finance',
    createdByUserName: 'ครูกิตติศักดิ์ เจริญศรี',
    sharedWith: [
      {
        id: 'sp-fin',
        targetType: 'group',
        targetId: 'g-finance',
        targetName: 'งานพัสดุ การเงินและงบประมาณ',
        role: 'editor',
        grantedAt: '2026-01-05T08:30:00.000Z',
        grantedByUserId: 'u-head-finance',
        grantedByUserName: 'ครูกิตติศักดิ์ เจริญศรี'
      }
    ]
  },
  {
    id: 'f-fin-q1',
    name: 'ไตรมาสที่ 1 (ต.ค. - ธ.ค.)',
    categoryId: 'cat-finance',
    parentFolderId: 'f-fin-1',
    depth: 2,
    createdAt: '2026-01-10T10:00:00.000Z',
    updatedAt: '2026-09-18T16:00:00.000Z',
    createdByUserId: 'u-head-finance',
    createdByUserName: 'ครูกิตติศักดิ์ เจริญศรี',
    sharedWith: []
  },
  // Administration Folders
  {
    id: 'f-adm-orders',
    name: 'คำสั่งโรงเรียน ประจำปี 2569',
    categoryId: 'cat-admin',
    parentFolderId: null,
    depth: 1,
    createdAt: '2026-01-02T08:00:00.000Z',
    updatedAt: '2026-09-28T09:15:00.000Z',
    createdByUserId: 'u-admin',
    createdByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    sharedWith: [
      {
        id: 'sp-adm-all',
        targetType: 'everyone',
        targetName: 'ทุกคนในหน่วยงาน',
        role: 'viewer',
        grantedAt: '2026-01-02T08:00:00.000Z',
        grantedByUserId: 'u-admin',
        grantedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์'
      }
    ]
  },
  // Personnel Folders
  {
    id: 'f-hr-pa',
    name: 'แบบประเมิน ว.PA และวิทยฐานะ',
    categoryId: 'cat-personnel',
    parentFolderId: null,
    depth: 1,
    createdAt: '2026-02-15T09:30:00.000Z',
    updatedAt: '2026-09-15T14:45:00.000Z',
    createdByUserId: 'u-teacher-preecha',
    createdByUserName: 'ครูปรีชา รักษ์ดี',
    sharedWith: []
  }
];

export const INITIAL_FILES: DocumentFile[] = [
  // 1. Template: แบบฟอร์มบันทึกข้อความราชการ
  {
    id: 'doc-template-1',
    name: 'แบบฟอร์มบันทึกข้อความขออนุมัติจัดกิจกรรมและโครงการ (กลาง)',
    originalName: 'แบบฟอร์มบันทึกข้อความ_โครงการกลาง.docx',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    categoryId: 'cat-admin',
    folderId: null,
    sizeBytes: 452000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-01-10T09:00:00.000Z',
        uploadedByUserId: 'u-admin',
        uploadedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
        sizeBytes: 452000,
        fileUrl: 'https://docs.google.com/document/d/1DemoSchoolOfficialTemplate01/edit',
        changeNote: 'แบบฟอร์มมาตรฐานตามระเบียบงานสารบรรณ พ.ศ. 2569'
      }
    ],
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-01-10T09:00:00.000Z',
    createdByUserId: 'u-admin',
    createdByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    isStarred: true,
    isTemplate: true,
    tags: ['เทมเพลต', 'บันทึกข้อความ', 'งานสารบรรณ', 'ขออนุมัติโครงการ'],
    sharedWith: [
      {
        id: 'sp-t1',
        targetType: 'everyone',
        targetName: 'ทุกคนในหน่วยงาน',
        role: 'viewer',
        grantedAt: '2026-01-10T09:00:00.000Z',
        grantedByUserId: 'u-admin',
        grantedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์'
      }
    ],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'synced',
    driveFileId: 'drive_template_01_saraban',
    downloadCount: 142,
    previewCount: 380,
    description: 'แบบฟอร์มบันทึกข้อความราชการมาตรฐานสำหรับคุณครูและบุคลากรทุกท่าน'
  },
  // 2. Template: แบบคำขอไปราชการ
  {
    id: 'doc-template-2',
    name: 'แบบคำขออนุมัติไปราชการและอบรมพัฒนาวิชาชีพ (Template)',
    originalName: 'แบบคำขอไปราชการ.pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    categoryId: 'cat-personnel',
    folderId: 'f-hr-pa',
    sizeBytes: 320000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-02-01T10:00:00.000Z',
        uploadedByUserId: 'u-teacher-preecha',
        uploadedByUserName: 'ครูปรีชา รักษ์ดี',
        sizeBytes: 320000,
        fileUrl: 'https://docs.google.com/document/d/1DemoDutyTravelTemplate/edit',
        changeNote: 'ฉบับปรับปรุงตามเกณฑ์คุรุสภา'
      }
    ],
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
    createdByUserId: 'u-teacher-preecha',
    createdByUserName: 'ครูปรีชา รักษ์ดี',
    isStarred: false,
    isTemplate: true,
    tags: ['เทมเพลต', 'ไปราชการ', 'อบรม', 'พัฒนาวิชาชีพ'],
    sharedWith: [
      {
        id: 'sp-t2',
        targetType: 'everyone',
        targetName: 'ทุกคนในหน่วยงาน',
        role: 'viewer',
        grantedAt: '2026-02-01T10:00:00.000Z',
        grantedByUserId: 'u-teacher-preecha',
        grantedByUserName: 'ครูปรีชา รักษ์ดี'
      }
    ],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'synced',
    driveFileId: 'drive_template_02_travel',
    downloadCount: 89,
    previewCount: 215,
    description: 'ใช้สำหรับทำเรื่องขออนุมัติเดินทางไปอบรมหรือเข้าร่วมสัมมนาภายนอก'
  },
  // 3. Document with 3 versions (Demonstrating version history & restore)
  {
    id: 'doc-report-assessment',
    name: 'รายงานสรุปผลสัมฤทธิ์ทางการเรียนและการประเมินคุณภาพผู้เรียน ภาคเรียนที่ 1-2569',
    originalName: 'รายงานสรุปผลสัมฤทธิ์_ม3_ภาคเรียนที่1.pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    categoryId: 'cat-academic',
    folderId: 'f-acad-assessment',
    sizeBytes: 3840000,
    currentVersion: 3,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-09-15T14:30:00.000Z',
        uploadedByUserId: 'u-teacher-somchai',
        uploadedByUserName: 'ครูสมชาย มีสุข',
        sizeBytes: 3400000,
        fileUrl: 'https://docs.google.com/viewer?url=demo_assessment_v1.pdf',
        changeNote: 'ฉบับร่างรอบที่ 1 รวบรวมข้อมูลคะแนนสอบกลางภาค',
        checksum: 'sha256-a1b2c3d4e5f6'
      },
      {
        versionNumber: 2,
        uploadedAt: '2026-09-22T16:00:00.000Z',
        uploadedByUserId: 'u-teacher-somchai',
        uploadedByUserName: 'ครูสมชาย มีสุข',
        sizeBytes: 3720000,
        fileUrl: 'https://docs.google.com/viewer?url=demo_assessment_v2.pdf',
        changeNote: 'แก้ไขกราฟเปรียบเทียบคะแนน O-NET และเพิ่มผลสัมฤทธิ์ปลายภาค',
        checksum: 'sha256-b2c3d4e5f6g7'
      },
      {
        versionNumber: 3,
        uploadedAt: '2026-09-28T11:20:00.000Z',
        uploadedByUserId: 'u-head-academic',
        uploadedByUserName: 'ครูวิภาดา กิตติคุณ',
        sizeBytes: 3840000,
        fileUrl: 'https://docs.google.com/viewer?url=demo_assessment_v3.pdf',
        changeNote: 'อนุมัติฉบับสมบูรณ์ พร้อมลายเซ็นหัวหน้าฝ่ายและแนบภาคผนวก',
        checksum: 'sha256-c3d4e5f6g7h8'
      }
    ],
    createdAt: '2026-09-15T14:30:00.000Z',
    updatedAt: '2026-09-28T11:20:00.000Z',
    createdByUserId: 'u-teacher-somchai',
    createdByUserName: 'ครูสมชาย มีสุข',
    isStarred: true,
    isTemplate: false,
    tags: ['ผลสัมฤทธิ์', 'วัดผล', 'มัธยมศึกษา', 'วิชาการ', 'รายงานสรุป'],
    sharedWith: [
      {
        id: 'sp-doc-1',
        targetType: 'group',
        targetId: 'g-academic',
        targetName: 'งานวิชาการและพัฒนาหลักสูตร',
        role: 'editor',
        grantedAt: '2026-09-15T14:30:00.000Z',
        grantedByUserId: 'u-teacher-somchai',
        grantedByUserName: 'ครูสมชาย มีสุข'
      },
      {
        id: 'sp-doc-2',
        targetType: 'user',
        targetId: 'u-head-academic',
        targetName: 'ครูวิภาดา กิตติคุณ',
        role: 'editor',
        grantedAt: '2026-09-15T14:30:00.000Z',
        grantedByUserId: 'u-teacher-somchai',
        grantedByUserName: 'ครูสมชาย มีสุข'
      },
      {
        id: 'sp-doc-3',
        targetType: 'user',
        targetId: 'u-viewer-guest',
        targetName: 'นายนิพนธ์ ใจเย็น (เจ้าหน้าที่ตรวจสอบภายนอก)',
        role: 'viewer',
        grantedAt: '2026-09-29T08:00:00.000Z',
        grantedByUserId: 'u-head-academic',
        grantedByUserName: 'ครูวิภาดา กิตติคุณ'
      }
    ],
    isPublicLinkEnabled: true,
    publicLinkId: 'pub-assessment-2569-m3',
    driveSyncStatus: 'synced',
    driveFileId: 'drive_assessment_report_2569',
    downloadCount: 74,
    previewCount: 230,
    description: 'เอกสารรายงานผลสัมฤทธิ์อย่างเป็นทางการ เสนอคณะกรรมการสถานศึกษา'
  },
  // 4. File in deep folder (Math Plan)
  {
    id: 'doc-math-plan',
    name: 'แผนการจัดการเรียนรู้รายวิชาคณิตศาสตร์เพิ่มเติม ม.3 เล่ม 1',
    originalName: 'แผนการสอน_คณิต_ม3_ภาค1.docx',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    categoryId: 'cat-academic',
    folderId: 'f-acad-1-sem1-m3-math',
    sizeBytes: 5240000,
    currentVersion: 2,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-05-20T10:00:00.000Z',
        uploadedByUserId: 'u-teacher-somchai',
        uploadedByUserName: 'ครูสมชาย มีสุข',
        sizeBytes: 4800000,
        fileUrl: 'https://docs.google.com/document/d/1DemoMathPlanM3_v1/edit',
        changeNote: 'แผนการจัดการเรียนรู้รายหน่วยที่ 1-3'
      },
      {
        versionNumber: 2,
        uploadedAt: '2026-08-14T09:20:00.000Z',
        uploadedByUserId: 'u-teacher-somchai',
        uploadedByUserName: 'ครูสมชาย มีสุข',
        sizeBytes: 5240000,
        fileUrl: 'https://docs.google.com/document/d/1DemoMathPlanM3_v2/edit',
        changeNote: 'เพิ่มกิจกรรม Active Learning และเกณฑ์การประเมินรูบริกส์ (Rubric)'
      }
    ],
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-08-14T09:20:00.000Z',
    createdByUserId: 'u-teacher-somchai',
    createdByUserName: 'ครูสมชาย มีสุข',
    isStarred: true,
    isTemplate: false,
    tags: ['แผนการสอน', 'คณิตศาสตร์', 'ม.3', 'Active Learning'],
    sharedWith: [
      {
        id: 'sp-math-plan',
        targetType: 'group',
        targetId: 'g-math',
        targetName: 'ครูกลุ่มสาระคณิตศาสตร์',
        role: 'editor',
        grantedAt: '2026-05-20T10:00:00.000Z',
        grantedByUserId: 'u-teacher-somchai',
        grantedByUserName: 'ครูสมชาย มีสุข'
      }
    ],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'synced',
    driveFileId: 'drive_math_plan_m3_2569',
    downloadCount: 32,
    previewCount: 96,
    description: 'แผนการสอนตามตัวชี้วัดและสาระการเรียนรู้แกนกลาง'
  },
  // 5. Finance Spreadsheet
  {
    id: 'doc-fin-budget',
    name: 'ทะเบียนคุมงบประมาณและการเบิกจ่ายเงินอุดหนุนรายหัว ประจำปี 2569',
    originalName: 'ทะเบียนงบประมาณ_2569.xlsx',
    extension: 'xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    categoryId: 'cat-finance',
    folderId: 'f-fin-q1',
    sizeBytes: 1250000,
    currentVersion: 2,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-01-15T11:00:00.000Z',
        uploadedByUserId: 'u-head-finance',
        uploadedByUserName: 'ครูกิตติศักดิ์ เจริญศรี',
        sizeBytes: 1100000,
        fileUrl: 'https://docs.google.com/spreadsheets/d/1DemoFinanceBudget/edit',
        changeNote: 'ยอดจัดสรรเริ่มต้นงบอุดหนุน'
      },
      {
        versionNumber: 2,
        uploadedAt: '2026-09-24T15:30:00.000Z',
        uploadedByUserId: 'u-head-finance',
        uploadedByUserName: 'ครูกิตติศักดิ์ เจริญศรี',
        sizeBytes: 1250000,
        fileUrl: 'https://docs.google.com/spreadsheets/d/1DemoFinanceBudget_v2/edit',
        changeNote: 'อัปเดตการเบิกจ่ายสิ้นงวดเดือนสิงหาคม'
      }
    ],
    createdAt: '2026-01-15T11:00:00.000Z',
    updatedAt: '2026-09-24T15:30:00.000Z',
    createdByUserId: 'u-head-finance',
    createdByUserName: 'ครูกิตติศักดิ์ เจริญศรี',
    isStarred: false,
    isTemplate: false,
    tags: ['งบประมาณ', 'การเงิน', 'เบิกจ่าย', 'เงินอุดหนุน'],
    sharedWith: [
      {
        id: 'sp-fin-b1',
        targetType: 'user',
        targetId: 'u-admin',
        targetName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
        role: 'editor',
        grantedAt: '2026-01-15T11:00:00.000Z',
        grantedByUserId: 'u-head-finance',
        grantedByUserName: 'ครูกิตติศักดิ์ เจริญศรี'
      },
      {
        id: 'sp-fin-b2',
        targetType: 'group',
        targetId: 'g-finance',
        targetName: 'งานพัสดุ การเงินและงบประมาณ',
        role: 'editor',
        grantedAt: '2026-01-15T11:00:00.000Z',
        grantedByUserId: 'u-head-finance',
        grantedByUserName: 'ครูกิตติศักดิ์ เจริญศรี'
      }
    ],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'synced',
    driveFileId: 'drive_budget_ledger_2569',
    downloadCount: 18,
    previewCount: 65,
    description: 'ทะเบียนคุมงบประมาณสำหรับตรวจสอบยอดเงินคงเหลือแบบเรียลไทม์'
  },
  // 6. Admin School Order (Public / Shared to everyone)
  {
    id: 'doc-adm-order-01',
    name: 'คำสั่งโรงเรียน ที่ ๑๒๔/๒๕๖๙ เรื่อง แต่งตั้งคณะกรรมการดำเนินงานสัปดาห์วิทยาศาสตร์และคณิตศาสตร์',
    originalName: 'คำสั่งที่124_2569.pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    categoryId: 'cat-admin',
    folderId: 'f-adm-orders',
    sizeBytes: 890000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-08-01T08:30:00.000Z',
        uploadedByUserId: 'u-admin',
        uploadedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
        sizeBytes: 890000,
        fileUrl: 'https://docs.google.com/viewer?url=demo_order_124.pdf',
        changeNote: 'ลงนามเรียบร้อย ประกาศบังคับใช้'
      }
    ],
    createdAt: '2026-08-01T08:30:00.000Z',
    updatedAt: '2026-08-01T08:30:00.000Z',
    createdByUserId: 'u-admin',
    createdByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    isStarred: true,
    isTemplate: false,
    tags: ['คำสั่งโรงเรียน', 'แต่งตั้งคณะกรรมการ', 'สัปดาห์วิทยาศาสตร์'],
    sharedWith: [
      {
        id: 'sp-order-all',
        targetType: 'everyone',
        targetName: 'ทุกคนในหน่วยงาน',
        role: 'viewer',
        grantedAt: '2026-08-01T08:30:00.000Z',
        grantedByUserId: 'u-admin',
        grantedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์'
      }
    ],
    isPublicLinkEnabled: true,
    publicLinkId: 'pub-order-124-science',
    driveSyncStatus: 'synced',
    driveFileId: 'drive_order_124_2569',
    downloadCount: 165,
    previewCount: 420,
    description: 'คำสั่งแต่งตั้งคณะกรรมการและหน้าที่รับผิดชอบกิจกรรมสัปดาห์วิทยาศาสตร์'
  },
  // 7. Personnel PA Document
  {
    id: 'doc-pa-guideline',
    name: 'คู่มือการจัดทำข้อตกลงในการพัฒนางาน (PA) สำหรับข้าราชการครูและบุคลากรทางการศึกษา',
    originalName: 'คู่มือPA_ฉบับสมบูรณ์.pdf',
    extension: 'pdf',
    mimeType: 'application/pdf',
    categoryId: 'cat-personnel',
    folderId: 'f-hr-pa',
    sizeBytes: 4200000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-03-01T13:00:00.000Z',
        uploadedByUserId: 'u-teacher-preecha',
        uploadedByUserName: 'ครูปรีชา รักษ์ดี',
        sizeBytes: 4200000,
        fileUrl: 'https://docs.google.com/viewer?url=demo_pa_guide.pdf',
        changeNote: 'เอกสารแนวปฏิบัติจาก ก.ค.ศ.'
      }
    ],
    createdAt: '2026-03-01T13:00:00.000Z',
    updatedAt: '2026-03-01T13:00:00.000Z',
    createdByUserId: 'u-teacher-preecha',
    createdByUserName: 'ครูปรีชา รักษ์ดี',
    isStarred: false,
    isTemplate: false,
    tags: ['PA', 'วิทยฐานะ', 'คู่มือ', 'บุคลากร', 'ก.ค.ศ.'],
    sharedWith: [
      {
        id: 'sp-pa-all',
        targetType: 'everyone',
        targetName: 'ทุกคนในหน่วยงาน',
        role: 'viewer',
        grantedAt: '2026-03-01T13:00:00.000Z',
        grantedByUserId: 'u-teacher-preecha',
        grantedByUserName: 'ครูปรีชา รักษ์ดี'
      }
    ],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'synced',
    driveFileId: 'drive_pa_guide_official',
    downloadCount: 92,
    previewCount: 310,
    description: 'แนวทางการเขียน PA และตัวชี้วัดผลการปฏิบัติงาน'
  },
  // 8. Presentation file in Others
  {
    id: 'doc-others-pres',
    name: 'สไลด์นำเสนอผลการดำเนินงานโรงเรียนรอบ 6 เดือน ต่อสมาคมผู้ปกครองและครู',
    originalName: 'สรุปผลงานรอบ6เดือน_สมาคมผู้ปกครอง.pptx',
    extension: 'pptx',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    categoryId: 'cat-others',
    folderId: null,
    sizeBytes: 8750000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-09-10T10:15:00.000Z',
        uploadedByUserId: 'u-admin',
        uploadedByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
        sizeBytes: 8750000,
        fileUrl: 'https://docs.google.com/presentation/d/1DemoParentMeetingSlides/edit',
        changeNote: 'ฉบับนำเสนอที่ประชุม'
      }
    ],
    createdAt: '2026-09-10T10:15:00.000Z',
    updatedAt: '2026-09-10T10:15:00.000Z',
    createdByUserId: 'u-admin',
    createdByUserName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    isStarred: false,
    isTemplate: false,
    tags: ['สมาคมผู้ปกครอง', 'นำเสนอ', 'ผลงานโรงเรียน'],
    sharedWith: [],
    isPublicLinkEnabled: true,
    publicLinkId: 'pub-parent-meeting-2569',
    driveSyncStatus: 'synced',
    driveFileId: 'drive_pres_parent_association',
    downloadCount: 24,
    previewCount: 88,
    description: 'สรุปภาพกิจกรรมและโครงการเด่นในรอบภาคเรียน'
  },
  // 9. Trash item (Soft deleted, within 30 days)
  {
    id: 'doc-trash-draft',
    name: 'ร่างคำสั่งจัดอบรมเชิงปฏิบัติการ AI เพื่อการเรียนรู้ (ยกเลิก)',
    originalName: 'ร่างคำสั่ง_ยกเลิก.docx',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    categoryId: 'cat-academic',
    folderId: null,
    sizeBytes: 310000,
    currentVersion: 1,
    versions: [
      {
        versionNumber: 1,
        uploadedAt: '2026-09-02T11:00:00.000Z',
        uploadedByUserId: 'u-teacher-somchai',
        uploadedByUserName: 'ครูสมชาย มีสุข',
        sizeBytes: 310000,
        fileUrl: 'https://docs.google.com/document/d/1DemoTrashDoc/edit',
        changeNote: 'ร่างครั้งแรก'
      }
    ],
    createdAt: '2026-09-02T11:00:00.000Z',
    updatedAt: '2026-09-18T14:20:00.000Z',
    createdByUserId: 'u-teacher-somchai',
    createdByUserName: 'ครูสมชาย มีสุข',
    isStarred: false,
    isTemplate: false,
    isTrash: true,
    deletedAt: '2026-09-18T14:20:00.000Z', // Deleted 12 days ago, 18 days remaining until 30-day purge
    tags: ['ร่าง', 'ยกเลิก'],
    sharedWith: [],
    isPublicLinkEnabled: false,
    driveSyncStatus: 'revoked',
    driveFileId: 'drive_trash_draft_01',
    downloadCount: 2,
    previewCount: 5,
    description: 'ย้ายลงถังขยะเนื่องจากมีคำสั่งฉบับใหม่มาแทนที่'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-30T07:15:20.000Z',
    userId: 'u-admin',
    userName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    userRole: 'admin',
    action: 'login',
    targetType: 'system',
    targetName: 'เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน',
    details: 'IP: 192.168.1.10 (เครือข่ายโรงเรียน)'
  },
  {
    id: 'log-02',
    timestamp: '2026-09-30T03:00:02.000Z',
    userId: 'system',
    userName: 'ระบบสำรองข้อมูลอัตโนมัติ (Cron Nightly)',
    userRole: 'admin',
    action: 'admin_repair',
    targetType: 'system',
    targetName: 'สำรองข้อมูลประจำคืนอัตโนมัติ',
    details: 'สำรองเอกสาร 8 ไฟล์, โฟลเดอร์ 9 รายการ ขนาดรวม 24.2 MB สำเร็จ 100%'
  },
  {
    id: 'log-03',
    timestamp: '2026-09-29T16:45:10.000Z',
    userId: 'u-head-academic',
    userName: 'ครูวิภาดา กิตติคุณ',
    userRole: 'head',
    action: 'share',
    targetType: 'file',
    targetName: 'รายงานสรุปผลสัมฤทธิ์ทางการเรียนฯ ภาคเรียนที่ 1-2569',
    details: 'แชร์สิทธิ์ "ผู้อ่าน" ให้นายนิพนธ์ ใจเย็น (เจ้าหน้าที่ภายนอก)'
  },
  {
    id: 'log-04',
    timestamp: '2026-09-28T11:20:00.000Z',
    userId: 'u-head-academic',
    userName: 'ครูวิภาดา กิตติคุณ',
    userRole: 'head',
    action: 'upload',
    targetType: 'file',
    targetName: 'รายงานสรุปผลสัมฤทธิ์ทางการเรียนฯ ภาคเรียนที่ 1-2569',
    details: 'อัปโหลดเวอร์ชันใหม่ v3 (ขนาด 3.84 MB) พร้อมบันทึกอนุมัติ'
  },
  {
    id: 'log-05',
    timestamp: '2026-09-24T15:30:00.000Z',
    userId: 'u-head-finance',
    userName: 'ครูกิตติศักดิ์ เจริญศรี',
    userRole: 'head',
    action: 'edit',
    targetType: 'file',
    targetName: 'ทะเบียนคุมงบประมาณและการเบิกจ่ายเงินอุดหนุนรายหัวฯ',
    details: 'อัปเดตข้อมูลการเบิกจ่ายสิ้นงวดเดือนสิงหาคม (v2)'
  },
  {
    id: 'log-06',
    timestamp: '2026-09-18T14:20:00.000Z',
    userId: 'u-teacher-somchai',
    userName: 'ครูสมชาย มีสุข',
    userRole: 'staff',
    action: 'delete',
    targetType: 'file',
    targetName: 'ร่างคำสั่งจัดอบรมเชิงปฏิบัติการ AI เพื่อการเรียนรู้ (ยกเลิก)',
    details: 'ย้ายลงถังขยะ (ระบบจะล้างอัตโนมัติใน 30 วัน)'
  }
];

export const INITIAL_SNAPSHOTS: BackupSnapshot[] = [
  {
    id: 'snap-20260930-0300',
    timestamp: '2026-09-30T03:00:00.000Z',
    name: 'สำรองข้อมูลประจำวันอัตโนมัติ (Nightly Snapshot)',
    type: 'auto',
    fileCount: 8,
    folderCount: 9,
    totalSizeBytes: 25420000,
    status: 'completed',
    createdByUserId: 'system',
    createdByName: 'ระบบอัตโนมัติ (Scheduler)',
    integrityHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    notes: 'สำรองฐานข้อมูล โครงสร้างโฟลเดอร์ และไฟล์ทุกเวอร์ชันสมบูรณ์'
  },
  {
    id: 'snap-20260929-0300',
    timestamp: '2026-09-29T03:00:00.000Z',
    name: 'สำรองข้อมูลประจำวันอัตโนมัติ (Nightly Snapshot)',
    type: 'auto',
    fileCount: 7,
    folderCount: 9,
    totalSizeBytes: 21580000,
    status: 'completed',
    createdByUserId: 'system',
    createdByName: 'ระบบอัตโนมัติ (Scheduler)',
    integrityHash: 'SHA256:8b52f67a21f153920dc148a1d65dfc2d4b1fa3d677284addd200126d9069',
    notes: 'สำรองประจำวันปกติ'
  },
  {
    id: 'snap-20260925-1400',
    timestamp: '2026-09-25T14:00:00.000Z',
    name: 'สำรองก่อนปรับปรุงระบบจัดเก็บเอกสาร (Manual Backup)',
    type: 'manual',
    fileCount: 7,
    folderCount: 9,
    totalSizeBytes: 21500000,
    status: 'completed',
    createdByUserId: 'u-admin',
    createdByName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    integrityHash: 'SHA256:2c62e327f0e06b3a0ec795794d2ce7dcf2b9272f92348f71c41312f777cf4538',
    notes: 'สำรองด้วยตนเองโดยผู้ดูแลระบบ'
  }
];

export const INITIAL_RESTORE_LOGS: RestoreLog[] = [
  {
    id: 'rst-01',
    timestamp: '2026-09-25T14:15:00.000Z',
    snapshotId: 'snap-20260925-1400',
    snapshotName: 'สำรองก่อนปรับปรุงระบบจัดเก็บเอกสาร (Manual Backup)',
    restoredByUserId: 'u-admin',
    restoredByName: 'ดร.สมเกียรติ พงษ์ไพบูลย์',
    type: 'test_dry_run',
    status: 'success',
    details: 'ทดลองกู้คืน (Dry Run): ตรวจสอบความสมบูรณ์ของฐานข้อมูลและไฟล์ 7 รายการ ผ่าน 100% ไม่พบข้อผิดพลาด'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    userId: 'u-teacher-somchai',
    title: 'มีเอกสารใหม่ถูกแชร์ให้คุณ',
    message: 'ครูวิภาดา กิตติคุณ ได้แชร์ "รายงานสรุปผลสัมฤทธิ์ทางการเรียนฯ ภาคเรียนที่ 1-2569" ให้คุณในสิทธิ์ผู้แก้ไข',
    timestamp: '2026-09-29T16:45:00.000Z',
    read: false,
    linkTarget: {
      type: 'file',
      id: 'doc-report-assessment'
    },
    type: 'share'
  },
  {
    id: 'notif-2',
    userId: 'u-teacher-somchai',
    title: 'อัปเดตคำสั่งโรงเรียน',
    message: 'ดร.สมเกียรติ พงษ์ไพบูลย์ เผยแพร่ "คำสั่งแต่งตั้งคณะกรรมการสัปดาห์วิทยาศาสตร์ฯ"',
    timestamp: '2026-08-01T08:35:00.000Z',
    read: true,
    linkTarget: {
      type: 'file',
      id: 'doc-adm-order-01'
    },
    type: 'system'
  },
  {
    id: 'notif-3',
    userId: 'u-admin',
    title: 'การสำรองข้อมูลอัตโนมัติสำเร็จ',
    message: 'สำรองข้อมูลประจำคืนวันที่ 30 ก.ย. 2569 เวลา 03:00 น. เรียบร้อยแล้ว (สมบูรณ์ 100%)',
    timestamp: '2026-09-30T03:00:15.000Z',
    read: false,
    type: 'backup'
  }
];
