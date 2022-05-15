import mongoose, { Model, Document } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';

const transformFields = ['_id', 'slug', 'name', 'createdAt'] as const;

export type TransformCity = {
  [P in keyof Pick<City, typeof transformFields[number]>]: City[P];
};

export interface City extends Document {
  _id: any;
  slug: string;
  name: string;
  createdAt: Date;
  transform(): TransformCity;
}

type CityFields = Exclude<
  {
    [P in keyof City]: City[P] extends () => unknown ? never : City[P];
  },
  never
>;

export interface CityModel extends Model<City> {
  get(findParams?: Partial<CityFields>): Promise<City>;
  list(params?: Partial<CityFields> & { page?: number; perPage?: number }): Promise<City>;
}

const citySchema = new mongoose.Schema<City>(
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
};

export const CityModel = mongoose.model<City, CityModel>('City', citySchema);
