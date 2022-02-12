import * as express from "express";
import { Logger } from "../logger/logger";
import Model from '../models'

class Rooms {

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
  private middleware(): void {
  }

  private routes(): void {
    
  }
}

export default new Rooms().express;

