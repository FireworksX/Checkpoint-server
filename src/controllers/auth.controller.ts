import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
// import { userMock } from '@server/mocks/userMock';

export default {
  registerPhone: async (req, res: AppResponse<string>, next) => {
    try {
      const body = req.body;
      console.log(body);

      res.json(apiResponse.resolve('okk'));
    } catch (e) {
      res.json(apiResponse.reject());
      next(e);
    }
  },

  login: async (_, res: AppResponse<string>, next) => {
    try {
      // const userModel = userMock()
      // const accessToken = userModel.token()
      // const userTransformed = userModel.transform()
      // const token = generateTokenResponse(user, accessToken);
      // const userTransformed = user.transform();
      // return res.json({ token, user: userTransformed });

      res.json(apiResponse.resolve('okk'));
    } catch (e) {
      res.json(apiResponse.reject());
      next(e);
    }
  },
};
