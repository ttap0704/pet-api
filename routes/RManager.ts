import * as express from 'express';
import { Logger } from '../logger/logger';

import RestaurantService from '../services/SRestaurant';
import AccommodationService from '../services/SAccommodation';
import JwtService from '../services/SJwt';

class Manager {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: object;
  public RestaurantService: RestaurantService;
  public AccommodationService: AccommodationService;
  public JwtService: JwtService;

  constructor() {
    this.express = express();

    this.RestaurantService = new RestaurantService();
    this.AccommodationService = new AccommodationService();
    this.JwtService = new JwtService();

    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
    // this.express.use(this.JwtService.verifyToken);
  }

  private routes(): void {
    // 숙박업소
    this.express.post('/:manager/accommodation', this.addManagerAccommodation);
    this.express.get('/:manager/accommodation', this.getManagerAccommodation);
    this.express.post('/:manager/accommodation/:id/rooms', this.addManagerAccommodationRooms);
    this.express.get('/:manager/accommodation/rooms', this.getManagerAccommodationRooms);
    this.express.patch('/:manager/accommodation/:id', this.patchManagerAccommodation);
    this.express.delete('/:manager/accommodation/:id', this.deleteManagerAccommodation);
    this.express.patch('/:manager/accommodation/:id/rooms/:rooms_id', this.patchManagerAccommodationRoom);
    this.express.delete('/:manager/accommodation/:id/rooms/:rooms_id', this.deleteManagerAccommodationRoom);
    this.express.post('/:manager/accommodation/:id/rooms/order', this.editManagerAccommodationRoomOrder);

    // 음식점
    this.express.post('/:manager/restaurant', this.addManagerRestaurant);
    this.express.get('/:manager/restaurant', this.getManagerRestaurant);
    this.express.get('/:manager/restaurant/:menu', this.getManagerRestaurantMenu);
    this.express.get('/:manager/restaurant/:id/category', this.getManagerRestaurantCategory);
    this.express.post('/:manager/restaurant/:id/category', this.addManagerRestaurantCategory);
    this.express.patch('/:manager/restaurant/:id/category/:category_id', this.patchManagerRestaurantCategory);
    this.express.delete('/:manager/restaurant/:id/category/:category_id', this.deleteManagerRestaurantCategory);
    this.express.post('/:manager/restaurant/:id/category/:category_id/menu', this.addManagerRestaurantCategoryMenu);
    this.express.delete(
      '/:manager/restaurant/:id/category/:category_id/menu',
      this.deleteManagerRestaurantCategoryMenu,
    );
    this.express.post('/:manager/restaurant/:id/:menu', this.addManagerRestaurantMenu);
    this.express.patch('/:manager/restaurant/:id', this.patchManagerRestaurant);
    this.express.delete('/:manager/restaurant/:id', this.deleteManagerRestaurant);
    this.express.patch('/:manager/restaurant/:id/:menu/:menu_id', this.patchManagerRestaurantMenu);
    this.express.delete('/:manager/restaurant/:id/:menu/:menu_id', this.deleteManagerRestaurantMenu);
  }

  addManagerAccommodation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const f_res = await this.AccommodationService.addManagerAccommodationList({ manager, data: req.body });

      res.status(200).send(f_res);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  getManagerAccommodation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const page = Number(req.query.page);

