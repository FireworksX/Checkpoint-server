export type CountryCode = keyof typeof countryPhoneCodes

export const countryPhoneCodes = {
  ru: '7',
};

export const countries = Object.keys(countryPhoneCodes) as CountryCode[]
