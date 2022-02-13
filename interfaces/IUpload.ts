export interface UploadImagesAttributes {
  length: number;
  category: number;
  files: { [key: string]: File } | any;
}
