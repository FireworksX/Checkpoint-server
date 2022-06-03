import mongoose, { Model, Document, Schema, Types } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { omitBy } from '@server/utils/omitBy';
import { MODEL_NAMES } from '@server/constants/constants';
import { PopulateTransformUser } from '@server/models/user.model';
import { PopulateBySchema, populateBySchema } from '@server/utils/populateBySchema';
import { GenerateSlugBySchema, generateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { TransformCityRate } from '@server/models/cityRate.model';

const transformFields = ['_id', 'slug', 'name', 'owner', 'gallery', 'facts', 'rates', 'createdAt'] as const;
const populateFields = ['owner', 'gallery', 'rates'];

export type TransformCity = Pick<City, typeof transformFields[number]>;

export type PopulateTransformCity = Omit<TransformCity, 'categories'> & {
  owner: PopulateTransformUser;
  rates: TransformCityRate[];
};

export interface City extends Document, PopulateBySchema {
  slug: string;
  name: string;
  owner: Types.ObjectId;
  gallery: Types.ObjectId[];
  facts: { name: string; value: string }[];
  rates: Types.ObjectId[];
  createdAt: Date;
  transform(): TransformCity;
  populateTransform(): Promise<PopulateTransformCity>;
}

export interface CityModel extends Model<City>, GenerateSlugBySchema {
  get(findParams?: Partial<TransformCity>): Promise<City>;
  list(params?: Partial<TransformCity> & { skip?: number; limit?: number }): Promise<City[]>;
  updateCity(findParams: Partial<TransformCity>, newCategory: Partial<TransformCity>): Promise<City>;
}

const citySchema = new Schema<City>(
  {
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true,
    },
    gallery: [
      {
        type: Schema.Types.ObjectId,
        ref: MODEL_NAMES.MediaFile,
      },
    ],
    owner: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
    },
    facts: [{ name: { type: String }, value: { type: String } }],
    rates: [{ type: Schema.Types.ObjectId, ref: MODEL_NAMES.CityRate }],
  },
  {
    timestamps: true,
  },
);

citySchema.method({
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
citySchema.static({
  async get(findQuery) {
    const city = await this.findOne(findQuery);

    if (city) {
      return city;
    }

    throw apiResponse.error({
      message: 'City does not exist',
    });
  },

  list({ skip = 0, limit = 30, ...restParams }) {
    const options = omitBy(restParams, (value) => !!value);

    return this.find(options).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  async updateCity(findQuery, newCity: TransformCity) {
    const city = await this.findOneAndUpdate(findQuery, newCity, { upsert: true });

    if (city) {
      return city;
    }

    throw apiResponse.error({
      message: 'City does not exist',
    });
  },
});

populateBySchema(citySchema);
generateSlugBySchema(citySchema);

export const CityModel = mongoose.model<City, CityModel>(MODEL_NAMES.City, citySchema);
