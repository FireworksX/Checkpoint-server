import httpStatus from 'http-status';
import { AppRequestBody, AppRequestQuery, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { TransformUser, UserModel } from '@server/models/user.model';
import { GenerateTokenResponse, generateTokenResponse } from '@server/utils/generateTokenResponse';
import { omit } from '@server/utils/omit';
import { PhoneValidationModel, CreatedPhoneTicket } from '@server/models/phoneValidation.model';
import { RefreshTokenModel } from '@server/models/refreshToken.model';
import { CountryCode } from '@server/utils/countryPhoneCodes';
import { buildPhone } from '@server/utils/buildPhone';
import { CreatedMailTicket, MailValidationModel } from '@server/models/mailValidation.model';
import { verifyCodeMail } from '@server/services/mailTemplates/verifyCodeMail';

export default {
  phoneValidationCreate: async (
    req: AppRequestBody<{ phone: string; country: CountryCode }>,
    res: AppResponse<CreatedPhoneTicket>,
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

  mailValidationCreate: async (
    req: AppRequestBody<{ mail: string }>,
    res: AppResponse<Omit<CreatedMailTicket, 'code'>>,
    next,
  ) => {
    try {
      const { mail } = req.body;
      const validationTicket = await MailValidationModel.generate(mail);

      try {
        await res.locals.mailer.send({
          to: [mail],
          html: verifyCodeMail({ username: mail, code: validationTicket.code }),
        });
      } catch (e) {
        throw apiResponse.error({
          message: `Error while sending email: ${e.message}`,
        });
      }

      res.status(httpStatus.CREATED);
      return res.json(apiResponse.resolve(omit(validationTicket, 'code')));
    } catch (e) {
      return next(e);
    }
  },

  mailValidationCheck: async (
    req: AppRequestQuery<{ mail: string; code: string }>,
    res: AppResponse<boolean>,
    next,
  ) => {
    try {
      const { mail, code } = req.query;

      const validationTicket = await MailValidationModel.has({ mail, code });

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
      const { mail, refreshToken } = req.body;
      const refreshObject = await RefreshTokenModel.findOne({
        mail,
        token: refreshToken,
      });

      const { user, accessToken } = await UserModel.findAndGenerateToken({ mail, refreshObject });
      const token = await generateTokenResponse(user, accessToken);

      const userTransformed = user.transform();
      return res.json(apiResponse.resolve({ token, user: userTransformed }));
    } catch (e) {
      return next(e);
    }
  },
};
