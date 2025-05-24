// Email validation - checks for standard email format
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Name validation - only letters, no special characters except hyphen and space
export const isValidName = (name) => {
  if (!name || name.trim() === '') return false;
  // Allow letters, spaces, and hyphens, but not consecutive spaces
  const nameRegex = /^[a-zA-ZÀ-ỹ]+([ -][a-zA-ZÀ-ỹ]+)*$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
};

// Password validation
export const isValidPassword = (password) => {
  if (!password) return false;
  
  // Check for minimum length
  if (password.length < 6) return false;
  
  // Check for whitespace
  if (/\s/.test(password)) return false;
  
  // Optional: Enforce at least one number and one letter
  // Uncomment if you want to enforce this rule
  // if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return false;
  
  return true;
};

// Detailed password validation with specific error messages
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters long";
  if (/\s/.test(password)) return "Password cannot contain whitespace";
  
  // Optional: More specific validations
  // if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
  // if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
  // if (!/(?=.*[!@#$%^&*])/.test(password)) return "Password must contain at least one special character";
  
  return null;
};

// Date of birth validation - ensure user is at least 13 years old
export const isValidDob = (dob) => {
  if (!dob) return false;
  
  const dobDate = new Date(dob);
  const today = new Date();
  
  // Check if valid date
  if (isNaN(dobDate.getTime())) return false;
  
  // Check if in the past
  if (dobDate > today) return false;
  
  // Check if at least 13 years old
  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - 13);
  
  return dobDate <= minAgeDate;
};

// Sign up validation with detailed feedback
export const validateSignUp = ({ firstName, lastName, email, password, dob }) => {
  if (!firstName) return "First name is required";
  if (!lastName) return "Last name is required";
  if (!email) return "Email is required";
  if (!password) return "Password is required";
  
  if (!isValidName(firstName)) return "First name must contain only letters (and hyphens if needed)";
  if (!isValidName(lastName)) return "Last name must contain only letters (and hyphens if needed)";
  
  if (!isValidEmail(email)) return "Please enter a valid email address";
  
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  
  if (dob && !isValidDob(dob)) return "Invalid date of birth. You must be at least 13 years old.";
  
  return null;
};

// Sign in validation with detailed feedback
export const validateSignIn = ({ email, password }) => {
  if (!email) return "Email is required";
  if (!password) return "Password is required";
  
  if (!isValidEmail(email)) return "Please enter a valid email address";
  
  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;
  
  return null;
};
