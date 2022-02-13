import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';

import { RESTAURANT } from '../constant';
import { Category } from '../interfaces/IRestaurant';

class ExposureMenu {
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

      const count = await Model.ExposureMenu.count({
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

      const list = await Model.ExposureMenu.findAll({
        where: {
          restaurant_id: {
            [Model.Sequelize.Op.in]: Model.sequelize.literal(`(${tempSQL})`),
          },
        },
        include: [
          {
            model: Model.Images,
            as: 'exposure_menu_image',
            require: true,
          },
        ],
        attributes: [
          'id',
          'label',
          'price',
          'restaurant_id',
          'comment',
          [
            Model.sequelize.literal(`(
            SELECT label
            FROM restaurant
            WHERE
            id = ExposureMenu.restaurant_id
          )`),
            'restaurant_label',
          ],
        ],
        offset: offset,
        limit: 5,
      });
      res.json({ count: count, rows: list });
    });

    // this.express.get("/:id", async (req: express.Request, res: express.Response, next) => {
    //   const id = req.params.id;

    //   const accommodation = await Model.Accommodation.findOne({
    //     include: [
    //       {
    //         model: Model.Rooms,
    //         as: 'accommodation_rooms',
    //         require: true,
    //         include: [
    //           {
    //             model: Model.Images,
    //             as: 'rooms_images',
    //             require: true,
    //           }
    //         ]
    //       },
    //       {
    //         model: Model.Images,
    //         as: 'accommodation_images',
    //         require: true
    //       }
    //     ],
    //     where: { id: id }
    //   })

    //   res.json(accommodation)
    // })

    this.express.delete('/:id', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const id = req.params.id;

      const code1 = await Model.ExposureMenu.destroy({
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

      const code = await Model.ExposureMenu.update(
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
  }
}

export default new ExposureMenu().express;
