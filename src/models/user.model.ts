import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import jwt from 'jwt-simple';
import vars from '@server/config/vars';
import apiResponse from '@server/utils/apiResponse';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { omitBy } from '@server/utils/omitBy';
import { PhoneValidationModel } from '@server/models/phoneValidation.model';

const roles = ['user', 'admin'] as const;
const transformFields = ['_id', 'username', 'phone', 'role', 'createdAt'] as const;

interface FindAndGenerateTokenOptions {
  phone: string;
  code?: string;
  refreshObject?: {
    expires: number;
    phone: string;
  };
}

export type TransformUser = {
  [P in keyof Pick<User, typeof transformFields[number]>]: User[P];
};

export interface User extends Document {
  _id: any;
  phone: string;
  role: typeof roles[number];
  username?: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  transform(): TransformUser;
  token(): string;
  codeMatches(): Promise<boolean>;
}

type UserFields = Exclude<
  {
    [P in keyof User]: User[P] extends () => any ? never : User[P];
  },
  never
>;

export interface UserModel extends Model<User> {
  roles(): (typeof roles)[number][],
  get(findParams?: Partial<UserFields>): Promise<User>;
  list(params?: Partial<UserFields> & { page?: number; perPage?: number }): Promise<User>;
  findAndGenerateToken(options: FindAndGenerateTokenOptions): Promise<{ user: User; accessToken: string }>;
}

const userSchema = new mongoose.Schema<User>(
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
    const findTicket = await PhoneValidationModel.get(this.phone)

    return findTicket?.code === code
  },
});

/**
 * Statics
 */
userSchema.statics = {
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
};

export const UserModel = mongoose.model<User, UserModel>('User', userSchema);

export default UserModel;
