import mongoose, { Model, Document, Schema } from 'mongoose';
import apiResponse from '@server/utils/apiResponse';
import { MODEL_NAMES } from '@server/constants/constants';

const transformFields = ['_id', 'fileName', 'mimetype', 'path', 'size', 'createdAt'] as const;

export type TransformMediaFile = Pick<MediaFile, typeof transformFields[number]>;

export interface MediaFile extends Document {
  fileName: string;
  mimetype: string;
  size: number;
  path: string;
  author: Schema.Types.ObjectId;
  createdAt: Date;
  transform(): TransformMediaFile;
}

export interface MediaFileModel extends Model<MediaFile> {
  get(findParams?: Partial<TransformMediaFile>): Promise<MediaFile>;
  delete(findParams?: Partial<TransformMediaFile>): Promise<MediaFile>;
}

const mediaFileSchema = new Schema<MediaFile>(
  {
    fileName: {
      type: String,
      trim: true,
    },
    mimetype: {
      type: String,
      trim: true,
    },
    path: {
      type: String,
      trim: true,
    },
    size: {
      type: Number,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.User
    },
  },
  {
    timestamps: true,
  },
);

mediaFileSchema.method({
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
mediaFileSchema.static({
  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'MediaFile does not exist',
    });
  },

  async delete(findQuery) {
    const deleteFile = await this.findOneAndDelete(findQuery);

    if (deleteFile) {
      return deleteFile;
    }

    throw apiResponse.error({
      message: 'MediaFile does not exist',
    });
  },
});

export const MediaFileModel = mongoose.model<MediaFile, MediaFileModel>(MODEL_NAMES.MediaFile, mediaFileSchema);
