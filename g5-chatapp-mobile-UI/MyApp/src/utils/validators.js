export const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export const isValidPassword = (password) => password.length >= 6;

export const validateSignUp = ({ firstName, lastName, email, password }) => {
  if (!firstName || !lastName || !email || !password)
    return "Please fill all the required fields";
  if (!isValidEmail(email)) return "Please enter a valid email address";
  if (!isValidPassword(password)) return "Password must be at least 6 characters long";
  return null;
};
