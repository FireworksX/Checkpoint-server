import mongoose, { Model, Document, Types, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { TransformCategoryField } from '@server/models/categoryField.model';
import { MODEL_NAMES } from '@server/constants/constants';

const transformFields = ['_id', 'slug', 'name', 'fields', 'createdAt'] as const;

export type TransformCategory = Pick<Category, typeof transformFields[number]>;

export type PopulateTransformCategory = Omit<TransformCategory, 'fields'> & {
  fields: TransformCategoryField[];
};

export interface Category extends Document {
  slug: string;
  name: string;
  fields: Types.ObjectId[];
  createdAt: Date;
  transform(): TransformCategory;
  populateTransform(): Promise<PopulateTransformCategory>;
}

export interface CategoryModel extends Model<Category> {
  get(findParams?: Partial<TransformCategory>): Promise<Category>;
  updateCategory(findParams: Partial<TransformCategory>, newCategory: Partial<TransformCategory>): Promise<Category>;
  list(params?: Partial<TransformCategory> & { page?: number; perPage?: number }): Promise<Category>;
}

const categorySchema = new Schema<Category>(
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
    fields: {
      type: [{ type: mongoose.Types.ObjectId, ref: MODEL_NAMES.CategoryField }],
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async populateTransform() {
    const transformed = {};
    const selfData = await this.populate('fields');

    transformFields.forEach((field) => {
      transformed[field] = selfData[field];
    });

    return transformed;
  },
});

/**
 * Statics
 */
categorySchema.static({
  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },

  async updateCategory(findQuery, newCategory: TransformCategory) {
    const category = await this.findOneAndUpdate(findQuery, newCategory, { upsert: true });

    if (category) {
      return category;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },
});

export const CategoryModel = mongoose.model<Category, CategoryModel>(MODEL_NAMES.Category, categorySchema);
