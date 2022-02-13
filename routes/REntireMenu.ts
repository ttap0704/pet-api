import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';

import { RESTAURANT } from '../constant';
import { Category } from '../interfaces/IRestaurant';

class EntireMenu {
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
  private middleware(): void { }

  private routes(): void {
    this.express.post('', addEntireMenu);

    this.express.get('', async (req: express.Request, res: express.Response, next) => {
      const uid = Number(req.query.uid);
      const page = Number(req.query.page);

      const tempSQL = Model.sequelize.dialect.queryGenerator
        .selectQuery('restaurant', {
          attributes: ['id'],
          where: {
            manager: uid,
          },
        })
        .slice(0, -1);

      const count = await Model.EntireMenu.count({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
      });

      let offset = 0;
      if (page > 1) {
        offset = 5 * (page - 1);
      }

      const attributes = [
        'id',
        'label',
        'price',
        'restaurant_id',
        'category_id',
        [
          Model.sequelize.literal(`(
          SELECT category
          FROM entire_menu_category
          WHERE
          id = EntireMenu.category_id
        )`),
          'category',
        ],
        [
          Model.sequelize.literal(`(
          SELECT label
          FROM restaurant
          WHERE
          id = EntireMenu.restaurant_id
        )`),
          'restaurant_label',
        ],
      ];

      const list = await Model.EntireMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
        attributes: attributes,
        offset: offset,
        limit: 5,
      });
      res.json({ count: count, rows: list });
    });

    this.express.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const id = req.params.id;

      const code1 = await Model.EntireMenu.destroy({
        where: {
          id: id,
        },
      });

      if (code1 >= 0) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    });

    this.express.patch('/:id', async (req: express.Request, res: express.Response, next) => {
      const id = req.params.id;
      const target = req.body.target;
      const value = req.body.value;

      const code = await Model.EntireMenu.update(
        { [target]: value },
        {
          where: {
            id: id,
          },
        },
      );
      if (code >= 0) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    });

    async function addEntireMenu(req: express.Request, res: express.Response, next: express.NextFunction) {
      const params = req.body.params;

      const entire_menu = await Model.EntireMenu.bulkCreate(params);

      res.status(200).send(entire_menu);
    }
  }
}

export default new EntireMenu().express;
