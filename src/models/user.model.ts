import mongoose from 'mongoose';
import dayjs from 'dayjs';
import jwt from 'jwt-simple';
import { vars } from '@server/config/vars';
import bcrypt from 'bcrypt';
import apiResponse from '@server/utils/apiResponse';
import httpStatus from 'http-status';
import uuidv4 from 'uuid/v4'

// const mongoose = require('mongoose');
// const httpStatus = require('http-status');
// const { omitBy, isNil } = require('lodash');
// const bcrypt = require('bcryptjs');
// const moment = require('moment-timezone');
// const jwt = require('jwt-simple');
// const uuidv4 = require('uuid/v4');
// const APIError = require('../utils/APIError');
// const { jwtSecret, jwtExpirationInterval } = require('../../config/vars');

const roles = ['user', 'guide', 'admin'];

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      trim: true,
    },
    userName: {
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
    chats: {
      guides: Number,
    },
    accounts: {
      telegram: Number,
    },
    picture: {
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
    const fields = ['id', 'userName', 'phone', 'role', 'accounts', 'createdAt'];

    fields.forEach((field) => {
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

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
userSchema.statics = {
  // roles,

  async get(findQuery) {
    try {
      const user = await this.findOne(findQuery);
      if (user) {
        return user;
      }

      throw new Error('User does not exist');
    } catch (error) {
      throw error;
    }
  },

  async findAndGenerateToken(options) {
    const { email, password, refreshObject } = options;
    if (!email) {
      throw new Error('An email is required to generate a token');
    }

    const user = await this.findOne({ email }).exec();
    const err = {
      status: 400,
      isPublic: true,
      message: '',
    };
    if (password) {
      if (user && (await user.passwordMatches(password))) {
        return { user, accessToken: user.token() };
      }
      err.message = 'Incorrect email or password';
    } else if (refreshObject && refreshObject.userEmail === email) {
      if (dayjs(refreshObject.expires).isBefore()) {
        err.message = 'Invalid refresh token.';
      } else {
        return { user, accessToken: user.token() };
      }
    } else {
      err.message = 'Incorrect email or refreshToken';
    }
    throw apiResponse.error(err);
  },

  list({ page = 1, perPage = 30, userName, role, accounts }) {
    const options = omitBy({ userName, role, accounts }, isNil);

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

// export default mongoose.model('User', userSchema);
