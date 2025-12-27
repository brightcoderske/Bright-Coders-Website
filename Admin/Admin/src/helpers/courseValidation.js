/**
 * Validation Helper for AddCourseForm 
 */

export const validateCourseForm = (formData) => {
  const errors = {};

  // Security Helper: Regex to block suspicious HTML characters
  const xssRegex = /[<>]/;

  // 1. Basic Info Validation + Security
  if (!formData.title?.trim()) {
    errors.title = "Course title is required.";
  } else if (formData.title.length < 5 || formData.title.length > 100) {
    errors.title = "Title must be between 5 and 100 characters.";
  } else if (xssRegex.test(formData.title)) {
    errors.title = "Title contains invalid characters (< or >).";
  }

  if (!formData.category?.trim()) {
    errors.category = "Category is required.";
  } else if (formData.category.length > 50) {
    errors.category = "Category name is too long.";
  }

  // Price Validation
  const priceValue = formData.price?.toString().trim();
  if (!priceValue) {
    errors.price = "Price is required.";
  } else {
    const floatRegex = /^\d+(\.\d+)?$/;
    if (!floatRegex.test(priceValue)) {
      errors.price = "Enter a valid number.";
    } else if (parseFloat(priceValue) < 0) {
      errors.price = "Price cannot be negative.";
    } else if (parseFloat(priceValue) > 1000000) {
      // Security: Limit max price
      errors.price = "Price exceeds maximum limit.";
    }
  }

  // 2. Nested Objects + Security
  if (!formData.description?.definition?.trim()) {
    errors.definition = "Definition is required.";
  } else if (formData.description.definition.length > 1000) {
    errors.definition = "Definition is too long (Max 1000 chars).";
  }

  // 3. Array Validations (Applying safety to each item)
  const validateArrayItems = (arr, fieldName, maxLen = 200) => {
    const validItems = arr?.filter((item) => item.trim() !== "");
    if (!validItems || validItems.length === 0) {
      errors[fieldName] = `Please add at least one ${fieldName}.`;
      return;
    }
    // Check if any single item is suspiciously long
    const tooLong = validItems.some((item) => item.length > maxLen);
    if (tooLong) {
      errors[fieldName] = `Each item must be under ${maxLen} characters.`;
    }
  };

  validateArrayItems(formData.description.learningPoints, "learningPoints");
  validateArrayItems(formData.requirements, "requirements");
  validateArrayItems(formData.focus, "focus");

  const allowedLevels = ["Beginner", "Intermediate", "Advanced"];
  if (!formData.level || !allowedLevels.includes(formData.level)) {
    errors.level = "Invalid level selection.";
  }

  if (!formData.imageUrl) {
    errors.imageUrl = "Image is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const cleanCourseData = (formData) => {
  // Security: Truncate strings just in case before sending to DB
  return {
    ...formData,
    title: formData.title.trim().substring(0, 100),
    price: parseFloat(formData.price),
    focus: formData.focus.filter((f) => f.trim() !== ""),
    requirements: formData.requirements.filter((r) => r.trim() !== ""),
    description: {
      ...formData.description,
      learningPoints: formData.description.learningPoints.filter(
        (p) => p.trim() !== ""
      ),
      definition: formData.description.definition.trim(),
    },
  };
};
