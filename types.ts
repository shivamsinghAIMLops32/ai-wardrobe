export interface UploadedImage {
  file: File;
  base64: string;
  preview: string;
}

export interface GeneratedImage {
  id: string;
  src: string;
  title: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export type BackgroundSource = 'auto' | 'user' | 'clothing';
