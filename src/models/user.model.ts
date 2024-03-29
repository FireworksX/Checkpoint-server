import { model, Model, Document, Schema } from 'mongoose';
import dayjs from 'dayjs';
import jwt from 'jwt-simple';
import vars from '@server/config/vars';
import apiResponse from '@server/utils/apiResponse';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { omitBy } from '@server/utils/omitBy';
import { MODEL_NAMES } from '@server/constants/constants';
import { TransformMediaFile } from '@server/models/mediaFile.model';
import { PopulateBySchema, populateBySchema } from '@server/utils/populateBySchema';
import { CategoryModel, TransformCategory } from '@server/models/category.model';
import { LocationModel, PopulateTransformLocation } from '@server/models/location.model';
import { FollowersPivotModel } from '@server/models/followersPivot.model';
import { countries, CountryCode } from '@server/utils/countryPhoneCodes';
import { MailValidationModel } from '@server/models/mailValidation.model';

const roles = ['user', 'admin'] as const;
const transformFields = [
  '_id',
  'username',
  'avatar',
  'firstName',
  'lastName',
  'bio',
  'verify',
  'mail',
  'role',
  'createdAt',
] as const;

const populateFields = ['avatar'];

interface FindAndGenerateTokenOptions {
  mail: string;
  code?: string;
  refreshObject?: {
    expires: number;
    mail: string;
  };
}

interface PopulateOptions {
  withCategories?: boolean;
  withFollowers?: boolean;
  withSubscribers?: boolean;
  withLocations?: boolean;
  withCounters?: boolean;
}

export type TransformUser = Pick<User, typeof transformFields[number]>;

export type PopulateTransformUser = Omit<TransformUser, 'avatar'> & {
  avatar: TransformMediaFile;
  categories?: TransformCategory[];
  followers?: PopulateTransformUser[];
  subscribers?: PopulateTransformUser[];
  counters?: {
    followers: number;
    subscribers: number;
    locations: number;
  };
};

export interface User extends Document, PopulateBySchema {
  mail: string;
  role: typeof roles[number];
  country: CountryCode;
  avatar?: Schema.Types.ObjectId;
  username?: string;
  firstName?: string;
  lastName?: string;
  verify?: boolean;
  bio?: string;
  createdAt: Date;
  transform(): TransformUser;
  populateTransform(options: PopulateOptions): Promise<PopulateTransformUser>;
  token(): string;
  codeMatches(): Promise<boolean>;
  getCategories(): Promise<TransformCategory[]>;
  getLocations(): Promise<PopulateTransformLocation[]>;
  getCounters(): Promise<PopulateTransformUser['counters']>;
  updateUser(newUser: Partial<TransformUser>);
}

export interface UserModel extends Model<User> {
  roles(): typeof roles[number][];
  get(findParams?: Partial<TransformUser>): Promise<User>;
  has(findParams?: Partial<TransformUser>): Promise<boolean>;
  list(params?: Partial<TransformUser> & { page?: number; perPage?: number }): Promise<User[]>;
  findAndGenerateToken(options: FindAndGenerateTokenOptions): Promise<{ user: User; accessToken: string }>;
}

const userSchema = new Schema<User>(
  {
    mail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      maxlength: 128,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    country: {
      type: String,
      enum: countries,
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
    bio: {
      type: String,
      trim: true,
    },
    verify: {
      type: Boolean,
      default: false,
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

  async populateTransform(options: PopulateOptions = {}) {
    const { withCategories, withFollowers, withSubscribers, withLocations, withCounters } = options;

    const [populateUser, userCategories, followers, subscribers, locations, counters] = await Promise.all([
      this.populateFields(populateFields),
      withCategories ? this.getCategories() : Promise.resolve([]),
      withFollowers ? this.getFollowers() : Promise.resolve([]),
      withSubscribers ? this.getSubscribers() : Promise.resolve([]),
      withLocations ? this.getLocations() : Promise.resolve([]),
      withCounters ? this.getCounters() : Promise.resolve([]),
    ]);

    return {
      ...populateUser,
      categories: userCategories,
      followers,
      subscribers,
      locations,
      counters,
    };
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
    return await MailValidationModel.has({
      mail: this.mail,
      code,
    });
  },

  async getCategories() {
    const categoriesList = (
      await CategoryModel.list({
        author: this._id,
      })
    ).map((category) => category.transform());

    return categoriesList;
  },

  async getLocations() {
    const promises = (
      await LocationModel.list({
        author: this._id,
      })
    ).map((location) => location.populateTransform());

    const locationsList = Promise.all(promises);

    return locationsList;
  },

  async getFollowers() {
    const followerPromises = (await FollowersPivotModel.getFollowers({ targetId: this._id })).map((pivot) =>
      pivot.populateTransform(),
    );

    const listOfFollowers = await Promise.all(followerPromises);

    return listOfFollowers.map(({ follower }) => follower);
  },

  async getSubscribers() {
    const subscribersPromises = (await FollowersPivotModel.getSubscribers({ targetId: this._id })).map((pivot) =>
      pivot.populateTransform(),
    );

    const listOfSubscribers = await Promise.all(subscribersPromises);

    return listOfSubscribers.map(({ target }) => target);
  },

  async getCounters(): Promise<PopulateTransformUser['counters']> {
    const countFollowerPromises = await FollowersPivotModel.count({ target: this._id });
    const countSubscribersPromises = await FollowersPivotModel.count({ follower: this._id });
    const countLocationsPromises = await LocationModel.count({ author: this._id });

    const [countFollower, countSubscribers, countLocations] = await Promise.all([
      countFollowerPromises,
      countSubscribersPromises,
      countLocationsPromises,
    ]);

    return {
      followers: countFollower,
      subscribers: countSubscribers,
      locations: countLocations,
    };
  },

  async updateUser(newUser: Partial<TransformUser>) {
    const response = await this.updateOne(newUser, { upsert: true });

    if (response) {
      return (await UserModel.get({ _id: this._id })).transform();
    }

    throw apiResponse.error({
      message: 'User does not exist',
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

    return !!user;
  },

  async findAndGenerateToken(options: FindAndGenerateTokenOptions) {
    const { mail, code, refreshObject } = options;
    if (!mail) {
      throw new Error('An mail is required to generate a token');
    }

    const user = await this.findOne({ mail }).exec();
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
    } else if (refreshObject && refreshObject.mail === mail) {
      if (dayjs(refreshObject.expires).isBefore(dayjs())) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect mail or refreshToken';
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

populateBySchema(userSchema);

export const UserModel = model<User, UserModel>('User', userSchema);

export default UserModel;
