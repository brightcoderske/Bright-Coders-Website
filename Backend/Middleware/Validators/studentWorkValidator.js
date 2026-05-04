import Joi from "joi";

export const studentWorkSchema = Joi.object({
  studentName: Joi.string().min(2).max(120).required(),
  category: Joi.string().valid("scratch", "web", "ai", "graphics").required(),
  title: Joi.string().min(2).max(180).required(),
  projectUrl: Joi.when("category", {
    is: "graphics",
    then: Joi.string().uri().allow("", null),
    otherwise: Joi.string().uri().required(),
  }),
  imageUrl: Joi.when("category", {
    is: "graphics",
    then: Joi.string().uri().required(),
    otherwise: Joi.string().uri().allow("", null),
  }),
  description: Joi.string().allow("", null).max(500),
  isPublic: Joi.boolean().default(false),
});
