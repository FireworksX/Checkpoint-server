import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CategoryModel, TransformCategory, PopulateTransformCategory } from '@server/models/category.model';
import { omit } from '@server/utils/omit';

type CreateCategoryBody = Omit<TransformCategory, 'slug' | '_id' | 'author'>;

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

  getList: async (req, res: AppResponse<TransformCategory[]>, next) => {
    try {
      const params = req.params;
      const findCategories = await CategoryModel.list(params);

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCategories));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req: AppRequestBody<CreateCategoryBody>, res: AppResponse<PopulateTransformCategory>, next) => {
    try {
      const { _id } = req.user;
      const options = req.body;
      const newCategory = await (
        await new CategoryModel({
          ...options,
          author: _id,
          slug: await CategoryModel.generateSlug(options.name),
        }).save()
      ).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },

  update: async (
    req: AppRequestBody<{ findSlug: string } & Partial<TransformCategory>>,
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

  remove: async (req: AppRequestBody<{ findSlug: string }>, res: AppResponse<boolean>, next) => {
    try {
      const result = await CategoryModel.removeCategory({ slug: req.body.findSlug });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(result));
    } catch (e) {
      return next(e);
    }
  },
};
