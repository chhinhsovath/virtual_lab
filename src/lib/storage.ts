// File storage utility for VirtualLab LMS
// This implementation supports both local storage and S3-compatible storage

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface FileUploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export interface StorageConfig {
  type: 'local' | 's3';
  localPath?: string;
  s3Config?: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
}

// Default configuration - can be overridden by environment variables
const defaultConfig: StorageConfig = {
  type: process.env.STORAGE_TYPE as 'local' | 's3' || 'local',
  localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
  s3Config: process.env.STORAGE_ENDPOINT ? {
    endpoint: process.env.STORAGE_ENDPOINT!,
    accessKey: process.env.STORAGE_ACCESS_KEY!,
    secretKey: process.env.STORAGE_SECRET_KEY!,
    bucket: process.env.STORAGE_BUCKET!,
    region: process.env.STORAGE_REGION || 'us-east-1'
  } : undefined
};

export class FileStorage {
  private config: StorageConfig;

  constructor(config?: Partial<StorageConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Generate a unique filename with extension
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  /**
   * Validate file type and size
   */
  private validateFile(file: File, options?: {
    maxSize?: number;
    allowedTypes?: string[];
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 50 * 1024 * 1024; // 50MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/html',
      'video/mp4',
      'audio/mpeg',
      'application/zip'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(
    file: File,
    subPath: string = ''
  ): Promise<FileUploadResult> {
    try {
      const filename = this.generateFilename(file.name);
      const uploadDir = path.join(this.config.localPath!, subPath);
      const filePath = path.join(uploadDir, filename);

      // Ensure directory exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Write file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(filePath, buffer);

      // Return relative URL for serving
      const url = `/uploads/${subPath}/${filename}`.replace(/\/+/g, '/');

      return {
        success: true,
        url,
        filename,
        size: file.size
      };
    } catch (error) {
      console.error('Local upload error:', error);
      return {
        success: false,
        error: 'Failed to upload file to local storage'
      };
    }
  }

  /**
   * Upload file to S3-compatible storage
   */
  private async uploadToS3(
    file: File,
    subPath: string = ''
  ): Promise<FileUploadResult> {
    try {
      // This would require AWS SDK or similar S3-compatible SDK
      // For now, return a placeholder implementation
      
      const filename = this.generateFilename(file.name);
      const key = `${subPath}/${filename}`.replace(/^\/+/, '');
      
      // TODO: Implement actual S3 upload using AWS SDK
      // const s3Client = new S3Client(this.config.s3Config);
      // const result = await s3Client.upload({
      //   Bucket: this.config.s3Config!.bucket,
      //   Key: key,
      //   Body: await file.arrayBuffer(),
      //   ContentType: file.type
      // });

      return {
        success: false,
        error: 'S3 upload not implemented yet. Please use local storage.'
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: 'Failed to upload file to S3 storage'
      };
    }
  }

  /**
   * Upload a file with validation
   */
  async uploadFile(
    file: File,
    options?: {
      subPath?: string;
      maxSize?: number;
      allowedTypes?: string[];
    }
  ): Promise<FileUploadResult> {
    // Validate file
    const validation = this.validateFile(file, {
      maxSize: options?.maxSize,
      allowedTypes: options?.allowedTypes
    });

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      };
    }

    const subPath = options?.subPath || '';

    // Upload based on storage type
    if (this.config.type === 's3' && this.config.s3Config) {
      return this.uploadToS3(file, subPath);
    } else {
      return this.uploadToLocal(file, subPath);
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    options?: {
      subPath?: string;
      maxSize?: number;
      allowedTypes?: string[];
    }
  ): Promise<FileUploadResult[]> {
    const results = await Promise.all(
      files.map(file => this.uploadFile(file, options))
    );
    return results;
  }

  /**
   * Get file categories for organizing uploads
   */
  static getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'documents';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'documents';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'spreadsheets';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'presentations';
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archives';
    return 'other';
  }
}

// Export singleton instance
export const fileStorage = new FileStorage();

// Helper function for API routes
export async function handleFileUpload(
  formData: FormData,
  fieldName: string = 'file',
  options?: {
    subPath?: string;
    maxSize?: number;
    allowedTypes?: string[];
  }
): Promise<FileUploadResult | FileUploadResult[]> {
  const files = formData.getAll(fieldName) as File[];
  
  if (files.length === 0) {
    return { success: false, error: 'No files provided' };
  }

  if (files.length === 1) {
    return fileStorage.uploadFile(files[0], options);
  } else {
    return fileStorage.uploadFiles(files, options);
  }
}

// MIME type validation helpers
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/html'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg'
];

export const ALLOWED_SIMULATION_TYPES = [
  'text/html',
  'application/zip'
];

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES,
  ...ALLOWED_SIMULATION_TYPES
];