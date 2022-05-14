import { Strategy, ExtractJwt } from 'passport-jwt';
import vars from '@server/config/vars';
import UserModel from '@server/models/user.model';


const jwtOptions = {
  secretOrKey: vars.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwt = async (payload, done) => {
  try {
    const user = await UserModel.get({ _id: payload.sub });
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

export default {
  jwt: new Strategy(jwtOptions, jwt),
};
