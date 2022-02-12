import * as express from "express";
import { Logger } from "./logger/logger";
import Routes from "./routes/_routes";

const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
};


class App {
  public express: express.Application;
  public logger: Logger;

  // array to hold users
  public users: any[];

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.users = [];
    this.logger = new Logger();
  }

  // Configure Express middleware.
  private middleware(): void {
    this.express.use(express.json({ limit: '50mb' }));
    this.express.use(express.urlencoded({
      limit: '50mb',
      extended: false
    }))
    this.express.use(express.static(path.join(__dirname, "../out/")));
    this.express.use(cookieParser(process.env.COOKIE_SECRET));
    this.express.use(session(sessionOption));
  }

  private routes(): void {

    this.express.get("/", (req: any, res: any, next) => {
      res.sendFile(path.join(__dirname, "../out/"));
    });
    // user route
    this.express.use("/api", Routes);

    // handle undefined routes
    this.express.use("*", (req, res, next) => {
      res.send("Make sure url is correct!!!");
    });
  }
}

export default new App().express;