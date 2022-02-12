import * as express from "express";
import { Logger } from "../logger/logger";
import AccommodationService from "../services/SAccommodation"

class Accommodation {

  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public data: object;
  public AccommodationService: AccommodationService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
    this.AccommodationService = new AccommodationService();
  }

  // Configure Express middleware.
  private middleware(): void {
  }

  private routes(): void {
    this.express.get("", this.getAccommodationList);
    this.express.get("/:id", this.getAccommodationOne)
  }

  public getAccommodationList = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const list = await this.AccommodationService.getAccommodationList();
      res.status(200).send(list)
    } catch (err) {
      res.status(500).send()
      throw new Error(err);
    }

  }

  public getAccommodationOne = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const accommodation_id = Number(req.params.id);
      const accommodation = await this.AccommodationService.getAccommodationOne({ accommodation_id })
      res.json(accommodation)
    } catch (err) {
      res.status(500).send()
      throw new Error(err);
    }
  }
}

export default new Accommodation().express;

