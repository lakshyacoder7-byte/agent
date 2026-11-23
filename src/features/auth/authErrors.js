export function getAuthErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "The email or password is incorrect.";
  }
  if (error?.code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Please confirm your email address using the link we sent you.";
  }
  if (
    error?.code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (error?.code === "email_address_invalid" || message.includes("email address is invalid")) {
    return "Enter a valid email address.";
  }
  if (error?.code === "weak_password" || message.includes("password should be")) {
    return "Choose a stronger password that meets the password requirements.";
  }
  if (message.includes("rate limit") || message.includes("too many requests")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return error?.message || "Something went wrong. Please try again.";
}
