import Model from '../models';
import { UsersAttributes, CreateUserAttributes, loginUserAttributes } from '../interfaces/IUser';

interface CreateBusinessType extends BusinessType {
  manager: number
}

class UserService {
  async create(payload: CreateUserAttributes) {
    const created_user = await Model.Users.create(payload, {
      fields: ['login_id', 'password', 'name', 'phone', 'nickname', 'type'],
    });

    return created_user;
  }

  async createCertNum(payload: { cert_num: string, manager: number }) {
    const cert_num = payload.cert_num;
    const manager = payload.manager;

    const created_cert_num = await Model.JoinCertification.create({ cert_num, manager });

    return created_cert_num;
  }

  async getCertRow(payload: { id: number }) {
    const id = payload.id;

    const cert_data = await Model.JoinCertification.findOne({
      where: {
        id
      }
    })

    return cert_data;
  }

  async checkCertNum(payload: { cert_num: string, row: JoinCertificationType }) {
    const cert_num = payload.cert_num;
    const row = payload.row
    const validate = await Model.Users.prototype.validPassword(cert_num, row.cert_num);

    return validate
  }

  async setBusinessInfo(payload: CreateBusinessType) {
    const created_business = await Model.Business.create(payload);

    return created_business;
  }

  async checkLoginId(payload: { login_id: string }) {
    const login_id = payload.login_id;

    const check = await Model.Users.findOne({
      where: {
        login_id
      }
    })

    return check;
  }

  async updateUser(payload: { id: number, target: string, value: string | number }) {
    const target = payload.target;
    const value = payload.value;
    const id = payload.id;

    const update_res = await Model.Users.update({ [target]: value },
      {
        where: {
          id,
        },
      })

    return update_res;
  }

  async checkNickName(payload: { nickname: string }) {
    const nickname = payload.nickname;

    const check = await Model.Users.findOne({
      where: {
        nickname
      }
    })

    return check;
  }

  async findUser(payload: loginUserAttributes) {
    const login_id = payload.id;
    const password = payload.password;

    if (login_id.length == 0 || password?.length == 0 || password == null) {
      const data = {
        message: '아이디, 비밀번호를 모두 입력해주세요.',
        pass: false,
      };

      return data;
    }

    const user = await Model.Users.findOne({
      where: {
        login_id: login_id,
      },
    });

    const validate = await Model.Users.prototype.validPassword(password, user.password);

    let message = '';
    let pass = false;
    if (validate) {
      console.log(user)
      if (user.certification == 0) {
        pass = false;
        message = '이메일 인증이 완료되지 않은 계정입니다.'
      }
      message = `${user.nickname}님 환영합니다!`;
      pass = true;
    } else {
      message = '아이디, 비밀번호를 다시 확인해주세요.';
    }

    const data = {
      nickname: user.nickname,
      login_id: user.login_id,
      uid: user.id,
      profile_path: user.profile_path,
      message,
      pass,
    };

    return data;
  }
}

export default UserService;
