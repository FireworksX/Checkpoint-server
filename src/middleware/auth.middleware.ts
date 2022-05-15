import passport from 'passport';
import UserModel from '@server/models/user.model';
import apiResponse from '@server/utils/apiResponse';
import httpStatus from 'http-status';

// const ADMIN = 'admin';
const LOGGED_USER = '_loggedUser';

const handleJWT = (req, _, next, roles) => async (err, user, info) => {
  const error = err || info;
  const logIn = req.logIn;
  const apiError = apiResponse.error({
    message: error ? error.message : 'Unauthorized',
    status: httpStatus.UNAUTHORIZED,
    stack: error?.stack,
  });

  try {
    if (error || !user) throw apiError;
    await logIn(user, { session: false });
  } catch (e) {
    return next(apiError);
  }

  if (roles === LOGGED_USER) {
    if (user.role !== 'admin' && req.params.userId !== user._id.toString()) {
      apiError.status = httpStatus.FORBIDDEN;
      apiError.message = 'Forbidden';
      return next(apiError);
    }
  } else if (!roles.includes(user.role)) {
    apiError.status = httpStatus.FORBIDDEN;
    apiError.message = 'Forbidden';
    return next(apiError);
  } else if (err || !user) {
    return next(apiError);
  }

  req.user = user;

  return next();
};


export const authorize =
  (roles = UserModel.roles()) =>
  (req, res, next) =>
    passport.authenticate('jwt', { session: false }, handleJWT(req, res, next, roles))(req, res, next);
