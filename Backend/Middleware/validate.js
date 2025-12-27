// middleware/validate.js
export const validate = (schema) => {
  return (req, res, next) => {
    // We check the data (req.body) against the rules (schema)
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Find ALL errors, not just the first one
      stripUnknown: true, // Remove any weird data the user tried to sneak in
    });

    if (error) {
      // If there are errors, stop here! Send them to the frontend.
      const errorMessage = error.details[0].message;
      return res.status(400).json({ error: errorMessage });
    }

    // If no errors, go to the Controller
    next();
  };
};
