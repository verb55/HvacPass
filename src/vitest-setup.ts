/// <reference types="vitest" />
import "@testing-library/jest-dom";

declare module "browser-image-compression" {
  interface Options {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    fileType?: string;
    initialQuality?: number;
  }

  function imageCompression(file: File, options: Options): Promise<File>;

  export default imageCompression;
}
