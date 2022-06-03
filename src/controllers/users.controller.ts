import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { PopulateTransformUser, TransformUser, UserModel } from '@server/models/user.model';
import { FollowersPivotModel } from '@server/models/followersPivot.model';

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

  loggedIn: async (req, res: AppResponse<PopulateTransformUser>, next) => {
    try {
      const fullUser = await req.user.populateTransform({
        withCategories: true,
        withFollowers: true,
        withSubscribers: true,
      });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(fullUser));
    } catch (e) {
      return next(e);
    }
  },

  subscribe: async (req, res: AppResponse<any>, next) => {
    try {
      const userId = req.user._id.toString();
      const { target } = req.body;

      if (userId === target) {
        throw apiResponse.error({
          status: httpStatus.BAD_REQUEST,
          message: 'You cant to follow yourself'
        })
      }

      let resultTarget = await FollowersPivotModel.findOne({ target, follower: userId })

      if (!resultTarget) {
        resultTarget = await new FollowersPivotModel({ target, follower: userId }).save()
      }

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(resultTarget));
    } catch (e) {
      return next(e);
    }
  },
};
