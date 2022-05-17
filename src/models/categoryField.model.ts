import mongoose, { Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { MODEL_NAMES } from '@server/constants/constants';

const transformFields = ['_id', 'slug', 'name', 'createdAt'] as const;

export type TransformCategoryField = Pick<CategoryField, typeof transformFields[number]>;

export interface CategoryField extends Document {
  slug: string;
  name: string;
  value: unknown;
  createdAt: Date;
  transform(): TransformCategoryField;
}

export interface CategoryFieldModel extends Model<CategoryField> {
  get(findParams?: Partial<TransformCategoryField>): Promise<CategoryField>;
  list(params?: Partial<TransformCategoryField> & { page?: number; perPage?: number }): Promise<CategoryField>;
}

const categoryFieldSchema = new Schema<CategoryField>(
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
categoryFieldSchema.static({
  async get(findQuery: TransformCategoryField) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'CategoryField does not exist',
    });
  },
});

export const CategoryFieldModel = mongoose.model<CategoryField, CategoryFieldModel>(
  MODEL_NAMES.CategoryField,
  categoryFieldSchema,
);
