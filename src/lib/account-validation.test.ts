import { describe, expect, test } from 'vitest';
import { signupSchema, loginSchema, changePasswordSchema, normalizePhone } from './account-validation';
describe('Phone accounts',()=>{
  test('signup requires name, email and password',()=>{
    expect(signupSchema.safeParse({name:'Bekuma Biranu',email:'b@example.com',password:'a-secure-password'}).success).toBe(true);
    expect(signupSchema.safeParse({email:'b@example.com',password:'a-secure-password'}).success).toBe(false);
  });
  test('login uses email and password',()=>{
    expect(loginSchema.parse({email:' B@Example.com ',password:'secret'}).email).toBe('b@example.com');
    expect(loginSchema.safeParse({email:'0912345678',password:'secret'}).success).toBe(false);
  });
  test('local and international phone forms identify the same account',()=>{
    expect(normalizePhone('0912 345 678')).toBe('+251912345678');
    expect(normalizePhone('+251 912 345 678')).toBe('+251912345678');
  });
  test('password changes require the current password and matching confirmation',()=>{
    expect(changePasswordSchema.safeParse({current:'old-password',password:'new-password',confirm:'new-password'}).success).toBe(true);
    expect(changePasswordSchema.safeParse({current:'',password:'new-password',confirm:'new-password'}).success).toBe(false);
    expect(changePasswordSchema.safeParse({current:'old-password',password:'new-password',confirm:'different'}).success).toBe(false);
  });
});