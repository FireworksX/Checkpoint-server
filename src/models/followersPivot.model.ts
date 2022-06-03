import mongoose, { Model, Document, Schema, Types } from 'mongoose';
import { MODEL_NAMES } from '@server/constants/constants';
import UserModel, { PopulateTransformUser } from '@server/models/user.model';
import { PopulateBySchema, populateBySchema } from '@server/utils/populateBySchema';
import { GenerateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { Pagination } from '@server/interfaces/helpers';

const transformFields = ['_id', 'target', 'follower', 'createdAt'] as const;
const populateFields = ['target', 'follower'];

export type TransformFollowersPivot = Pick<FollowersPivot, typeof transformFields[number]>;

type GetOptions = Pagination & { targetId: string };

export type PopulateTransformFollowersPivot = Omit<TransformFollowersPivot, 'categories'> & {
  target: PopulateTransformUser;
  follower: PopulateTransformUser;
};

export interface FollowersPivot extends Document, PopulateBySchema {
  target: Types.ObjectId;
  follower: Types.ObjectId[];
  createdAt: Date;
  transform(): TransformFollowersPivot;
  populateTransform(): Promise<PopulateTransformFollowersPivot>;
}

export interface FollowersPivotModel extends Model<FollowersPivot>, GenerateSlugBySchema {
  getFollowers(options: GetOptions): Promise<PopulateTransformFollowersPivot[]>;
  getSubscribers(options: GetOptions): Promise<PopulateTransformFollowersPivot[]>;
}

const followersPivotSchema = new Schema<FollowersPivot>(
  {
    target: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
    },
    follower: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
    },
  },
  {
    timestamps: true,
  },
);

followersPivotSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async populateTransform() {
    const populatedFollowersPivotPromise = this.populateFields(populateFields);
    const findOwnerPromise = UserModel.get({ _id: this.owner });

    const [populatedFollowersPivot, findOwner] = await Promise.all([populatedFollowersPivotPromise, findOwnerPromise]);

    return {
      ...populatedFollowersPivot,
      owner: await findOwner.populateTransform({ withCategories: true }),
    };
  },
});

/**
 * Statics
 */
followersPivotSchema.static({
  getFollowers({ skip = 0, limit, targetId }: GetOptions) {
    return this.find({ target: targetId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  getSubscribers({ skip = 0, limit, targetId }: GetOptions) {
    return this.find({ follower: targetId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },
});

populateBySchema(followersPivotSchema);

export const FollowersPivotModel = mongoose.model<FollowersPivot, FollowersPivotModel>(
  MODEL_NAMES.FollowersPivot,
  followersPivotSchema,
);
