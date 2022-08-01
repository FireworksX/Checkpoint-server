import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import { generateCode } from '@server/utils/generateCode';
import apiResponse from '@server/utils/apiResponse';
import { MODEL_NAMES } from '@server/constants/constants';
import { omit } from '@server/utils/omit';

export interface PhoneValidation extends Document {
  code: string;
  phone: string;
  expires: Date;
  createdAt: Date;
  transform(): TransformPhoneTicket;
}

interface PhoneValidationModel extends Model<PhoneValidation> {
  generate(phone: string): Promise<CreatedTicket>;
  get(phone: string): Promise<CreatedTicket>;
  has(options: { phone: string; code: string }): Promise<boolean>;
}

export type CreatedTicket = Omit<PhoneValidation, 'code'>;
export type TransformPhoneTicket = Pick<PhoneValidation, typeof transformFields[number]>;

const transformFields = ['_id', 'code', 'phone', 'expires', 'createdAt'] as const;

const phoneValidationSchema = new mongoose.Schema<PhoneValidation>({
  code: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
  },
  expires: { type: Date },
});

phoneValidationSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

phoneValidationSchema.static({
  async get(phone: string) {
    const ticket = await this.findOne({ phone });

    if (ticket) {
      delete ticket.code;

      return ticket;
    }

    throw apiResponse.error({
      message: 'Phone validation tickets does not exist',
    });
  },

  async has({ phone, code }) {
    const ticket = await this.findOne({ phone, code });

    return !!ticket;
  },

  async generate(phone: string) {
    const findTicket = await this.findOne({ phone });

    if (findTicket) {
      if (dayjs(findTicket.expires).isAfter(dayjs())) {
        return omit(findTicket.transform(), 'code');
      } else {
        await PhoneValidationModel.remove({ phone });
      }
    }

    const expires = dayjs().add(30, 'seconds').toDate();
    const tokenObject = new PhoneValidationModel({
      code: generateCode(phone),
      phone,
      expires,
    });
    const newTicket = (await tokenObject.save()).transform();

    return omit(newTicket, 'code');
  },
});

export const PhoneValidationModel = mongoose.model<PhoneValidation, PhoneValidationModel>(
  MODEL_NAMES.PhoneValidation,
  phoneValidationSchema,
);

export default PhoneValidation;
