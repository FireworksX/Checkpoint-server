import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CityModel } from '@server/models/city.model';
import { omit } from '@server/utils/omit';
import { LocationModel, PopulateTransformLocation, TransformLocation } from '@server/models/location.model';

type CreateLocationBody = Omit<TransformLocation, '_id' | 'slug' | 'createdAt'>;

export default {
  getDetail: async (req, res: AppResponse<PopulateTransformLocation>, next) => {
    try {
      const { slug } = req.params;
      const findCity = await (await LocationModel.get({ slug })).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCity));
    } catch (e) {
      return next(e);
    }
  },

  getList: async (req, res: AppResponse<TransformLocation[]>, next) => {
    try {
      const params = req.query;
      const listOfCity = (await LocationModel.list(params)).map((location) => location.transform());

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(listOfCity));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req: AppRequestBody<CreateLocationBody>, res: AppResponse<PopulateTransformLocation>, next) => {
    try {
      const options = req.body;
      const userId = req.user._id;
      const newLocation = await (
        await new LocationModel({
          author: userId,
          ...options,
          slug: await LocationModel.generateSlug(options.title),
        }).save()
      ).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newLocation));
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
    req: AppRequestBody<{ findSlug: string } & Partial<TransformLocation>>,
    res: AppResponse<PopulateTransformLocation>,
    next,
  ) => {
    try {
      const options = omit(req.body, 'findSlug');
      const newCategory = await (await LocationModel.updateLocation({ slug: req.body.findSlug }, options)).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
