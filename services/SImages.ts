import { Sequelize } from 'sequelize/types';
import { ImagesBulkAttributes } from '../interfaces/IImages';
import { sequelize } from '../models';

class ImagesService {
  public Models: Sequelize['models'];

  constructor() {
    this.Models = sequelize.models
  }

  async bulkCreate(payload: any) {
    const images = await this.Models.Images.bulkCreate(payload, {});

    return images;
  }

  async sendImage() { }
}

export default ImagesService;
