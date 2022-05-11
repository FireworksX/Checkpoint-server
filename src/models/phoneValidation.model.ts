import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import { generateCode } from '@server/utils/generateCode';

export interface PhoneValidation extends Document {
  code: string;
  phone: string;
  expires: Date;
}

interface PhoneValidationModel extends Model<PhoneValidation> {
  generate(phone: string): Promise<PhoneValidation>;
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
  async generate(phone: string) {
    const findTicket = await this.findOne({ phone });

    if (findTicket) {
      if (dayjs(findTicket.expires).isAfter(dayjs())) {
        return findTicket;
      } else {
        this.findOneAndRemove({ phone });
      }
    }

    const expires = dayjs().add(30, 'seconds').toDate();
    const tokenObject = new PhoneValidationModel({
      code: generateCode(),
      phone,
      expires,
    });
    await tokenObject.save();
    return tokenObject;
  },
};

export const PhoneValidationModel = mongoose.model<PhoneValidation, PhoneValidationModel>(
  'PhoneValidation',
  phoneValidationSchema,
);

export default PhoneValidation;
