import * as express from "express";
import { Logger } from "../logger/logger";
import Model from '../models'

import { RESTAURANT } from "../constant";
import { Category } from "../interfaces/IRestaurant"
import RestaurantService from "../services/SRestaurant"

class Restraunt {

  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: object;
  public RestaurantService: RestaurantService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
    this.RestaurantService = new RestaurantService();
  }

  // Configure Express middleware.
  private middleware(): void {
  }

  private routes(): void {
    this.express.get("", this.getRestaurant);
    this.express.get("/:id", this.getRestaurantOne)
  }
  getRestaurant = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const restaurant = await this.RestaurantService.getRestaurantList()
      res.status(200).send(restaurant)
    } catch (err) {
      res.status(500).send()
      throw new Error(err);
    }
  }

  getRestaurantOne = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const id = Number(req.params.id);

      const restaurant = await this.RestaurantService.getRestaurantOne({ restaurant_id: id })

      res.status(200).send(restaurant)
    } catch (err) {
      res.status(500).send()
      throw new Error(err);
    }
  }
}

export default new Restraunt().express;