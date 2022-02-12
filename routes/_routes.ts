import * as express from "express";
import { Logger } from "../logger/logger";
import User from "./RUser";
import Restaurant from "./RRestaurant";
import ExposureMenu from "./RExposureMenu";
import EntireMenu from "./REntireMenu";
import EntireMenuCategory from "./REntireMenuCategory";
import Accommodation from "./RAccommodation";
import Rooms from "./RRooms";
import Upload from "./RUpload";
import Image from "./RImage"
import Manager from "./RManager"

class Routes {

    public express: express.Application;
    public logger: Logger;

    // array to hold users
    public users: any[];

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
        this.logger = new Logger();
    }

    // Configure Express middleware.
    private middleware(): void {
        this.express.use(express.urlencoded({ extended: false }));
        this.express.use(express.json());
    }

    private routes(): void {
        this.express.use("/user", User);
        this.express.use("/restaurant", Restaurant);
        this.express.use("/exposure_menu", ExposureMenu);
        this.express.use("/entire_menu", EntireMenu);
        this.express.use("/entire_menu_category", EntireMenuCategory);
        this.express.use("/accommodation", Accommodation);
        this.express.use("/rooms", Rooms);
        this.express.use("/upload", Upload);
        this.express.use("/image", Image)
        this.express.use("/manager", Manager)
    }
}

export default new Routes().express;