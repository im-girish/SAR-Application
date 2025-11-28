import Joi from "joi";

export const createVehicleValidator = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string()
    .valid("tank", "truck", "ship", "aircraft", "other")
    .required(),
  category: Joi.string().valid("ground", "naval", "air").required(),
  description: Joi.string().min(10).required(),
  specifications: Joi.object({
    weight: Joi.string().optional(),
    length: Joi.string().optional(),
    width: Joi.string().optional(),
    height: Joi.string().optional(),
    crew: Joi.number().optional(),
    speed: Joi.string().optional(),
    range: Joi.string().optional(),
    armament: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  country: Joi.string().required(),
  inService: Joi.boolean().default(true),
  yearIntroduced: Joi.number().min(1900).max(2030).optional(),
});

export const updateVehicleValidator = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  type: Joi.string()
    .valid("tank", "truck", "ship", "aircraft", "other")
    .optional(),
  category: Joi.string().valid("ground", "naval", "air").optional(),
  description: Joi.string().min(10).optional(),
  specifications: Joi.object({
    weight: Joi.string().optional(),
    length: Joi.string().optional(),
    width: Joi.string().optional(),
    height: Joi.string().optional(),
    crew: Joi.number().optional(),
    speed: Joi.string().optional(),
    range: Joi.string().optional(),
    armament: Joi.array().items(Joi.string()).optional(),
  }).optional(),
  country: Joi.string().optional(),
  inService: Joi.boolean().optional(),
  yearIntroduced: Joi.number().min(1900).max(2030).optional(),
});
