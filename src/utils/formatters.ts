import { DocumentFile, UserRole } from '../types';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatThaiDate(dateString: string | undefined | null, includeTime: boolean = true): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const thaiYear = date.getFullYear() + 543;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (includeTime) {
      return `${day} ${month} ${thaiYear} ${hours}:${minutes} น.`;
    }
    return `${day} ${month} ${thaiYear}`;
  } catch {
    return dateString;
  }
}

export function getDaysRemainingInTrash(deletedAt: string | undefined | null, retentionDays: number = 30): number {
  if (!deletedAt) return retentionDays;
  const deleted = new Date(deletedAt).getTime();
  const now = new Date().getTime();
  const diffDays = Math.floor((now - deleted) / (1000 * 60 * 60 * 24));
  const remaining = retentionDays - diffDays;
  return Math.max(0, remaining);
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'ผู้ดูแลระบบ (Admin)';
    case 'head':
      return 'หัวหน้างาน (Head)';
    case 'staff':
      return 'บุคลากร (Staff)';
    case 'viewer':
      return 'ผู้อ่าน (Viewer)';
    default:
      return role;
  }
}

export function getDepartmentLabel(dept: string): string {
  switch (dept) {
    case 'admin':
      return 'ฝ่ายบริหารงานทั่วไป';
    case 'academic':
      return 'ฝ่ายวิชาการ';
    case 'personnel':
      return 'ฝ่ายบริหารงานบุคคล';
    case 'finance':
      return 'ฝ่ายการเงินและพัสดุ';
    case 'others':
      return 'กลุ่มงานอื่นๆ';
    default:
      return dept;
  }
}

export function getFileCategoryIconInfo(extension: string) {
  const ext = extension.toLowerCase().replace('.', '');
  switch (ext) {
    case 'pdf':
      return { color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', label: 'PDF' };
    case 'doc':
    case 'docx':
      return { color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'DOC' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'SHEET' };
    case 'ppt':
    case 'pptx':
      return { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'SLIDE' };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return { color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', label: 'IMAGE' };
    case 'zip':
    case 'rar':
    case '7z':
      return { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'ZIP' };
    default:
      return { color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', label: ext.toUpperCase() || 'FILE' };
  }
}

export function exportDocumentsToCSV(files: DocumentFile[], categoryMap: Record<string, string>): void {
  const headers = [
    'ลำดับ',
    'ชื่อเอกสาร',
    'หมวดหมู่',
    'ประเภทไฟล์',
    'ขนาด',
    'เวอร์ชันปัจจุบัน',
    'ผู้จัดทำ',
    'วันที่สร้าง',
    'แก้ไขล่าสุด',
    'สถานะไดรฟ์',
    'การเข้าชม',
    'ดาวน์โหลด',
    'แท็ก'
  ];

  const rows = files.map((file, index) => [
    index + 1,
    `"${(file.name || '').replace(/"/g, '""')}"`,
    `"${(categoryMap[file.categoryId] || file.categoryId || '').replace(/"/g, '""')}"`,
    file.extension.toUpperCase(),
    formatBytes(file.sizeBytes),
    `v${file.currentVersion}`,
    `"${(file.createdByUserName || '').replace(/"/g, '""')}"`,
    `"${formatThaiDate(file.createdAt)}"`,
    `"${formatThaiDate(file.updatedAt)}"`,
    file.driveSyncStatus === 'synced' ? 'ซิงค์เรียบร้อย' : 'ยกเลิกสิทธิ์แล้ว',
    file.previewCount || 0,
    file.downloadCount || 0,
    `"${(file.tags || []).join(', ')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `รายการเอกสาร_SchoolDrive_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
