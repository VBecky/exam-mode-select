import { z } from 'zod';

export function normalizePhone(value: string) {
  const compact = value.replace(/[\s()-]/g, '');
  if (/^0[79]\d{8}$/.test(compact)) return `+251${compact.slice(1)}`;
  if (/^[79]\d{8}$/.test(compact)) return `+251${compact}`;
  return compact.startsWith('251') ? `+${compact}` : compact;
}
export const phoneSchema = z.string().max(32).transform(normalizePhone).pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid phone number with country code.'));
export const passwordSchema = z.string().min(8, 'Use at least 8 characters.').max(128);
export const profileSchema = z.object({ name: z.string().trim().min(2, 'Enter your full name.').max(100), stream: z.enum(['natural', 'social']) });
export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.').max(255);
export const accountSchema = profileSchema.extend({ phone: z.union([z.literal(''), phoneSchema]) });
export const signupSchema = profileSchema.pick({ name: true }).extend({ email: emailSchema, password: passwordSchema });
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, 'Enter your password.').max(128) });
export const changePasswordSchema = z.object({ current: z.string().min(1, 'Enter your current password.'), password: passwordSchema, confirm: z.string() }).refine(v => v.password === v.confirm, { message: 'Passwords do not match.', path: ['confirm'] });