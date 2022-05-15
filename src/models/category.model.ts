import mongoose, { Model, Document, Types } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';

const transformFields = ['_id', 'slug', 'name', 'createdAt'] as const;

export type TransformCategory = {
  [P in keyof Pick<Category, typeof transformFields[number]>]: Category[P];
};

export interface Category extends Document {
  _id: any;
  slug: string;
  name: string;
  fields: Types.ObjectId[];
  createdAt: Date;
  transform(): TransformCategory;
}

export type CategoryFields = Exclude<
  {
    [P in keyof Category]: Category[P] extends () => unknown ? never : Category[P];
  },
  never
>;

export interface CategoryModel extends Model<Category> {
  get(findParams?: Partial<CategoryFields>): Promise<Category>;
  updateCategory(findParams: Partial<CategoryFields>, newCategory: Partial<CategoryFields>): Promise<Category>;
  list(params?: Partial<CategoryFields> & { page?: number; perPage?: number }): Promise<Category>;
}

const categorySchema = new mongoose.Schema<Category>(
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
      type: [{ type: mongoose.Types.ObjectId, ref: 'CategoryField' }],
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
});

/**
 * Statics
 */
categorySchema.statics = {
  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },

  async updateCategory(findQuery, newCategory: CategoryFields) {
    const category = await this.findOneAndUpdate(findQuery, newCategory, { upsert: true });

    if (category) {
      return category;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },
};

export const CategoryModel = mongoose.model<Category, CategoryModel>('Category', categorySchema);
