import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import {
  BookmarksPivotModel,
  BookmarksType,
  PopulateTransformBookmarksPivot,
} from '@server/models/bookmarksPivot.model';
import { LocationModel } from '@server/models/location.model';

type AddBookmarkBody = { target: string; category: string; type: BookmarksType };

export default {
  add: async (req: AppRequestBody<AddBookmarkBody>, res: AppResponse<PopulateTransformBookmarksPivot>, next) => {
    try {
      const { target, type, category } = req.body;
      const userId = req.user._id;

      const findTarget = await BookmarksPivotModel.findOne({ target, user: userId, type, category });

      if (findTarget) {
        throw apiResponse.error({
          status: httpStatus.BAD_REQUEST,
          message: 'Bookmark with same signature already exists',
        });
      }

      if (type === 'location') {
        const findLocation = await LocationModel.findOne({ author: userId, _id: target })

        if (findLocation) {
          throw apiResponse.error({
            status: httpStatus.BAD_REQUEST,
            message: 'You can not add bookmark to yourself location',
          });
        }
      }

      const newBookmark = await new BookmarksPivotModel({
        user: userId,
        category,
        target,
        type,
      }).save();

      const populatedBookmark = await newBookmark.populateTransform()

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(populatedBookmark));
    } catch (e) {
      return next(e);
    }
  },

  remove: async (req: AppRequestBody<{ target: string, type: string }>, res: AppResponse<any>, next) => {
    try {
      const { target, type } = req.body;
      const userId = req.user._id;

      const removeResult = await BookmarksPivotModel.findOneAndDelete({ target, user: userId, type });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(removeResult));
    } catch (e) {
      return next(e);
    }
  },
};
