import mongoose, { Model, Document } from 'mongoose';
import dayjs from 'dayjs';
import { generateCode } from '@server/utils/generateCode';
import apiResponse from '@server/utils/apiResponse';
import { MODEL_NAMES } from '@server/constants/constants';
import { omit } from '@server/utils/omit';

export interface MailValidation extends Document {
  code: string;
  mail: string;
  expires: Date;
  createdAt: Date;
  transform(): TransformPhoneTicket;
}

interface MailValidationModel extends Model<MailValidation> {
  generate(mail: string): Promise<CreatedMailTicket>;
  get(mail: string): Promise<CreatedMailTicket>;
  has(options: { mail: string; code: string }): Promise<boolean>;
}

export type CreatedMailTicket = MailValidation;
export type TransformPhoneTicket = Pick<MailValidation, typeof transformFields[number]>;

const transformFields = ['_id', 'code', 'mail', 'expires', 'createdAt'] as const;

const mailValidationSchema = new mongoose.Schema<MailValidation>({
  code: {
    type: String,
    required: true,
    index: true,
  },
  mail: {
    type: String,
    required: true,
  },
  expires: { type: Date },
});

mailValidationSchema.method({
  transform() {
    const transformed = {};

    transformFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
});

mailValidationSchema.static({
  async get(mail: string) {
    const ticket = await this.findOne({ mail });

    if (ticket) {
      delete ticket.code;

      return ticket;
    }

    throw apiResponse.error({
      message: 'Mail validation tickets does not exist',
    });
  },

  async has({ mail, code }) {
    const ticket = await this.findOne({ mail, code });

    return !!ticket;
  },

  async generate(mail: string) {
    const findTicket = await this.findOne({ mail });

    if (findTicket) {
      if (dayjs(findTicket.expires).isAfter(dayjs())) {
        return omit(findTicket.transform(), 'code');
      } else {
        await MailValidationModel.remove({ mail });
      }
    }

    const expires = dayjs().add(30, 'seconds').toDate();
    const tokenObject = new MailValidationModel({
      code: generateCode(),
      mail,
      expires,
    });
    const newTicket = (await tokenObject.save()).transform();

    return newTicket;
  },
});

export const MailValidationModel = mongoose.model<MailValidation, MailValidationModel>(
  MODEL_NAMES.MailValidation,
  mailValidationSchema,
);

export default MailValidation;
