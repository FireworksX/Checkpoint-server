import mongoose, { Model, Document } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';

const transformFields = ['_id', 'slug', 'name', 'createdAt'] as const;

export type TransformCategoryField = {
  [P in keyof Pick<CategoryField, typeof transformFields[number]>]: CategoryField[P];
};

export interface CategoryField extends Document {
  _id: any;
  slug: string;
  name: string;
  value: unknown
  createdAt: Date;
  transform(): TransformCategoryField;
}

type CategoryFieldFields = Exclude<
  {
    [P in keyof CategoryField]: CategoryField[P] extends () => unknown ? never : CategoryField[P];
  },
  never
>;

export interface CategoryFieldModel extends Model<CategoryField> {
  get(findParams?: Partial<CategoryFieldFields>): Promise<CategoryField>;
  list(params?: Partial<CategoryFieldFields> & { page?: number; perPage?: number }): Promise<CategoryField>;
}

const categoryFieldSchema = new mongoose.Schema<CategoryField>(
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
    }
  },
  {
    timestamps: true,
  },
);

categoryFieldSchema.method({
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
categoryFieldSchema.statics = {
  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'CategoryField does not exist',
    });
  },
};

export const CategoryFieldModel = mongoose.model<CategoryField, CategoryFieldModel>(
  'CategoryField',
  categoryFieldSchema,
);
