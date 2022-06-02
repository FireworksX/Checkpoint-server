import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { TransformUser, UserModel } from '@server/models/user.model';

export default {
  getUser: async (req, res: AppResponse<TransformUser>, next) => {
    try {
      const { username } = req.params;
      const findUser = (await UserModel.get({ username })).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findUser));
    } catch (e) {
      return next(e);
    }
  },

  hasRegisterUser: async (req, res: AppResponse<boolean>, next) => {
    try {
      const findUser = await UserModel.has(req.query);

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findUser));
    } catch (e) {
      return next(e);
    }
  },

  loggedIn: async (req, res: AppResponse<TransformUser>, next) => {
    try {
      const userModel = req.user;
      const userCategoriesPromise = req.user.getCategories();

      const [userCategories] = await Promise.all([userCategoriesPromise]);

      res.status(httpStatus.OK);
      return res.json(
        apiResponse.resolve({
          ...userModel.transform(),
          categories: userCategories,
        }),
      );
    } catch (e) {
      return next(e);
    }
  },
};
