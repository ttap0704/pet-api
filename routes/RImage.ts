import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';
import ImagesService from '../services/SImages';

const fs = require('fs');
const path = require('path');
const formidableMiddleware = require('express-formidable');

class Image {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: [];
  public ImagesService: ImagesService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = [];
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

        const images = await Model.Images.findAll({
          where: {
            [`${type}_id`]: id,
          },
          attributes: ['file_name'],
          raw: true,
        });

        if (images.length > 0) {
          for (let i = 0, leng = images.length; i < leng; i++) {
            const path = __dirname + '/../uploads/' + type + '/' + images[i].file_name;
            fs.unlink(path, (err: Error) => {
              if (err) {
                res.status(500).send();
                return;
              }
            });

            if (i == leng - 1) {
              const code = await Model.Images.destroy({
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
      const file_path = __dirname + '/../uploads/' + req.params.dir + '/' + req.params.file_name;
      const resolved_path = path.resolve(file_path);

      res.status(200).sendFile(resolved_path);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new Image().express;
