import { model, Model, Document, Schema } from 'mongoose';
import dayjs from 'dayjs';
import jwt from 'jwt-simple';
import vars from '@server/config/vars';
import apiResponse from '@server/utils/apiResponse';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { omitBy } from '@server/utils/omitBy';
import { PhoneValidationModel } from '@server/models/phoneValidation.model';
import { MODEL_NAMES } from '@server/constants/constants';
import { TransformMediaFile } from '@server/models/mediaFile.model';

const roles = ['user', 'admin'] as const;
const transformFields = ['_id', 'username', 'avatar', 'phone', 'role', 'createdAt'] as const;

interface FindAndGenerateTokenOptions {
  phone: string;
  code?: string;
  refreshObject?: {
    expires: number;
    phone: string;
  };
}

export type TransformUser = Pick<User, typeof transformFields[number]>;

export type PopulateTransformUser = Omit<TransformUser, 'avatar'> & {
  avatar: TransformMediaFile;
};

export interface User extends Document {
  phone: string;
  role: typeof roles[number];
  avatar?: Schema.Types.ObjectId;
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  transform(): TransformUser;
  populateTransform(): Promise<PopulateTransformUser>;
  token(): string;
  codeMatches(): Promise<boolean>;
}

export interface UserModel extends Model<User> {
  roles(): typeof roles[number][];
  get(findParams?: Partial<TransformUser>): Promise<User>;
  has(findParams?: Partial<TransformUser>): Promise<boolean>;
  list(params?: Partial<TransformUser> & { page?: number; perPage?: number }): Promise<User>;
  findAndGenerateToken(options: FindAndGenerateTokenOptions): Promise<{ user: User; accessToken: string }>;
}

const userSchema = new Schema<User>(
  {
    phone: {
      type: String,
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      maxlength: 128,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.MediaFile,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async populateTransform() {
    const selfData = await this.populate('fields');

    return this.transform(selfData);
  },

  token() {
    return jwt.encode(
      {
        exp: dayjs()
          .add(+vars.jwtExpirationInterval, 'minutes')
          .unix(),
        iat: dayjs().unix(),
        sub: this._id,
      },
      vars.jwtSecret,
    );
  },

  async codeMatches(code: string) {
    return await PhoneValidationModel.has({
      phone: this.phone,
      code,
    });
  },
});

/**
 * Statics
 */
userSchema.static({
  roles: () => roles,

  async get(findQuery) {
    const user = await this.findOne(findQuery);
    if (user) {
      return user;
    }

    throw apiResponse.error({
      message: 'User does not exist',
    });
  },

  async has(findQuery) {
    const user = await this.findOne(findQuery);

    return !!user
  },

  async findAndGenerateToken(options: FindAndGenerateTokenOptions) {
    const { phone, code, refreshObject } = options;
    if (!phone) {
      throw new Error('An phone is required to generate a token');
    }

    const user = await this.findOne({ phone }).exec();
    const err = {
      status: 400,
      isPublic: true,
      message: '',
    };

    if (code) {
      if (user && (await user.codeMatches(code))) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect phone or validation code';
    } else if (refreshObject && refreshObject.phone === phone) {
      if (dayjs(refreshObject.expires).isBefore(dayjs())) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect phone or refreshToken';
    }

    throw apiResponse.error(err);
  },

  list({ page = 1, perPage = 30, ...restParams }) {
    const options = omitBy(restParams, (value) => !!value);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return apiResponse.error({
        message: 'Validation Error',
        errors: [
          {
            field: 'email',
            location: 'body',
            messages: ['"email" already exists'],
          },
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack,
      });
    }
    return error;
  },

  async oAuthLogin({ service, id, email, name, picture }) {
    const user = await this.findOne({
      $or: [{ [`services.${service}`]: id }, { email }],
    });
    if (user) {
      user.services[service] = id;
      if (!user.name) user.name = name;
      if (!user.picture) user.picture = picture;
      return user.save();
    }
    const password = uuidv4();
    return this.create({
      services: { [service]: id },
      email,
      password,
      name,
      picture,
    });
  },
});

export const UserModel = model<User, UserModel>('User', userSchema);

export default UserModel;
