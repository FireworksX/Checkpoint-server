import jwt from 'jwt-simple';
import dayjs from 'dayjs';
import { vars } from '@config/vars';

export const userMock = () => {
  const userData = {
    _id: 'hgiodfhjiewrjhio54jt3',
    firstName: 'Arthur',
    lastName: 'Abeltinsh',
    username: 'Fireworks',
  };

  const token = () => {
    console.log(vars);
    return jwt.encode(
      {
        exp: dayjs()
          .add(+vars.jwtExpirationInterval, 'minutes')
          .unix(),
        iat: dayjs().unix(),
        sub: userData._id,
      },
      vars.jwtSecret,
    );
  };

  const transform = () => {
    const transformed = {};
    const fields = ['id', 'userName', 'phone', 'role', 'accounts', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = userData[field];
    });

    return transformed;
  };

  return {
    token,
    transform
  };
};
