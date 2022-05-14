import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { TransformUser, UserModel } from '@server/models/user.model';
import { GenerateTokenResponse, generateTokenResponse } from '@server/utils/generateTokenResponse';
import { omit } from '@server/utils/omit';
import { PhoneValidationModel, PhoneValidation } from '@server/models/phoneValidation.model';

export default {
  phoneValidation: async (req, res: AppResponse<PhoneValidation>, next) => {
    try {
      const { phone } = req.body;
      const validationTicket = await PhoneValidationModel.generate(phone);
      res.status(httpStatus.CREATED);
      return res.json(apiResponse.resolve(validationTicket));
    } catch (e) {
      return next(e)
    }
  },

  register: async (req, res: AppResponse<{ token: GenerateTokenResponse; user: TransformUser }>, next) => {
    try {
      const userData = omit(req.body, 'role');
      const user = await new UserModel(userData).save();
      const userTransformed = user.transform();
      const token = await generateTokenResponse(user, user.token());
      res.status(httpStatus.CREATED);
      return res.json(apiResponse.resolve({ token, user: userTransformed }));
    } catch (e) {
      return next(e);
    }
  },

  login: async (req, res: AppResponse<{ token: GenerateTokenResponse; user: TransformUser }>, next) => {
    try {
      const options = req.body;
      const { user, accessToken } = await UserModel.findAndGenerateToken(options);
      const token = await generateTokenResponse(user, accessToken);

      const userTransformed = user.transform();
      return res.json(apiResponse.resolve({ token, user: userTransformed }));
    } catch (e) {
      return next(e);
    }
  },
};
