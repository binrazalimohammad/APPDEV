/** Client-side validation for renter registration (Feature 1). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export function validateRegisterForm(values: RegisterFormValues): string | null {
  if (values.fullName.trim().length < 2) {
    return 'Enter your full name (at least 2 characters).';
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    return 'Enter a valid email address.';
  }
  const digits = values.phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return 'Enter a valid phone number (at least 10 digits).';
  }
  if (values.password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (values.password !== values.confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}
