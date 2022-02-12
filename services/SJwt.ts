import Model from "../models"
import * as jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

class JwtService {
  public async createToken(payload: { login_id: string, uid: number }) {
    const login_id = payload.login_id;
    const uid = payload.uid
    const token_data = {
      login_id,
      uid
    }
    const token = new Promise((resolve, reject) => {
      try {
        const tmp_token = jwt.sign(token_data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE_IN })
        resolve(tmp_token)
      } catch (err) {
        reject(err);
        throw new Error(err);
      }
    })

    return await token;
  }

  public async verifyToken(req: Request, res: Response, next: NextFunction) {
    const access_token = req.cookies['access-token'];

    if (access_token) {
      const decoded_token = jwt.verify(access_token, process.env.JWT_SECRET);
      if (decoded_token) {
        next();
      } else {
        res.status(204).send();
      }
    } else {
      res.status(204).send();
      return false;
    }
  }
}

export default JwtService