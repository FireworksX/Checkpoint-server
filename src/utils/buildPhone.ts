import { CountryCode, countryPhoneCodes } from '@server/utils/countryPhoneCodes';

export const buildPhone = (phone: string, country: CountryCode) => `${countryPhoneCodes[country]}${phone}`;
