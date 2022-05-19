import { CustomValidator } from "express-validator";

export const coordsValidator: CustomValidator = (value: any) => {
  if (!value || typeof value?.lat !== 'number' || typeof value?.lng !== 'number') {
    throw 'Error validation of coords'
  }

  return true
}
