import Joi from "joi";

export const loginValidator = Joi.object({
  email: Joi.string().required(), // Changed from .email() to .string()
  password: Joi.string().min(6).required(),
});

export const verifyOtpValidator = Joi.object({
  email: Joi.string().required(), // Changed from .email() to .string()
  otp: Joi.string().length(6).required(),
});

export const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phone: Joi.string().required(),
  email: Joi.string().required(), // Changed from .email() to .string()
  password: Joi.string().min(6).required(),
});
