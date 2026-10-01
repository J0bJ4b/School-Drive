import { getGoogleAccessToken } from './googleDriveAuth';
import { DocumentFile, Folder, SharePermission } from '../types';

export interface DriveApiFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  createdTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  parents?: string[];
  shared?: boolean;
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
  starred?: boolean;
  trashed?: boolean;
  permissions?: { id: string; role: string; type: string; emailAddress?: string; displayName?: string }[];
}

export interface DriveStorageQuota {
  limit: string;
  usage: string;
  usageInDrive: string;
  usageInDriveTrash: string;
  user?: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
}

/**
 * Fetch files and folders from user's real Google Drive
 */
export async function listDriveFiles(
  folderId?: string | null,
  includeTrashed: boolean = false
): Promise<DriveApiFile[]> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive ก่อนใช้งาน');

  let query = `trashed = ${includeTrashed}`;
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }

  const fields = 'files(id, name, mimeType, size, modifiedTime, createdTime, webViewLink, webContentLink, iconLink, parents, shared, owners, starred, trashed, permissions)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&pageSize=100&orderBy=folder,modifiedTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Drive (${response.status})`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Fetch Drive user profile & storage quota
 */
export async function getDriveStorageInfo(): Promise<DriveStorageQuota> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const url = 'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user';
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error('ไม่สามารถดึงข้อมูลพื้นที่ Google Drive ได้');
  }

  const data = await response.json();
  return {
    ...data.storageQuota,
    user: data.user
  };
}

/**
 * Create a new folder in Google Drive
 */
export async function createRealDriveFolder(
  folderName: string,
  parentFolderId?: string | null
): Promise<DriveApiFile> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const metadata: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(metadata)
  });

  if (!response.ok) {
    throw new Error('ไม่สามารถสร้างโฟลเดอร์ใน Google Drive ได้');
  }

  return response.json();
}

/**
 * Upload a real file to Google Drive using multipart upload
 */
export async function uploadRealFileToDrive(
  file: File,
  parentFolderId?: string | null,
  description?: string
): Promise<DriveApiFile> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    description: description || 'อัปโหลดผ่านระบบ School Drive'
  };

  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

  // Construct multipart request
  const metadataContentType = 'application/json; charset=UTF-8';
  const fileContentType = file.type || 'application/octet-stream';

  const metadataBlob = new Blob([
    delimiter,
    `Content-Type: ${metadataContentType}\r\n\r\n`,
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${fileContentType}\r\n`,
    `Content-Transfer-Encoding: binary\r\n\r\n`
  ]);

  const endBlob = new Blob([closeDelimiter]);
  const multipartBody = new Blob([metadataBlob, fileData, endBlob], {
    type: `multipart/related; boundary=${boundary}`
  });

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,parents,owners',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: multipartBody
    }
  );

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson?.error?.message || 'ไม่สามารถอัปโหลดไฟล์ไปยัง Google Drive ได้');
  }

  return response.json();
}

/**
 * Delete a file or folder from Google Drive
 * Requires explicit user confirmation per workspace skill!
 */
export async function deleteRealDriveFile(fileId: string, fileName?: string): Promise<boolean> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('ไม่สามารถลบไฟล์จาก Google Drive ได้');
  }

  return true;
}

/**
 * Move file to Drive trash
 */
export async function trashRealDriveFile(fileId: string): Promise<boolean> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trashed: true })
  });

  return response.ok;
}

/**
 * Restore file from Drive trash
 */
export async function restoreRealDriveFile(fileId: string): Promise<boolean> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ trashed: false })
  });

  return response.ok;
}

/**
 * Share file via Google Drive API
 * role: 'reader' | 'commenter' | 'writer'
 * type: 'user' | 'group' | 'domain' | 'anyone'
 */
export async function shareRealDriveFile(
  fileId: string,
  role: 'reader' | 'writer',
  type: 'user' | 'anyone',
  emailAddress?: string
): Promise<any> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Google Drive');

  const body: any = {
    role,
    type
  };

  if (type === 'user' && emailAddress) {
    body.emailAddress = emailAddress;
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions?sendNotificationEmail=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'ไม่สามารถแชร์ไฟล์ใน Google Drive ได้');
  }

  return response.json();
}
