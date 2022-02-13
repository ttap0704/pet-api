import * as http from 'http';
import App from './app';
import { Logger } from './logger/logger';
import { AddressInfo } from 'net';
// import dotenv from 'dotenv'

const port = 3080;
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();
const { sequelize } = require('./models');
import db from './models';

App.set('port', port);
const server = http.createServer(App);
db.sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Success DB Connection');
    })
    .catch((error: any) => {
        console.error(error);
    });

server.listen(port);

const logger = new Logger();

server.on('listening', function (): void {
    const dir = './uploads';
    const contents_dir = ['restaurant', 'exposure_menu', 'accommodation', 'rooms', 'profile'];
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    for (const x of contents_dir) {
        if (!fs.existsSync(`${dir}/${x}`)) fs.mkdirSync(`${dir}/${x}`);
    }

    const addr: string | AddressInfo | null = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    logger.info(`Listening on ${bind}`);
});

module.exports = App;
