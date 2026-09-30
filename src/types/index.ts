export type UserRole = 'admin' | 'head' | 'staff' | 'viewer';

export type LoginMode = 'google' | 'credentials' | 'hybrid';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: 'admin' | 'academic' | 'personnel' | 'finance' | 'others';
  avatar?: string;
  groupIds: string[];
  mustChangePassword?: boolean;
  failedAttempts?: number;
  lockUntil?: number; // timestamp in ms
  storageUsedBytes: number;
  storageQuotaBytes: number;
  isGoogleAccount?: boolean;
  passwordHash?: string; // Simulated stored password
  position?: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberUserIds: string[];
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  code: 'admin' | 'academic' | 'personnel' | 'finance' | 'others' | string;
  iconName: string;
  description: string;
  order: number;
  folderCount?: number;
  fileCount?: number;
}

export interface SharePermission {
  id: string;
  targetType: 'user' | 'group' | 'everyone' | 'public';
  targetId?: string; // userId or groupId
  targetName: string;
  role: 'viewer' | 'editor';
  grantedAt: string;
  grantedByUserId: string;
  grantedByUserName: string;
}

export interface Folder {
  id: string;
  name: string;
  categoryId: string;
  parentFolderId?: string | null;
  depth: number; // 1 to 10
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByUserName: string;
  isShared?: boolean;
  sharedWith: SharePermission[];
  isTrash?: boolean;
  deletedAt?: string | null;
}

export interface DocumentVersion {
  versionNumber: number;
  uploadedAt: string;
  uploadedByUserId: string;
  uploadedByUserName: string;
  sizeBytes: number;
  fileUrl: string;
  changeNote?: string;
  checksum?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  categoryId: string;
  folderId?: string | null;
  sizeBytes: number;
  currentVersion: number;
  versions: DocumentVersion[];
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByUserName: string;
  isStarred?: boolean;
  isTemplate?: boolean;
  isTrash?: boolean;
  deletedAt?: string | null;
  tags: string[];
  sharedWith: SharePermission[];
  isPublicLinkEnabled?: boolean;
  publicLinkId?: string;
  driveSyncStatus: 'synced' | 'revoked' | 'pending';
  driveFileId: string;
  downloadCount: number;
  previewCount: number;
  description?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'open' | 'edit' | 'share' | 'delete' | 'restore' | 'download' | 'upload' | 'create_folder' | 'admin_repair' | 'login' | 'failed_login' | 'reset_password' | 'template_use' | 'cleanup';
  targetType: 'file' | 'folder' | 'user' | 'system';
  targetName: string;
  details?: string;
  ip?: string;
}

export interface BackupSnapshot {
  id: string;
  timestamp: string;
  name: string;
  type: 'auto' | 'manual' | 'pre_repair';
  fileCount: number;
  folderCount: number;
  totalSizeBytes: number;
  status: 'completed' | 'testing' | 'restored';
  createdByUserId: string;
  createdByName: string;
  integrityHash: string;
  notes?: string;
  dataPayload?: string; // serialized snapshot
}

export interface RestoreLog {
  id: string;
  timestamp: string;
  snapshotId: string;
  snapshotName: string;
  restoredByUserId: string;
  restoredByName: string;
  type: 'test_dry_run' | 'actual_restore';
  status: 'success' | 'failed';
  details: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTarget?: {
    type: 'file' | 'folder';
    id: string;
  };
  type: 'share' | 'system' | 'backup';
}

export interface SystemSettings {
  schoolName: string;
  systemName: string;
  logoUrl?: string;
  loginMode: LoginMode;
  maxFileSizeMB: number; // 100 to 500
  disallowedExtensions: string[];
  isPublicLinkGlobalEnabled: boolean;
  autoBackupTime: string; // e.g. "03:00"
  isMaintenanceMode: boolean;
  lastAutoBackupTimestamp: string;
  autoBackupStatus: 'success' | 'warning' | 'error';
  userDefaultQuotaMB: number;
  totalSystemStorageGB: number;
}
