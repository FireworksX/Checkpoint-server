import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import { generateCode } from '@server/utils/generateCode';
import apiResponse from '@server/utils/apiResponse';

export interface PhoneValidation extends Document {
  code: string;
  phone: string;
  expires: Date;
}

interface PhoneValidationModel extends Model<PhoneValidation> {
  generate(phone: string): Promise<PhoneValidation>;
  get(phone: string): Promise<PhoneValidation>;
}

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

phoneValidationSchema.statics = {
  async get(phone: string) {
    const tickets = await this.findOne({ phone });

    if (tickets) {
      return tickets;
    }

    throw apiResponse.error({
      message: 'Phone validation tickets does not exist',
    });
  },

  async generate(phone: string) {
    const findTicket = await this.findOne({ phone });

    if (findTicket) {
      if (dayjs(findTicket.expires).isAfter(dayjs())) {
        return findTicket;
      } else {
        await PhoneValidationModel.remove({ phone });
      }
    }

    const expires = dayjs().add(30, 'seconds').toDate();
    const tokenObject = new PhoneValidationModel({
      code: generateCode(),
      phone,
      expires,
    });
    await tokenObject.save();

    this.remove;
    return tokenObject;
  },
};

export const PhoneValidationModel = mongoose.model<PhoneValidation, PhoneValidationModel>(
  'PhoneValidation',
  phoneValidationSchema,
);

export default PhoneValidation;
