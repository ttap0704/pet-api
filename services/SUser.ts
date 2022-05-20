import Model from '../models';

interface CreateBusinessAttributes extends BusinessAttributes {
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

  async deleteCertRow(payload: { id: number }) {
    const id = payload.id;

    const delete_res = await Model.JoinCertification.destroy({ where: { id } })

    return delete_res;
  }

  async checkCertNum(payload: { cert_num: string, row: JoinCertificationAttributes }) {
    const cert_num = payload.cert_num;
    const row = payload.row
    const validate = await Model.Users.prototype.validPassword(cert_num, row.cert_num);

    return validate
  }

  async setBusinessInfo(payload: CreateBusinessAttributes) {
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

  async findUser(payload: LoginUserAttributes) {
    const login_id = payload.id;

    const user = await Model.Users.findOne({
      where: {
        login_id: login_id,
      },
    });

    return user;
  }
}

export default UserService;
