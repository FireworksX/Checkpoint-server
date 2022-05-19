import mongoose, { Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { PopulateTransformCategory } from '@server/models/category.model';
import { MODEL_NAMES } from '@server/constants/constants';
import { TransformUser } from '@server/models/user.model';
import { PopulateTransformCity } from '@server/models/city.model';

const transformFields = ['_id', 'slug', 'title', 'category', 'author', 'city', 'createdAt'] as const;

export type TransformLocation = Pick<Location, typeof transformFields[number]>;

export type PopulateTransformLocation = Omit<TransformLocation, 'category' | 'author' | 'city'> & {
  category: PopulateTransformCategory[];
  author: TransformUser
  city: PopulateTransformCity
};

export interface Location extends Document {
  slug: string;
  title: string;
  description: string;
  category: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  city: Schema.Types.ObjectId;
  createdAt: Date;
  transform(): TransformLocation;
  populateTransform(): Promise<PopulateTransformLocation>;
}

export interface LocationModel extends Model<Location> {
  get(findParams?: Partial<TransformLocation>): Promise<Location>;
  updateLocation(findParams: Partial<TransformLocation>, newLocation: Partial<TransformLocation>): Promise<Location>;
  list(params?: Partial<TransformLocation> & { page?: number; perPage?: number }): Promise<Location>;
}

const locationSchema = new Schema<Location, Model<Location>>(
  {
    slug: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
    },
    category: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.Category },
    author: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.User },
    city: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.City },
  },
  {
    timestamps: true,
  },
);

locationSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async populateTransform() {
    const transformed = {};
    const selfData = await this.populate('category').populate('author').populate('city');

    transformFields.forEach((field) => {
      transformed[field] = selfData[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
locationSchema.static({
  async get(findQuery: TransformLocation) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'Location does not exist',
    });
  },

  async updateLocation(findQuery, newLocation: TransformLocation) {
    const category = await this.findOneAndUpdate(findQuery, newLocation, { upsert: true });

    if (category) {
      return category;
    }

    throw apiResponse.error({
      message: 'Location does not exist',
    });
  },
});

export const LocationModel = mongoose.model<Location, LocationModel>(MODEL_NAMES.Location, locationSchema);
