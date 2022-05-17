import * as express from 'express';
import { Logger } from '../logger/logger';

import Model from '../models';
import UploadService from '../services/SUpload';

const path = require('path');
const fs = require('fs');
const formidableMiddleware = require('express-formidable');

class Upload {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: [];
  public UploadService: UploadService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = [];
    this.logger = new Logger();
    this.UploadService = new UploadService();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(formidableMiddleware());
  }

  private routes(): void {
    this.express.post('/image', this.uploadImages);
  }

  private uploadImages = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      this.logger.info('url:::::::' + req.url);
      const length = Number(req.fields.length);
      const category = Number(req.fields.category);
      const data = { length, category, files: req.files };
      const uploaded_images = await this.UploadService.uploadImages(data);

      res.status(200).send(uploaded_images);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new Upload().express;
