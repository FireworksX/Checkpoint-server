import mongoose, { Model, Document, Schema, Types } from 'mongoose';
import { MODEL_NAMES } from '@server/constants/constants';
import { PopulateTransformUser } from '@server/models/user.model';
import { PopulateBySchema, populateBySchema } from '@server/utils/populateBySchema';
import { GenerateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { LIKES_TYPES } from '@server/models/likesPivot.model';
import { TransformCategory } from '@server/models/category.model';

const transformFields = ['_id', 'user', 'target', 'category', 'type', 'createdAt'] as const;
const populateFields = ['user', 'category'];

export const BOOKMARKS_TYPES = ['location'] as const;

export type BookmarksType = typeof LIKES_TYPES[number];
export type TransformBookmarksPivot = Pick<BookmarksPivot, typeof transformFields[number]>;

export type PopulateTransformBookmarksPivot = Omit<TransformBookmarksPivot, 'user' | 'category'> & {
  user: PopulateTransformUser;
  category: TransformCategory;
};

export interface BookmarksPivot extends Document, PopulateBySchema {
  user: Types.ObjectId;
  target: Types.ObjectId;
  category: Types.ObjectId;
  type: BookmarksType;
  createdAt: Date;
  transform(): TransformBookmarksPivot;
  populateTransform(): Promise<PopulateTransformBookmarksPivot>;
}

export interface BookmarksPivotModel extends Model<BookmarksPivot>, GenerateSlugBySchema {}

const bookmarksPivotSchema = new Schema<BookmarksPivot>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
    },
    target: {
      type: Schema.Types.ObjectId,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.Category,
    },
    type: {
      type: String,
      enum: BOOKMARKS_TYPES,
    },
  },
  {
    timestamps: true,
  },
);

bookmarksPivotSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  populateTransform() {
    return this.populateFields(populateFields);
  },
});

populateBySchema(bookmarksPivotSchema);

export const BookmarksPivotModel = mongoose.model<BookmarksPivot, BookmarksPivotModel>(
  MODEL_NAMES.BookmarksPivot,
  bookmarksPivotSchema,
);
