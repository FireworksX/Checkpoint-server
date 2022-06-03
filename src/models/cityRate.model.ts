import mongoose, { Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { omitBy } from '@server/utils/omitBy';
import { MODEL_NAMES } from '@server/constants/constants';
import { PopulateBySchema } from '@server/utils/populateBySchema';
import { GenerateSlugBySchema, generateSlugBySchema } from '@server/utils/generateSlugBySchema';

const transformFields = ['_id', 'slug', 'name', 'value', 'description', 'createdAt'] as const;

export type TransformCityRate = Pick<CityRate, typeof transformFields[number]>;

export interface CityRate extends Document, PopulateBySchema {
  slug: string;
  name: string;
  value: number
  description: string
  createdAt: Date;
  transform(): TransformCityRate;
}

export interface CityRateModel extends Model<CityRate>, GenerateSlugBySchema {
  get(findParams?: Partial<TransformCityRate>): Promise<CityRate>;
  list(params?: Partial<TransformCityRate> & { skip?: number; limit?: number }): Promise<CityRate[]>;
  updateCityRate(findParams: Partial<TransformCityRate>, newCategory: Partial<TransformCityRate>): Promise<CityRate>;
}

const cityRateSchema = new Schema<CityRate>(
  {
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    value: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

cityRateSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
cityRateSchema.static({
  async get(findQuery) {
    const city = await this.findOne(findQuery);

    if (city) {
      return city;
    }

    throw apiResponse.error({
      message: 'CityRate does not exist',
    });
  },

  list({ skip = 0, limit = 30, ...restParams }) {
    const options = omitBy(restParams, (value) => !!value);

    return this.find(options).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  },

  async updateCityRate(findQuery, newCityRate: TransformCityRate) {
    const city = await this.findOneAndUpdate(findQuery, newCityRate, { upsert: true });

    if (city) {
      return city;
    }

    throw apiResponse.error({
      message: 'CityRate does not exist',
    });
  },
});

generateSlugBySchema(cityRateSchema);

export const CityRateModel = mongoose.model<CityRate, CityRateModel>(MODEL_NAMES.CityRate, cityRateSchema);
