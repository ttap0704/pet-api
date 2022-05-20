import * as express from 'express';
import { Logger } from '../logger/logger';
import ImagesService from '../services/SImages';
import { sequelize, Sequelize } from '../models'

const fs = require('fs');
const path = require('path');
const formidableMiddleware = require('express-formidable');

class Image {
  public express: express.Application;
  public logger: Logger;
  public Models: Sequelize['models']

  // array to hold users
  public data: [];
  public ImagesService: ImagesService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = [];
    this.Models = sequelize.models;
    this.logger = new Logger();
    this.ImagesService = new ImagesService();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(formidableMiddleware());
  }

  private routes(): void {
    this.express.get('/:dir/:file_name', this.getImage);

    this.express.delete(
      '/:type/:id',
      async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const type = req.params.type;
        const id = req.params.id;

        const images = await this.Models.Images.findAll({
          where: {
            [`${type}_id`]: id,
          },
          attributes: ['file_name'],
          raw: true,
        });

        if (images.length > 0) {
          const parent_dir = Math.floor(Number(id) / 50) * 50
          for (let i = 0, leng = images.length; i < leng; i++) {
            const path = __dirname + '/../uploads/' + type + '/' + parent_dir + '/' + images[i].getDataValue('file_name');
            fs.unlink(path, (err: Error) => {
              if (err) {
                res.status(500).send();
                return;
              }
            });

            if (i == leng - 1) {
              const code = await this.Models.Images.destroy({
                where: {
                  [`${type}_id`]: id,
                },
              });
              if (code >= 0) {
                res.status(200).send();
              } else {
                res.status(500).send();
              }
            }
          }
        } else {
          res.status(204).send();
        }
      },
    );
  }

  getImage = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const dir = req.params.dir;
      const file_name = req.params.file_name;
      const parent_dir = Math.floor(Number(file_name.split('.')[0].split('_')[0]) / 50) * 50
      const file_path = __dirname + '/../uploads/' + dir + '/' + parent_dir + '/' + file_name;
      const resolved_path = path.resolve(file_path);

      res.status(200).sendFile(resolved_path);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new Image().express;
