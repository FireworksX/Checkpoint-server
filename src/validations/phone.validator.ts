import { CustomValidator } from "express-validator";

export const phoneValidator: CustomValidator = (value: any) => {
  let newValue = value
  if (typeof newValue === 'number') {
    newValue = newValue.toString()
  }

  if (typeof value === 'string') {
    if (value.length > 10 && value.length < 13) {
      return true
    }
  }

  return 'Error validation of phone number'
}
