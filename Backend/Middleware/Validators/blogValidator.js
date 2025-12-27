import Joi from "joi";

export const blogValidationSchema = Joi.object({
  title: Joi.string()
    .min(5)
    .max(255)
    .required()
    .messages({ "any.required": "Title is required" }),

  category: Joi.string()
    .min(3)
    .max(100)
    .default("General")
    .messages({ "string.min": "Category name is too short" }),

  summary: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({ "any.required": "A simple explanation (summary) is required" }),

  content: Joi.string()
    .min(20)
    .required()
    .messages({ "any.required": "Main article content cannot be empty" }),

  keyHighlights: Joi.array()
    .items(Joi.string().min(2))
    .min(1)
    .required()
    .messages({ "array.min": "Please add at least one highlight point" }),

  author: Joi.string().allow("", null).default("Bright Coders Team"),

  imageUrl: Joi.string()
    .uri()
    .required()
    .messages({ "string.uri": "Please provide a valid image URL" }),
});
