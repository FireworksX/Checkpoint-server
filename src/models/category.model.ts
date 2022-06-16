import mongoose, { Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { MODEL_NAMES } from '@server/constants/constants';
import { TransformUser } from '@server/models/user.model';
import { GenerateSlugBySchema, generateSlugBySchema } from '@server/utils/generateSlugBySchema';
import { omitBy } from '@server/utils/omitBy';
import { Pagination } from '@server/interfaces/helpers';
import { LocationModel } from '@server/models/location.model';
import httpStatus from 'http-status';

const transformFields = ['_id', 'slug', 'name', 'author', 'icon', 'description', 'createdAt'] as const;
const populateFields = ['author'];

export type TransformCategory = Pick<Category, typeof transformFields[number]>;

export type PopulateTransformCategory = Omit<TransformCategory, 'author'> & {
  author: TransformUser;
};

export interface Category extends Document {
  slug: string;
  name: string;
  description?: string;
  author: Schema.Types.ObjectId;
  icon?: string;
  createdAt: Date;
  transform(): TransformCategory;
  populateTransform(): Promise<PopulateTransformCategory>;
}

export interface CategoryModel extends Model<Category>, GenerateSlugBySchema {
  get(findParams?: Partial<TransformCategory>): Promise<Category>;
  removeCategory(findParams?: Partial<TransformCategory>): Promise<boolean>;
  updateCategory(findParams: Partial<TransformCategory>, newCategory: Partial<TransformCategory>): Promise<Category>;
  list(params?: Partial<TransformCategory> & Pagination): Promise<Category[]>;
}

const categorySchema = new Schema<Category>(
  {
    slug: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      maxlength: 128,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User,
      required: true,
    },
    icon: {
      type: String, // TODO Add enum with all icons
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
    const filedPromises = await Promise.all(populateFields.map((field) => this.populate(field)));

    return this.transform(filedPromises);
  },
});

/**
 * Statics
 */
categorySchema.static({
  async get(findQuery) {
    const category = await this.findOne(findQuery);
    if (category) {
      return category;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
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

  async updateCategory(findQuery, newCategory: TransformCategory) {
    const category = await this.findOneAndUpdate(findQuery, newCategory, { upsert: true });

    if (category) {
      return category;
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },

  async removeCategory(findQuery) {
    const findCategory = await this.findOne({ findQuery });

    if (findCategory) {
      try {
        await LocationModel.get({ category: findCategory._id.toString() });

        throw apiResponse.error({
          status: httpStatus.FORBIDDEN,
          message: "You can't remove category with location inside",
        });
      } catch (e) {
        await this.deleteOne(findQuery);

        return true;
      }
    }

    throw apiResponse.error({
      message: 'Category does not exist',
    });
  },
});

generateSlugBySchema(categorySchema);

export const CategoryModel = mongoose.model<Category, CategoryModel>(MODEL_NAMES.Category, categorySchema);
