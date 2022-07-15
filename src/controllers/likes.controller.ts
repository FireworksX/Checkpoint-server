import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { LikesPivotModel, LikesType, TransformLikesPivot } from '@server/models/likesPivot.model';

type AddLikeBody = { target: string; type: LikesType };

export default {
  add: async (req: AppRequestBody<AddLikeBody>, res: AppResponse<TransformLikesPivot>, next) => {
    try {
      const { target, type } = req.body;
      const userId = req.user._id;

      const exists = await LikesPivotModel.findOne({ target, user: userId });

      if (exists) {
        throw apiResponse.error({
          status: httpStatus.BAD_REQUEST,
          message: 'Like with same signature already exists',
        });
      }

      const newLike = await new LikesPivotModel({
        user: userId,
        target,
        type,
      }).save();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newLike.transform()));
    } catch (e) {
      return next(e);
    }
  },

  remove: async (req: AppRequestBody<{ target: string }>, res: AppResponse<any>, next) => {
    try {
      const { target } = req.body;
      const userId = req.user._id;

      const removeResult = await LikesPivotModel.findOneAndDelete({ target, user: userId });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(removeResult));
    } catch (e) {
      return next(e);
    }
  },
};
