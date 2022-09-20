import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { PopulateTransformUser, TransformUser, UserModel } from '@server/models/user.model';
import { FollowersPivotModel } from '@server/models/followersPivot.model';

export default {
  getUser: async (req, res: AppResponse<PopulateTransformUser>, next) => {
    try {
      const { username } = req.params;
      const findUser = await (
        await UserModel.get({ username })
      ).populateTransform({
        withCategories: true,
        withFollowers: true,
        withSubscribers: true,
        withCounters: true,
      });

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

  update: async (req: AppRequestBody<Partial<TransformUser>>, res: AppResponse<TransformUser>, next) => {
    try {
      const options = req.body;
      const newUser = await req.user.updateUser(options);

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newUser));
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
        withCounters: true,
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
          message: 'You cant to follow yourself',
        });
      }

      let resultTarget = await FollowersPivotModel.findOne({ target, follower: userId });

      if (!resultTarget) {
        resultTarget = await new FollowersPivotModel({ target, follower: userId }).save();
      }

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(resultTarget));
    } catch (e) {
      return next(e);
    }
  },

  unsubscribe: async (req, res: AppResponse<any>, next) => {
    try {
      const userId = req.user._id.toString();
      const { target } = req.body;

      if (userId === target) {
        throw apiResponse.error({
          status: httpStatus.BAD_REQUEST,
          message: 'You cant to follow yourself',
        });
      }

      const findFollower = await FollowersPivotModel.findOneAndRemove({ target, follower: userId });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findFollower));
    } catch (e) {
      return next(e);
    }
  },

  checkSubscribe: async (req, res: AppResponse<boolean>, next) => {
    try {
      const userId = req.user._id.toString();
      const { target } = req.query;

      if (userId === target) {
        res.status(httpStatus.OK);
        return res.json(apiResponse.resolve(true));
      }

      const findFollower = await FollowersPivotModel.findOne({ target, follower: userId });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(!!findFollower));
    } catch (e) {
      return next(e);
    }
  },
};
