import CryptoJS from 'crypto-js';

export const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decryptData = (ciphertext: string, key: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || null;
  } catch (error) {
    return null;
  }
};

export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

export const generateId = () => Math.random().toString(36).substring(2, 9);
