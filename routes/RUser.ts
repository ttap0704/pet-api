import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';
import { resLoginUserAttributes } from '../interfaces/IUser';
import UserService from '../services/SUser';
import JwtService from '../services/SJwt';
const fetch = require('node-fetch');

class User {
  public express: express.Application;
  public logger: Logger;

  public data: object;
  public UserService: UserService;
  public JwtService: JwtService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
    this.UserService = new UserService();
    this.JwtService = new JwtService();
  }

  private middleware(): void { }

  private routes(): void {
    this.express.post('/login', this.loginUser);
    this.express.post('/certification', this.certBusinessUser)
    this.express.post('/join', this.joinUser);
  }

  private loginUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user: resLoginUserAttributes = await this.UserService.findUser(req.body);
      if (user.pass == true) {
        req.session.uid = user.uid;
        req.session.save();

        const token = await this.JwtService.createToken({ uid: user.uid });
        res.cookie('a-token', token, {
          maxAge: 60 * 60 * 12 * 1000,
          secure: false,
          httpOnly: true,
        });

        user.token = `${token}`;
      }
      res.status(200).send(user);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  private certBusinessUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");

      this.logger.info('url:::::::' + req.url);
      const data = req.body;
      const cert_data = {
        businesses: [
          {
            ...data
          }
        ]
      }
      const cert_res = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${process.env.ADMIN_CERTIFICATION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cert_data),
        },
      );

      const cert_res_json = await cert_res.json();
      let pass = false;
      if (cert_res_json.data[0].valid === '01') {
        pass = true
      }
      console.log(cert_res_json)
      res.status(200).send({ pass });
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  private joinUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      this.logger.info('url:::::::' + req.url);
      const { join_data, business_data } = req.body;
      const user = await this.UserService.create({
        login_id: join_data.id,
        password: join_data.password,
        name: join_data.name,
        phone: '01043759006',
        nickname: join_data.nickname,
        profile_path: 'super_profile.jpeg',
        type: 0,
      });

      const businesses_data = await this.UserService.setBusinessInfo({
        ...business_data,
        manager: user.id
      })

      res.json({ user, businesses_data });
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new User().express;
