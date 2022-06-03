import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { omit } from '@server/utils/omit';
import { CityRateModel, TransformCityRate } from '@server/models/cityRate.model';

export default {
  getDetail: async (req, res: AppResponse<TransformCityRate>, next) => {
    try {
      const { slug } = req.params;
      const findCity = (await CityRateModel.get({ slug })).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCity));
    } catch (e) {
      return next(e);
    }
  },

  getList: async (req, res: AppResponse<TransformCityRate[]>, next) => {
    try {
      const { skip, limit } = req.params;
      const listOfCity = (await CityRateModel.list({ skip, limit })).map((city) => city.transform());

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(listOfCity));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res: AppResponse<TransformCityRate>, next) => {
    try {
      const options = req.body;
      const slug = await CityRateModel.generateSlug(options.name);

      const newCity = await (
        await new CityRateModel({
          ...options,
          slug,
        }).save()
      ).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCity));
    } catch (e) {
      return next(e);
    }
  },

  delete: async (req: AppRequestBody<{ slug: string }>, res: AppResponse<any>, next) => {
    try {
      const { slug } = req.body;
      const removeResult = await CityRateModel.findOneAndDelete({ slug });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(removeResult));
    } catch (e) {
      return next(e);
    }
  },

  update: async (
    req: AppRequestBody<{ findSlug: string } & Partial<TransformCityRate>>,
    res: AppResponse<TransformCityRate>,
    next,
  ) => {
    try {
      const options = omit(req.body, 'findSlug');
      const newCategory = await (await CityRateModel.updateCityRate({ slug: req.body.findSlug }, options)).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
