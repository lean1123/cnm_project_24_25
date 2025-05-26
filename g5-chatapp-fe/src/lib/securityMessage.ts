import CryptoJS from "crypto-js";

export function encryptMessage(message: string, key: string): string {
  if (message === "" || message === "[Nội dung không hợp lệ]") {
    return "";
  }
  return CryptoJS.AES.encrypt(message, key).toString();
}

export function decryptMessage(encrypted: string, key: string): string {
  if (encrypted === "" || encrypted === "[Nội dung không hợp lệ]") {
    return "";
  }
  if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(encrypted)) {
    // Nếu chuỗi là tọa độ, không cần giải mã
    return encrypted;
  }
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    // Nếu giải mã sai, sẽ trả chuỗi rỗng
    if (!originalText) throw new Error("Failed to decrypt");
    return originalText;
  } catch (error) {
    return "[Nội dung không hợp lệ]";
  }
}
