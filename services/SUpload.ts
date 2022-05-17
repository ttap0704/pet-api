import Model from '../models';
import { UploadImagesAttributes } from '../interfaces/IUpload';
import { RESTAURANT, ACCOMMODATION, UPLOAD_PATH, IMAGES_ID_LIST } from '../constant';
import ImagesService from './SImages';
const sharp = require("sharp");
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
      const fs_promise = new Promise(async (resolve, reject) => {
        for (const [key, val] of Object.entries(files)) {
          const cur_file: File = files[key];
          const file: File = await self.resizeImage(cur_file);
          const file_name = cur_file.name;
          const target_text = IMAGES_ID_LIST[category];
          const file_name_split = file_name.split('.');
          const seq = Number(file_name_split[0].split('_')[file_name_split[0].split('_').length - 2]);
          let target_idx = undefined;
          if ([RESTAURANT, ACCOMMODATION].includes(category) == true) {
            target_idx = 0;
          } else {
            target_idx = 1;
          }

          const parent_id = file_name_split[0].split('_')[0];
          const parent_path = Math.floor(Number(parent_id) / 50) * 50
          const target = Number(file_name.split('.')[0].split('_')[target_idx]);
          const parent_dir = __dirname + '/../uploads' + dir + `${parent_path}`;
          const success_make_dir = await self.makeDirectory(parent_dir)
          console.log(success_make_dir)
          const file_path = path.resolve(__dirname + '/../uploads' + dir + `${parent_path}/` + file_name);

          fs.writeFile(file_path, file, async function (error: any) {
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
        }
      });

      return await fs_promise;
    } catch (err) {
      throw new Error(err);
    }
  }

  public async resizeImage(file: File) {
    try {
      const image = sharp(file.path);
      const meta_image = await image.metadata()
      const ratio =
        Math.round(Number(meta_image.width)) /
        Math.round(Number(meta_image.height));
      const default_width = 1280;
      const default_height = 960;

      let final_width = 0;
      let final_height = 0;

      if (default_width / default_height > ratio) {
        final_width = Math.round(default_height * ratio);
        final_height = default_height;
      } else {
        final_width = default_width;
        final_height = Math.round(default_width / ratio);
      }


      const final_image = await image
        .resize(final_width, final_height)
        .toBuffer();


      return final_image;
    } catch (err) {
      throw new Error(err)
    }
  }

  public async makeDirectory(path: string) {
    try {
      console.log(path)
      const is_exists = fs.existsSync(path);
      if (!is_exists) {
        fs.mkdir(path, (err: string) => {
          if (err) {
            throw new Error(err)
          } else {
            return true
          }
        });
      } else {
        return true
      }
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default UploadService;
