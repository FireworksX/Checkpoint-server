import { CustomValidator } from "express-validator";

export const phoneValidator: CustomValidator = (value: any) => {
  if (!value) {
    throw 'Error validation of phone number'
  }

  let newValue = value
  if (typeof newValue === 'number') {
    newValue = newValue.toString()
  }

  if (typeof newValue === 'string') {
    if (newValue.length > 10 && newValue.length < 13) {
      return true
    }
  }

  throw 'Error validation of phone number'
}
