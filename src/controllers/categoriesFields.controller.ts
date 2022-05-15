import httpStatus from 'http-status';
import { AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { CategoryFieldModel, TransformCategoryField } from '@server/models/categoryField.model';

export default {
  getDetail: async (req, res: AppResponse<TransformCategoryField>, next) => {
    try {
      const { slug } = req.params;
      const findCategory = (await CategoryFieldModel.get({ slug })).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(findCategory));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req, res: AppResponse<TransformCategoryField>, next) => {
    try {
      const options = req.body;
      const newCategory = (await new CategoryFieldModel(options).save()).transform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
