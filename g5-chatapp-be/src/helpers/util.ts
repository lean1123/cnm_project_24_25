import * as bcrypt from 'bcrypt';

export const hashPlainTextHelper = async (plainText: string) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  try {
    return bcrypt.hashSync(plainText, salt);
  } catch (err) {
    console.log(`Error hashing plain text: ${err}`);
  }
};

export const compareHashHelper = async (plainText: string, hash: string) => {
  try {
    return await bcrypt.compare(plainText, hash);
  } catch (error) {
    console.log(error);
  }
};

export const generateRandomCode = (length: number) => {
  const characters = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};
