import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';
import { resLoginUserAttributes } from '../interfaces/IUser';
import UserService from '../services/SUser';
import JwtService from '../services/SJwt';

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
    this.express.post('/join', this.joinUser);
  }

  private loginUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const user: resLoginUserAttributes = await this.UserService.findUser(req.body);
      if (user.pass == true) {
        req.session.uid = user.uid;
        req.session.save();

        const token = await this.JwtService.createToken({ uid: user.uid });
        res.cookie('access-token', token, {
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

  private joinUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      this.logger.info('url:::::::' + req.url);
      const data = req.body;
      const user = await this.UserService.create({
        login_id: data.id,
        password: data.password,
        name: data.name,
        phone: '01043759006',
        nickname: data.nickname,
        profile_path: 'super_profile.jpeg',
        type: 0,
      });

      res.json(user);
    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new User().express;
