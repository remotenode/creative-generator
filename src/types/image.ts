export interface ImageData {
  url: string;
  prompt: string;
  size: string;
  provider: string;
}

export interface ImageResponse {
  success: boolean;
  images: ImageData[];
}
