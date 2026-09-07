/**
 * Validates standard email address format.
 */
export function validateEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email.trim());
}

/**
 * Validates 10-digit Indian mobile telephone number.
 */
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Validates 6-digit Indian postal pincode.
 */
export function validatePincode(pincode: string): boolean {
  const cleaned = pincode.replace(/[^0-9]/g, '');
  return /^[1-9][0-9]{5}$/.test(cleaned);
}
