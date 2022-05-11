import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import crypto from 'crypto';
import { User } from '@server/models/user.model';

interface RefreshToken extends Document {
  token: string;
  userId: User['_id'];
  phone: string;
  expires: Date;
}

export interface RefreshTokenGenerateUser {
  _id: string;
  phone: string;
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
    ref: 'User',
    required: true,
  },
  phone: {
    type: String,
    ref: 'User',
    required: true,
  },
  expires: { type: Date },
});

refreshTokenSchema.statics = {
  async generate(user: RefreshTokenGenerateUser) {
    const userId = user._id;
    const phone = user.phone;
    const token = `${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expires = dayjs().add(30, 'days').toDate();
    const tokenObject = new RefreshToken({
      token,
      userId,
      phone,
      expires,
    });
    await tokenObject.save();
    return tokenObject;
  },
};

export const RefreshToken = mongoose.model<RefreshToken, RefreshTokenModel>('RefreshToken', refreshTokenSchema);

export default RefreshToken;
