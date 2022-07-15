import mongoose, { Model, Document, Schema, Types } from 'mongoose';
import { MODEL_NAMES } from '@server/constants/constants';
import { PopulateTransformUser } from '@server/models/user.model';
import { PopulateBySchema, populateBySchema } from '@server/utils/populateBySchema';
import { GenerateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { Pagination } from '@server/interfaces/helpers';

const transformFields = ['_id', 'user', 'target', 'type', 'createdAt'] as const;
const populateFields = ['user', 'target'];

export const LIKES_TYPES = ['location'] as const

export type LikesType = typeof LIKES_TYPES[number]
export type TransformLikesPivot = Pick<LikesPivot, typeof transformFields[number]>;

type GetOptions = Pagination & { targetId: string };

export type PopulateTransformLikesPivot = Omit<TransformLikesPivot, 'categories'> & {
  user: PopulateTransformUser;
  target: any;
};

export interface LikesPivot extends Document, PopulateBySchema {
  user: Types.ObjectId;
  target: Types.ObjectId;
  type: LikesType
  createdAt: Date;
  transform(): TransformLikesPivot;
  populateTransform(): Promise<PopulateTransformLikesPivot>;
}

export interface LikesPivotModel extends Model<LikesPivot>, GenerateSlugBySchema {
  // getFollowers(options: GetOptions): Promise<LikesPivot[]>;
  // getSubscribers(options: GetOptions): Promise<LikesPivot[]>;
}

const likesPivotSchema = new Schema<LikesPivot>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
      required: true
    },
    target: {
      type: Schema.Types.ObjectId,
      required: true
    },
    type: {
      type: String,
      enum: LIKES_TYPES
    }
  },
  {
    timestamps: true,
  },
);

likesPivotSchema.method({
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

/**
 * Statics
 */
likesPivotSchema.static({
  getFollowers({ skip = 0, limit, targetId }: GetOptions) {
    return this.find({ target: targetId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  getSubscribers({ skip = 0, limit, targetId }: GetOptions) {
    return this.find({ follower: targetId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
});

populateBySchema(likesPivotSchema);

export const LikesPivotModel = mongoose.model<LikesPivot, LikesPivotModel>(
  MODEL_NAMES.LikesPivot,
  likesPivotSchema,
);
