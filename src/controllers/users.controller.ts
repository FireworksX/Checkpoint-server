import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { TransformUser, UserModel } from '@server/models/user.model';

export default {
  getUser: async (req, res: AppResponse<TransformUser>) => {
    try {
      const { username } = req.params;
      const findUser = (await UserModel.get({ username })).transform()

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findUser));
    } catch (e) {
      return res.json(apiResponse.reject(e.message));
    }
  },
};
