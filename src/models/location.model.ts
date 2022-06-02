import { model, Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { PopulateTransformCategory } from '@server/models/category.model';
import { MODEL_NAMES } from '@server/constants/constants';
import { TransformUser } from '@server/models/user.model';
import { PopulateTransformCity } from '@server/models/city.model';
import { TransformMediaFile } from '@server/models/mediaFile.model';
import { Pagination } from '@server/interfaces/helpers';
import httpStatus from 'http-status';
import { GenerateSlugBySchema, generateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { omitBy } from '@server/utils/omitBy';

const transformFields = ['_id', 'slug', 'title', 'category', 'author', 'city', 'coords', 'createdAt'] as const;
const populateFields = ['category', 'author', 'city', 'gallery']

export type TransformLocation = Pick<Location, typeof transformFields[number]>;

export type PopulateTransformLocation = Omit<TransformLocation, 'category' | 'author' | 'city'> & {
  category: PopulateTransformCategory[];
  author: TransformUser;
  city: PopulateTransformCity;
  gallery: TransformMediaFile[];
};

export interface Location extends Document {
  slug: string;
  title: string;
  category: Schema.Types.ObjectId;
  author: Schema.Types.ObjectId;
  city: Schema.Types.ObjectId;
  createdAt: Date;
  gallery: Schema.Types.ObjectId[];
  description?: string;
  coords: {
    lat: number;
    lng: number;
  };
  transform(): TransformLocation;
  populateTransform(): Promise<PopulateTransformLocation>;
}

export interface LocationModel extends Model<Location>, GenerateSlugBySchema {
  get(findParams?: Partial<TransformLocation>): Promise<Location>;
  updateLocation(findParams: Partial<TransformLocation>, newLocation: Partial<TransformLocation>): Promise<Location>;
  list(params?: Partial<TransformLocation> & Pagination): Promise<Location[]>;
}

const locationSchema = new Schema<Location, Model<Location>>(
  {
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    category: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.Category, required: true },
    author: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.User },
    city: { type: Schema.Types.ObjectId, ref: MODEL_NAMES.City },
    gallery: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.MediaFile, default: [] }],
    coords: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
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
    const filedPromises = await Promise.all(populateFields.map((field) => this.populate(field)))

    return this.transform(filedPromises);
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
      status: httpStatus.NOT_FOUND,
    });
  },

  list({ page = 1, perPage = 30, ...restParams }) {
    const options = omitBy(restParams, (value) => !!value);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  async updateLocation(findQuery, newLocation: TransformLocation) {
    const location = await this.findOneAndUpdate(findQuery, newLocation, { upsert: true });

    if (location) {
      return location;
    }

    throw apiResponse.error({
      message: 'Location does not exist',
      status: httpStatus.NOT_FOUND,
    });
  },


});

generateSlugBySchema(locationSchema)

export const LocationModel = model<Location, LocationModel>(MODEL_NAMES.Location, locationSchema);
