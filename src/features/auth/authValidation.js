export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePassword(password) {
  return password.length >= 8;
}

export function passwordsMatch(password, confirmation) {
  return password === confirmation;
}

export function validateFullName(fullName) {
  const length = fullName.trim().length;
  return length >= 2 && length <= 100;
}

export function validateInterests(interests) {
  return Array.isArray(interests) && interests.length <= 8;
}