      const list = await this.AccommodationService.getManagerAccommodationList({ manager, page });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  addManagerAccommodationRooms = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);
      const data = req.body;
      const f_res = await this.AccommodationService.addManagerAccommodationRoomList({ accommodation_id, data });

      res.status(200).send(f_res);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  getManagerAccommodationRooms = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const page = Number(req.query.page);

      const list = await this.AccommodationService.getManagerAccommodationRoomList({ manager, page });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  patchManagerAccommodation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);
      const target = req.body.target;
      const value = req.body.value;

      const response = await this.AccommodationService.editManagerAccommodation({ accommodation_id, target, value });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerAccommodation = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);

      const response = await this.AccommodationService.deleteManagerAccommodationList({ accommodation_id });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  patchManagerAccommodationRoom = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);
      const rooms_id = Number(req.params.rooms_id);
      const target = req.body.target;
      const value = req.body.value;

      const response = await this.AccommodationService.editManagerAccommodationRoom({
        accommodation_id,
        rooms_id,
        target,
        value,
      });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerAccommodationRoom = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);
      const rooms_id = Number(req.params.rooms_id);

      const response = await this.AccommodationService.deleteManagerAccommodationRoomList({
        accommodation_id,
        rooms_id,
      });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  editManagerAccommodationRoomOrder = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const manager = Number(req.params.manager);
      const accommodation_id = Number(req.params.id);
      const data = req.body;
      const f_res = await this.AccommodationService.editManagerAccommodationRoomListOrder({ manager, accommodation_id, data });

      res.status(200).send(f_res);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  addManagerRestaurant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const f_res = await this.RestaurantService.addManagerRestaurantList({ manager, data: req.body });

      res.status(200).send(f_res);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  getManagerRestaurant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const page = Number(req.query.page);

      const list = await this.RestaurantService.getManagerRestaurantList({ manager, page });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  getManagerRestaurantMenu = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const manager = Number(req.params.manager);
      const menu = req.params.menu;
      const page = Number(req.query.page);

      const list = await this.RestaurantService.getManagerRestaurantMenuList({ manager, page, menu });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  getManagerRestaurantCategory = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);

      const list = await this.RestaurantService.getManagerRestaurantCategoryList({ restaurant_id });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  addManagerRestaurantCategory = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);
      const category = req.body.category;

      const list = await this.RestaurantService.addManagerRestaurantCategoryList({ restaurant_id, category });

      res.status(200).send(list);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  patchManagerRestaurantCategory = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const category_id = Number(req.params.category_id);
      const target = req.body.target;
      const value = req.body.value;

      const response = await this.RestaurantService.editManagerRestaurantCategoryList({ category_id, target, value });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerRestaurantCategory = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const category_id = Number(req.params.category_id);

      const response = await this.RestaurantService.deleteManagerRestauranCateogrytList({ category_id });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  addManagerRestaurantCategoryMenu = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const category_id = Number(req.params.category_id);
      const menu = req.body.menu;

      const res_menu = await this.RestaurantService.addManagerRestaurantCategoryMenuList({ category_id, menu });

      res.status(200).send(res_menu);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerRestaurantCategoryMenu = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const category_id = Number(req.params.category_id);

      const response = await this.RestaurantService.deleteManagerRestaurantCategoryMenuList({ category_id });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  addManagerRestaurantMenu = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);
      const menu = req.params.menu;

      const res_menu = await this.RestaurantService.addManagerRestaurantMenuList({
        restaurant_id,
        menu,
        data: req.body,
      });

      res.status(200).send(res_menu);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  patchManagerRestaurant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);
      const target = req.body.target;
      const value = req.body.value;

      const response = await this.RestaurantService.editManagerRestaurant({ restaurant_id, target, value });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerRestaurant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);

      const response = await this.RestaurantService.deleteManagerRestaurantList({ restaurant_id });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  patchManagerRestaurantMenu = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);
      const menu = req.params.menu;
      const menu_id = Number(req.params.menu_id);
      const target = req.body.target;
      const value = req.body.value;

      const response = await this.RestaurantService.editManagerRestaurantMenu({
        restaurant_id,
        target,
        value,
        menu,
        menu_id,
      });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  deleteManagerRestaurantMenu = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant_id = Number(req.params.id);
      const menu = req.params.menu;
      const menu_id = Number(req.params.menu_id);

      const response = await this.RestaurantService.deleteManagerRestaurantMenuList({ restaurant_id, menu, menu_id });

      if (response) {
        res.status(200).send();
      } else {
        res.status(500).send();
      }
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new Manager().express;
