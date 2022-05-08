import Model from '../models';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

class JwtService {
  public async createToken(payload: { uid: number | undefined }) {
    const uid = payload.uid;
    const token_data = {
      uid,
    };
    const token = new Promise((resolve, reject) => {
      try {
        const tmp_token = jwt.sign(token_data, `${process.env.JWT_SECRET}`, { expiresIn: process.env.JWT_EXPIRE_IN });
        resolve(tmp_token);
      } catch (err) {
        reject(err);
        throw new Error(err);
      }
    });

    return await token;
  }

  public async verifyToken(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization?.split(' ');
    if (auth) {
      const access_token = auth[1];
      if (access_token) {
        jwt.verify(access_token, `${process.env.JWT_SECRET}`, (err, payload) => {
          if (!err) {
            next();
          } else {
            const current_url = req.originalUrl.split('/').filter(item => item);
            if (current_url[0] == 'manager' && !isNaN(Number(current_url[1]))) {
              const token_data = {
                uid: Number(current_url[1]),
              };

              const tmp_token = jwt.sign(token_data, `${process.env.JWT_SECRET}`, { expiresIn: process.env.JWT_EXPIRE_IN });
              res.cookie('a-token', tmp_token, {
                maxAge: 60 * 60 * 12 * 1000,
                secure: false,
                httpOnly: true,
              });
              res.status(200).send({ new_token: tmp_token });
            } else {
              res.status(403).send();
            }
          }
        });
      } else {
        res.status(403).send();
      }
    } else {
      res.status(403).send();
    }
  }
}

export default JwtService;
