import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CityFields, CityModel, PopulateTransformCity, TransformCity } from '@server/models/city.model';
import { omit } from '@server/utils/omit';

export default {
  getDetail: async (req, res: AppResponse<PopulateTransformCity>, next) => {
    try {
      const { slug } = req.params;
      const findCity = await (await CityModel.get({ slug })).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCity));
    } catch (e) {
      return next(e);
    }
  },

  getList: async (req, res: AppResponse<TransformCity[]>, next) => {
    try {
      const { skip, limit } = req.params;
      const listOfCity = (await CityModel.list({ skip, limit })).map((city) => city.transform());

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(listOfCity));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res: AppResponse<PopulateTransformCity>, next) => {
    try {
      const options = req.body;
      const newCategory = await (await new CityModel(options).save()).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },

  delete: async (req: AppRequestBody<{ slug: string }>, res: AppResponse<any>, next) => {
    try {
      const { slug } = req.body;
      const removeResult = await CityModel.findOneAndDelete({ slug });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(removeResult));
    } catch (e) {
      return next(e);
    }
  },

  update: async (
    req: AppRequestBody<{ findSlug: string } & Partial<CityFields>>,
    res: AppResponse<PopulateTransformCity>,
    next,
  ) => {
    try {
      const options = omit(req.body, 'findSlug');
      const newCategory = await (await CityModel.updateCity({ slug: req.body.findSlug }, options)).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
