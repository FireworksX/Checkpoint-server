import { CustomValidator } from 'express-validator';
import { countries } from '@server/utils/countryPhoneCodes';

export const countryValidator: CustomValidator = (value: any) => {
  if (!value) {
    throw 'Country code is required.';
  }

  if (countries.includes(value)) {
    return true;
  }

  throw `${value} is not allowed country.`;
};
