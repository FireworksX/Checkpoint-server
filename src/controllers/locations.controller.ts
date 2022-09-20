import httpStatus from 'http-status';
import { AppRequestBody, AppResponse } from '@server/interfaces/ApiInterfaces';
import apiResponse from '@server/utils/apiResponse';
import { omit } from '@server/utils/omit';
import { LocationModel, PopulateTransformLocation, TransformLocation } from '@server/models/location.model';
import { mergeLikes, WithLikes } from '@server/utils/mergeLikes';
import { LikesPivotModel } from '@server/models/likesPivot.model';
import { mergeBookmarks, WithBookmarks } from '@server/utils/mergeBookmarks';
import { BookmarksPivotModel } from '@server/models/bookmarksPivot.model';

type CreateLocationBody = Omit<TransformLocation, '_id' | 'slug' | 'createdAt'>;

export default {
  getDetail: async (req, res: AppResponse<WithBookmarks<WithLikes<PopulateTransformLocation>>>, next) => {
    try {
      const { slug } = req.params;
      const findLocation = await (await LocationModel.get({ slug })).populateTransform();

      const locationWithLikes = await mergeLikes(findLocation, {
        type: 'location',
        currentUserId: req?.user?._id,
      });

      const locationWithBookmarks = await mergeBookmarks(locationWithLikes, {
        type: 'location',
        currentUserId: req?.user?._id || '',
      });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(locationWithBookmarks));
    } catch (e) {
      return next(e);
    }
  },

  getList: async (req, res: AppResponse<WithBookmarks<WithLikes<PopulateTransformLocation>>[]>, next) => {
    try {
      let params = req.query;
      const { author, category } = params;

      if (params?.onlyLikes) {
        const allLikes = await LikesPivotModel.find({ user: req?.user?._id, type: 'location' });
        const allTargets = allLikes.map((like) => like.target);

        params = {
          _id: { $in: allTargets },
        };
      }

      if (params?.owner) {
        const allLikes = await LikesPivotModel.find({ user: params.owner, type: 'location' });
        const allTargets = allLikes.map((like) => like.target);

        const ownerLocations = (await LocationModel.list({ author: params.owner })).map(
          (location) => location.transform()._id,
        );

        params = {
          _id: { $in: [...allTargets, ...ownerLocations] },
        };
      }

      let bookmarkLocations = []

      if (!params?.onlyLikes && !params?.owner) {
        const findParams: any = { type: 'location', user: author }
        if (category) {
          findParams.category = category
        }

        const allBookmarks = await BookmarksPivotModel.find(findParams);

        const ids = allBookmarks.map(({ target }) => target);
        const bookmarkLocationsPromises = (
          await LocationModel.list({
            _id: {
              $in: ids,
            },
          })
        ).map((location) => location.populateTransform());

        bookmarkLocations = await Promise.all(bookmarkLocationsPromises)

      }

      const listOfCityPromises = (await LocationModel.list(params)).map((location) => location.populateTransform());
      const listOfCity = await Promise.all(listOfCityPromises);

      const combinedLocations = [...bookmarkLocations, ...listOfCity]

      const listWithLikes = await Promise.all(
        combinedLocations.map((location) => mergeLikes(location, { type: 'location', currentUserId: req?.user?._id })),
      );
      const listWithBookmarks = await Promise.all(
        listWithLikes.map((location) => mergeBookmarks(location, { type: 'location', currentUserId: req?.user?._id })),
      );

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(listWithBookmarks));
    } catch (e) {
      return next(e);
    }
  },

  create: async (req: AppRequestBody<CreateLocationBody>, res: AppResponse<PopulateTransformLocation>, next) => {
    try {
      const options = req.body;
      const userId = req.user._id;

      const titleField = options.fields?.title;

      const newLocation = await (
        await new LocationModel({
          author: userId,
          ...options,
          slug: await LocationModel.generateSlug(titleField || ''),
        }).save()
      ).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newLocation));
    } catch (e) {
      return next(e);
    }
  },

  delete: async (req: AppRequestBody<{ slug: string }>, res: AppResponse<boolean>, next) => {
    try {
      const user = req.user;
      const { slug } = req.body;

      if (user.role === 'admin') {
        await LocationModel.findOneAndDelete({ slug });
        res.status(httpStatus.OK);
        return res.json(apiResponse.resolve(true));
      }

      const findLocation = await LocationModel.findOne({ slug, author: user._id });

      if (!findLocation) {
        throw apiResponse.error({
          message: 'You can`t remove stranger locations',
          status: httpStatus.FORBIDDEN,
        });
      }

      await LocationModel.findOneAndDelete({ slug });

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(true));
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
      const newCategory = await (
        await LocationModel.updateLocation({ slug: req.body.findSlug }, options)
      ).populateTransform();

      res.status(httpStatus.OK);
      return res.json(apiResponse.resolve(newCategory));
    } catch (e) {
      return next(e);
    }
  },
};
