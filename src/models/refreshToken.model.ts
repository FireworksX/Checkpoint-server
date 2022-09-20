import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { User } from '@server/models/user.model';
import { MODEL_NAMES } from '@server/constants/constants';

interface RefreshToken extends Document {
  token: string;
  userId: User['_id'];
  mail: string;
  expires: number;
}

export interface RefreshTokenGenerateUser {
  _id?: string;
  mail: string;
}

interface RefreshTokenModel extends Model<RefreshToken> {
  generate(user: RefreshTokenGenerateUser): Promise<RefreshToken>;
}

const refreshTokenSchema = new mongoose.Schema<RefreshToken>({
  token: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: MODEL_NAMES.User,
    required: true,
  },
  mail: {
    type: String,
    required: true,
  },
  expires: { type: Number },
});

refreshTokenSchema.statics = {
  async generate(user: RefreshTokenGenerateUser) {
    const userId = user._id;
    const mail = user.mail;

    const findRefreshToken = await RefreshTokenModel.findOne({ mail });

    let tokenObject;
    if (findRefreshToken) {
      tokenObject = findRefreshToken;
    } else {
      const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
      const expires = dayjs().add(30, 'days').toDate();
      tokenObject = new RefreshTokenModel({
        token,
        userId,
        mail,
        expires,
      });
      await tokenObject.save();
    }

    return tokenObject;
  },
};

export const RefreshTokenModel = mongoose.model<RefreshToken, RefreshTokenModel>(
  MODEL_NAMES.RefreshToken,
  refreshTokenSchema,
);

export default RefreshTokenModel;
