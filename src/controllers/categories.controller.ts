import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import {
  CategoryModel,
  TransformCategory,
  CategoryFields,
  PopulateTransformCategory,
} from '@server/models/category.model';
import { omit } from '@server/utils/omit';

export default {
  getDetail: async (req, res: AppResponse<TransformCategory>, next) => {
    try {
      const { slug } = req.params;
      const findCategory = await (await CategoryModel.get({ slug })).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCategory));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res: AppResponse<PopulateTransformCategory>, next) => {
    try {
      const options = req.body;
      const newCategory = await (await new CategoryModel(options).save()).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },

  update: async (
    req: AppRequestBody<{ findSlug: string } & Partial<CategoryFields>>,
    res: AppResponse<PopulateTransformCategory>,
    next,
  ) => {
    try {
      const options = omit(req.body, 'findSlug');
      const newCategory = await (
        await CategoryModel.updateCategory({ slug: req.body.findSlug }, options)
      ).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
