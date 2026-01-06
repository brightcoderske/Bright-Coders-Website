import Joi from "joi";

export const courseSchema = Joi.object({
  title: Joi.string().trim().min(5).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 5 characters",
  }),
  category: Joi.string().trim().max(50).required(),
  duration: Joi.string().trim().required(),
  price: Joi.number().min(0).max(1000000).required(),
  level: Joi.string().valid("Beginner", "Intermediate", "Advanced").required(),
  imageUrl: Joi.string().uri().required(),

  // --- NEW BOOLEAN FLAGS ---
  isPublic: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),

  // Validating the nested description object
  description: Joi.object({
    definition: Joi.string().max(1000).required(),
    learningPoints: Joi.array()
      .items(Joi.string().trim().min(1))
      .min(1)
      .required(),
    outcome: Joi.string().required(),
  }).required(),

  requirements: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
  focus: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
});

export const toggleFeaturedSchema = Joi.object({
  isFeatured: Joi.boolean().required(),
});
