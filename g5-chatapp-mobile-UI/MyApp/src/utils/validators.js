// Kiểm tra định dạng email chuẩn
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

// Kiểm tra tên - chỉ chứa chữ cái, khoảng trắng hoặc dấu gạch ngang
export const isValidName = (name) => {
  if (!name || name.trim() === '') return false;
  const nameRegex = /^[a-zA-ZÀ-ỹ]+([ -][a-zA-ZÀ-ỹ]+)*$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 50;
};

// Kiểm tra mật khẩu
export const isValidPassword = (password) => {
  if (!password) return false;
  if (password.length < 6) return false;
  if (/\s/.test(password)) return false;

  // Nếu cần, có thể mở comment bên dưới để yêu cầu có ít nhất một chữ và một số
  if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return false;

  return true;
};

// Kiểm tra mật khẩu và trả thông báo lỗi cụ thể
export const validatePassword = (password) => {
  if (!password) return "Vui lòng nhập mật khẩu";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  if (/\s/.test(password)) return "Mật khẩu không được chứa khoảng trắng";

  // Các kiểm tra bổ sung nếu cần
  // if (!/(?=.*[A-Z])/.test(password)) return "Mật khẩu phải có ít nhất một chữ hoa";
  // if (!/(?=.*\d)/.test(password)) return "Mật khẩu phải có ít nhất một chữ số";
  // if (!/(?=.*[!@#$%^&*])/.test(password)) return "Mật khẩu phải có ít nhất một ký tự đặc biệt";

  return null;
};

// Kiểm tra ngày sinh - đảm bảo ít nhất 13 tuổi
export const isValidDob = (dob) => {
  if (!dob) return false;

  const dobDate = new Date(dob);
  const today = new Date();

  if (isNaN(dobDate.getTime())) return false;
  if (dobDate > today) return false;

  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - 13);

  return dobDate <= minAgeDate;
};

// Kiểm tra đăng ký tài khoản - trả lỗi cụ thể
export const validateSignUp = ({ firstName, lastName, email, password, dob }) => {
  if (!firstName) return "Vui lòng nhập họ";
  if (!lastName) return "Vui lòng nhập tên";
  if (!email) return "Vui lòng nhập email";
  if (!password) return "Vui lòng nhập mật khẩu";

  if (!isValidName(firstName)) return "Họ chỉ được chứa chữ cái, dấu gạch hoặc khoảng trắng";
  if (!isValidName(lastName)) return "Tên chỉ được chứa chữ cái, dấu gạch hoặc khoảng trắng";

  if (!isValidEmail(email)) return "Email không hợp lệ";

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  if (dob && !isValidDob(dob)) return "Ngày sinh không hợp lệ. Bạn phải từ 13 tuổi trở lên.";

  return null;
};

// Kiểm tra đăng nhập - trả lỗi cụ thể
export const validateSignIn = ({ email, password }) => {
  if (!email) return "Vui lòng nhập email";
  if (!password) return "Vui lòng nhập mật khẩu";

  if (!isValidEmail(email)) return "Email không hợp lệ";

  const passwordError = validatePassword(password);
  if (passwordError) return passwordError;

  return null;
};
