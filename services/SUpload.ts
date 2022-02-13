import Model from '../models';
import { UploadImagesAttributes } from '../interfaces/IUpload';
import { ImagesBulkAttributes } from '../interfaces/IImages';
import { RESTAURANT, ACCOMMODATION, UPLOAD_PATH, IMAGES_ID_LIST } from '../constant';
import ImagesService from './SImages';
import { reject, resolve } from 'bluebird';
const fs = require('fs');
const path = require('path');

class UploadService {
  public ImagesService: ImagesService;
  constructor() {
    this.ImagesService = new ImagesService();
  }

  public async uploadImages(payload: UploadImagesAttributes) {
    try {
      const self = this;
      const length = payload.length;
      const category = Number(payload.category);
      const dir = UPLOAD_PATH[category];
      const files: { [key: string]: File } | any = payload.files;
      const image_bulk: any[] = [];
      const fs_promise = new Promise((resolve, reject) => {
        for (const [key, val] of Object.entries(files)) {
          const file: File = files[key];
          const file_name = file.name;
          const target_text = IMAGES_ID_LIST[category];
          const file_name_split = file_name.split('.');
          const seq = Number(file_name_split[0].split('_')[file_name_split[0].split('_').length - 2]);
          let target_idx = undefined;
          if ([RESTAURANT, ACCOMMODATION].includes(category) == true) {
            target_idx = 0;
          } else {
            target_idx = 1;
          }
          const target = Number(file_name.split('.')[0].split('_')[target_idx]);
          const file_path = path.resolve(__dirname + '/../uploads' + dir + file_name);

          fs.readFile(file.path, (error: any, data: any) => {
            fs.writeFile(file_path, data, async function (error: any) {
              if (error) {
                console.error(error);
              } else {
                image_bulk.push({
                  file_name: file_name,
                  category: Number(category),
                  [target_text]: target,
                  seq: Number(seq),
                });

                if (image_bulk.length == length) {
                  const upload_images = await self.ImagesService.bulkCreate(image_bulk);
                  resolve(upload_images);
                }
              }
            });
          });
        }
      });

      return await fs_promise;
    } catch (err) {
      throw new Error(err);
    }
  }
}

export default UploadService;
