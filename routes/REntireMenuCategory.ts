import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';

class EntireMenuCategory {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: object;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {}

  private routes(): void {
    this.express.post('', addCategory);

    async function addCategory(req: express.Request, res: express.Response, next: express.NextFunction) {
      const req_category = req.body.category;

      const category = await Model.EntireMenuCategory.findOrCreate({
        where: {
          category: req_category,
        },
      });

      return res.status(200).send(category);
    }
  }
}

export default new EntireMenuCategory().express;
