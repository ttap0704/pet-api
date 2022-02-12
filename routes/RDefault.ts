import * as express from "express";
import { Model as ModelType, Sequelize } from "sequelize/types";
import { Logger } from "../logger/logger";
import Model from '../models'

class Default {

  public express: express.Application;
  public logger: Logger;
  public model: ModelType

  // array to hold users
  public data: object;

  constructor() {
    this.express = express();
    this.model = Model;
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

export default Default;

