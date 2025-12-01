import Joi from "joi";

export const loginValidator = Joi.object({
  // identifier can be email or username
  identifier: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

export const verifyOtpValidator = Joi.object({
  // use same identifier again for OTP step
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

export const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().required(),
  email: Joi.string().required(), // still email for registration
  password: Joi.string().min(6).required(),
});
