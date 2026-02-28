export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';

export type StorageMetadata = {
  url: string;
  publicId: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
};

export interface IStorageProvider {
  uploadImage(buffer: Buffer, folder: string, publicId?: string): Promise<StorageMetadata>;
  
  deleteImage(publicId: string): Promise<boolean>;
}