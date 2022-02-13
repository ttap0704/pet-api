import Model from '../models';
import { UsersAttributes, CreateUserAttributes, loginUserAttributes } from '../interfaces/IUser';

class UserService {
  async create(payload: CreateUserAttributes) {
    const created_user = await Model.Users.create(payload, {
      fields: ['login_id', 'password', 'name', 'phone', 'nickname', 'type'],
    });

    return created_user;
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
