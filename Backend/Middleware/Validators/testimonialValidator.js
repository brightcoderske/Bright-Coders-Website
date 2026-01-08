import Joi from "joi";


export const testimonialValidationSchema = Joi.object({
  userName: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "User name is required",
  }),

  userRole: Joi.string().min(3).max(100).default("Student").messages({
    "string.min": "Role description is too short",
  }),

  message: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .custom((value, helpers) => {
      const count = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
      const MIN_WORDS = 5;
  const MAX_WORDS = 20;
      if (count >MAX_WORDS) {
        return helpers.message(`Keep it punchy! Max ${MAX_WORDS} words.`);
      }
      if(count <MIN_WORDS){
        return helpers.message(`Tell us a bit more! Use at least ${MIN_WORDS} words.`)
      }
      return value;
    })
    .messages({
      "string.min": "Testimonial message must be at least 10 characters",
      "any.required": "Message content is required",
    }),

  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1 star",
    "number.max": "Rating cannot exceed 5 stars",
    "any.required": "Please provide a star rating",
  }),

  imageUrl: Joi.string().uri().allow("", null).messages({
    "string.uri": "Please provide a valid URL for the profile picture",
  }),
});
