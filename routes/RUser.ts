import * as express from 'express';
import { Logger } from '../logger/logger';
import Model from '../models';
import UserService from '../services/SUser';
import JwtService from '../services/SJwt';
import EmailService from '../services/SEmail'
import { generateRandom } from '../src/utils/tools'
import { getCertificationContents } from '../src/utils/email_tools'
import { ACCOMMODATION_BUSINESS_CODE_LIST, RESTAURANT_BUSINESS_CODE_LIST } from '../constant'

const fetch = require('node-fetch');

class User {
  public express: express.Application;
  public logger: Logger;

  public data: object;
  public UserService: UserService;
  public JwtService: JwtService;
  public EmailService: EmailService;

  constructor() {
    this.express = express();
    this.middleware();
    this.routes();
    this.data = {};
    this.logger = new Logger();
    this.UserService = new UserService();
    this.JwtService = new JwtService();
    this.EmailService = new EmailService();
  }

  private middleware(): void { }

  private routes(): void {
    this.express.post('/login', this.loginUser);
    this.express.post('/certification', this.certBusinessUser)
    this.express.post('/join', this.joinUser);
    this.express.post('/join/certification', this.certUser);
  }

  private loginUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { id, password } = req.body;

      if (id.length == 0 || password?.length == 0 || password == null) {
        res.status(200).send({ pass: false, message: 'Empty Data' })
        return;
      }

      const user: UsersAttributes = await this.UserService.findUser(req.body);

      const validate = await Model.Users.prototype.validPassword(password, user.password);

      let pass = true;
      let message = '';
      let a_token = '';
      let f_user = {};
      if (validate) {
        if (user.certification == 0) {
          pass = false;
          message = 'Before Certification';
        } else {
          const token = await this.JwtService.createToken({ uid: user.id });
          res.cookie('a-token', token, {
            maxAge: 60 * 60 * 12 * 1000,
            secure: false,
            httpOnly: true,
          });

          a_token = `${token}`;
          f_user = user;
        }

      } else {
        pass = false;
        message = 'Wrong Password'
      }
      res.status(200).send({ pass, message, user: f_user, token: a_token });
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

      // if (!ACCOMMODATION_BUSINESS_CODE_LIST.includes(data.b_type) && !RESTAURANT_BUSINESS_CODE_LIST.includes(data.b_type)) {
      //   res.status(200).send({ pass: false, message: 'Not Target' });
      //   return;
      // }

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

      const check_id = await this.UserService.checkLoginId({ login_id: join_data.id });
      if (check_id && Number(check_id.id) > 0) {
        res.status(200).send({ pass: false, message: 'Duplicate Email' })
        return;
      }

      const check_nick = await this.UserService.checkNickName({ nickname: join_data.nickname });
      if (check_nick && Number(check_nick.id) > 0) {
        res.status(200).send({ pass: false, message: 'Duplicate Nick' })
        return;
      }

      // let user_type = null;
      // if (ACCOMMODATION_BUSINESS_CODE_LIST.includes(business_data.b_type)) {
      //   user_type = 2
      // } else if (RESTAURANT_BUSINESS_CODE_LIST.includes(business_data.b_type)) {
      //   user_type = 1
      // } else {
      //   res.status(200).json({ pass: false, message: 'Not Target' });
      //   return;
      // }

      const user = await this.UserService.create({
        login_id: join_data.id,
        password: join_data.password,
        name: join_data.name,
        phone: '01043759006',
        nickname: join_data.nickname,
        profile_path: 'super_profile.jpeg',
        type: 1,
      });

      const businesses_data = await this.UserService.setBusinessInfo({
        ...business_data,
        manager: user.id
      })

      if (user && business_data) {
        const random_num = generateRandom(111111, 999999);
        const cert_res = await this.UserService.createCertNum({ cert_num: `${random_num}`, manager: user.id })
        const email_data = {
          to_name: join_data.name,
          to: join_data.id,
          subject: '[어디어디] 회원가입 이메일 인증',
          message: getCertificationContents(random_num, `http://localhost:3001/manage/join/certification/${cert_res.id}`)
        }
        await this.EmailService.sendEmail(email_data)



        res.status(200).json({ pass: true, user, businesses_data, cert_res });
      } else {
        res.status(200).json({ pass: false, message: 'Error Join' });
      }

    } catch (err) {
      res.status(500).send();
      throw new Error(err);
    }
  };

  private certUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      this.logger.info('url:::::::' + req.url);
      const { cert_num, id } = req.body;

      const cert_row: JoinCertificationRowType = await this.UserService.getCertRow({ id: Number(id) })
      if (!cert_row) {
        res.status(200).send({ pass: false, message: 'Wrong Path' });
      } else {
        const validate = await this.UserService.checkCertNum({ cert_num, row: cert_row })

        let pass = true;
        let message = '';
        if (!validate) {
          pass = false;
          message = 'Wrong Number'
        } else {
          await this.UserService.deleteCertRow({ id })
          await this.UserService.updateUser({ id: cert_row.manager, target: 'certification', value: 1 })
        }
        res.status(200).send({ pass, message });
      }
    } catch (err) {
      50
      res.status(500).send();
      throw new Error(err);
    }
  };
}

export default new User().express;
