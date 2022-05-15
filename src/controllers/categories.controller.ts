import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CategoryModel, TransformCategory, CategoryFields } from '@server/models/category.model';
import { omit } from '@server/utils/omit';

export default {
  getDetail: async (req, res: AppResponse<TransformCategory>, next) => {
    try {
      const { slug } = req.params;
      const findCategory = (await CategoryModel.get({ slug })).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCategory));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res: AppResponse<TransformCategory>, next) => {
    try {
      const options = req.body;
      const newCategory = (await new CategoryModel(options).save()).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },

  update: async (
    req: AppRequestBody<{ findSlug: string } & Partial<CategoryFields>>,
    res: AppResponse<TransformCategory>,
    next,
  ) => {
    try {
      const options = omit(req.body, 'findSlug');
      const newCategory = (await CategoryModel.updateCategory({ slug: req.body.findSlug }, options)).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
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
