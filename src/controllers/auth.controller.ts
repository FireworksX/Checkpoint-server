import httpStatus from 'http-status';
import { AppRequestBody, AppRequestQuery, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { TransformUser, UserModel } from '@server/models/user.model';
import { GenerateTokenResponse, generateTokenResponse } from '@server/utils/generateTokenResponse';
import { omit } from '@server/utils/omit';
import { PhoneValidationModel, CreatedTicket } from '@server/models/phoneValidation.model';
import { RefreshTokenModel } from '@server/models/refreshToken.model';
import { CountryCode } from '@server/utils/countryPhoneCodes';
import { buildPhone } from '@server/utils/buildPhone';

export default {
  phoneValidationCreate: async (
    req: AppRequestBody<{ phone: string; country: CountryCode }>,
    res: AppResponse<CreatedTicket>,
    next,
  ) => {
    try {
      const { phone, country } = req.body;
      const fullPhone = buildPhone(phone, country);
      const validationTicket = await PhoneValidationModel.generate(fullPhone);

      res.status(httpStatus.CREATED);
      return res.json(apiResponse.resolve(validationTicket));
    } catch (e) {
      return next(e);
    }
  },

  phoneValidationCheck: async (
    req: AppRequestQuery<{ phone: string; country: CountryCode; code: string }>,
    res: AppResponse<boolean>,
    next,
  ) => {
    try {
      const { phone, country, code } = req.query;
      const fullPhone = buildPhone(phone, country);

      const validationTicket = await PhoneValidationModel.has({ phone: fullPhone, code });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(validationTicket));
    } catch (e) {
      return next(e);
    }
  },

  register: async (req, res: AppResponse<{ token: GenerateTokenResponse; user: TransformUser }>, next) => {
    try {
      const userData = omit(req.body, 'role', 'verify');
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

  refreshToken: async (req, res: AppResponse<{ token: GenerateTokenResponse; user: TransformUser }>, next) => {
    try {
      const { phone, refreshToken } = req.body;
      const refreshObject = await RefreshTokenModel.findOneAndRemove({
        phone,
        token: refreshToken,
      });

      const { user, accessToken } = await UserModel.findAndGenerateToken({ phone, refreshObject });
      const token = await generateTokenResponse(user, accessToken);

      const userTransformed = user.transform();
      return res.json(apiResponse.resolve({ token, user: userTransformed }));
    } catch (e) {
      return next(e);
    }
  },
};
