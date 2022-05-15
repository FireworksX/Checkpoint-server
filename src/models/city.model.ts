import mongoose, { Model, Document, Schema, Types } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { TransformCategoryField } from '@server/models/categoryField.model';
import { omitBy } from '@server/utils/omitBy';

const transformFields = ['_id', 'slug', 'name', 'categories', 'createdAt'] as const;

export type TransformCity = {
  [P in keyof Pick<City, typeof transformFields[number]>]: City[P];
};

export type PopulateTransformCity = Omit<TransformCity, 'categories'> & {
  fields: TransformCategoryField[];
};

export interface City extends Document {
  _id: any;
  slug: string;
  name: string;
  createdAt: Date;
  categories: Types.ObjectId[];
  transform(): TransformCity;
  populateTransform(): Promise<PopulateTransformCity>;
}

export type CityFields = Exclude<
  {
    [P in keyof City]: City[P] extends () => unknown ? never : City[P];
  },
  never
>;

export interface CityModel extends Model<City> {
  get(findParams?: Partial<CityFields>): Promise<City>;
  list(params?: Partial<CityFields> & { skip?: number; limit?: number }): Promise<City[]>;
  updateCity(findParams: Partial<CityFields>, newCategory: Partial<CityFields>): Promise<City>;
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
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
      },
    ],
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

  async populateTransform() {
    const transformed = {};
    const selfData = await this.populate('categories');

    transformFields.forEach((field) => {
      transformed[field] = selfData[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
citySchema.statics = {
  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'City does not exist',
    });
  },

  list({ skip = 0, limit = 30, ...restParams }) {
    const options = omitBy(restParams, (value) => !!value);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  async updateCity(findQuery, newCity: CityFields) {
    const city = await this.findOneAndUpdate(findQuery, newCity, { upsert: true });

    if (city) {
      return city;
    }

    throw apiResponse.error({
      message: 'City does not exist',
    });
  },
};

export const CityModel = mongoose.model<City, CityModel>('City', citySchema);
