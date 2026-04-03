import Joi from "joi";

// 🔐 Strong password regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+=])[A-Za-z\d@$!%*?&^#()_+=]{8,}$/;

export const loginValidator = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
  otpMethod: Joi.string().valid("sms", "email").optional().default("sms"),
});

export const verifyOtpValidator = Joi.object({
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

export const registerValidator = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  username: Joi.string().min(3).max(30).required(), // ✅ added username

  phone: Joi.string().required(),

  email: Joi.string().email().required(),

  password: Joi.string().pattern(passwordRegex).required().messages({
    "string.pattern.base":
      "Password must be at least 8 characters long, include uppercase, lowercase, number and special character",
  }),

  // 🔥 Custom validation: password should NOT contain username/email
}).custom((value, helpers) => {
  const { password, username, email } = value;

  if (
    password.toLowerCase().includes(username.toLowerCase()) ||
    password.toLowerCase().includes(email.toLowerCase())
  ) {
    return helpers.message("Password should not contain username or email");
  }

  return value;
});
