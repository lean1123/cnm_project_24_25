import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

export function encryptMessage(message, key) {
  try {
    if (!message || message === "" || message === "[Nội dung không hợp lệ]") {
      return "";
    }
    
    // Kiểm tra nếu là tọa độ, không mã hóa
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(message)) {
      return message;
    }
    
    const encrypted = CryptoJS.AES.encrypt(message, key || "default_key").toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return message; // Return original message if encryption fails
  }
}

export function decryptMessage(encrypted, key) {
  try {
    if (!encrypted || encrypted === "" || encrypted === "[Nội dung không hợp lệ]") {
      return "";
    }
    
    // Nếu chuỗi là tọa độ, không cần giải mã
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(encrypted)) {
      return encrypted;
    }
    
    const bytes = CryptoJS.AES.decrypt(encrypted, key || "default_key");
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    
    // Nếu giải mã sai, sẽ trả về text gốc
    if (!originalText) {
      return encrypted; // Return original if decryption fails
    }
    
    return originalText;
  } catch (error) {
    console.error('Decryption error:', error);
    return encrypted; // Return original message if decryption fails
  }
}
