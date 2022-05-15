import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CityModel, TransformCity } from '@server/models/city.model';

export default {
  getCity: async (req, res: AppResponse<TransformCity>, next) => {
    try {
      const { slug } = req.params;
      const findCity = (await CityModel.get({ slug })).transform()

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCity));
    } catch (e) {
      return next(e);
    }
  },
  //
  // loggedIn: async (req, res: AppResponse<TransformUser>, next) => {
  //   try {
  //     res.status(httpStatus.OK);
  //     return res.json(apiResponse.resolve(req.user.transform()));
  //   } catch (e) {
  //     return next(e);
  //   }
  // },
};
