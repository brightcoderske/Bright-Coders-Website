// validationUtils.js

export const getWordCount = (text) => {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
};

export const validateTestimonial = (formData, image) => {
  const errors = {};

  // Name Validation
  if (!formData.user_name.trim()) {
    errors.user_name = "Full Name is required.";
  } else if (formData.user_name.trim().length < 3) {
    errors.user_name = "Name must be at least 3 characters.";
  }

  // Role Validation
  if (!formData.user_role.trim()) {
    errors.user_role = "Please specify your role (e.g., Student).";
  }

  // Message / Word Count Validation
  const words = getWordCount(formData.message);
  const message = formData.message.trim();
  const MAX_WORDS_LIMIT = 20;
  const MIN_WORDS_LIMIT = 5;

  if (!message) {
    errors.message = "The testimonial message cannot be empty.";
  } else if (words < MIN_WORDS_LIMIT) {
    // Check the user's word count
    errors.message = `Please share a little more detail (at least ${MIN_WORDS_LIMIT} words).`;
  } else if (words > MAX_WORDS_LIMIT) {
    errors.message = `Please keep your story under ${MAX_WORDS_LIMIT} words.`;
  }
  // Image Validation (Optional but recommended)
  if (image) {
    const fileSize = image.size / 1024 / 1024; // in MB
    if (fileSize > 2) {
      errors.image = "Image is too large. Max size is 2MB.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateImage = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Please upload a JPG, PNG, or WebP image.");
    return false;
  }

  if (file.size > maxSize) {
    alert("File is too large. Maximum size is 2MB.");
    return false;
  }

  return true;
};
