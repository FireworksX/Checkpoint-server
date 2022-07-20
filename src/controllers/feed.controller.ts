import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import UserModel, { PopulateTransformUser } from '@server/models/user.model';
import { LocationModel, PopulateTransformLocation } from '@server/models/location.model';

export default {
  getUsersFeed: async (_req, res: AppResponse<PopulateTransformUser[]>, next) => {
    try {
      const findUsers = await UserModel.list({});
      const populatedUsers = await Promise.all(findUsers.map((user) => user.populateTransform({})));

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(populatedUsers));
    } catch (e) {
      return next(e);
    }
  },

  getLocationsFeed: async (_req, res: AppResponse<PopulateTransformLocation[]>, next) => {
    try {
      const findLocations = await LocationModel.list({});
      const populatedLocations = await Promise.all(findLocations.map((user) => user.populateTransform()));

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(populatedLocations));
    } catch (e) {
      return next(e);
    }
  },
};
