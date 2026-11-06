import { expect, test, vi } from 'vitest';
import { deleteVerifiedAccount } from './account-deletion.server';
import { deleteAccountSchema } from './account-validation';

test('only the signed-in owner can delete their account', async () => {
  const deleteUser = vi.fn();
  await expect(deleteVerifiedAccount('owner', 'password', {
    getUser: async () => ({ id: 'someone-else', email: 'other@example.com' }),
    verifyPassword: async () => 'someone-else', deleteUser,
  })).rejects.toThrow('Please log in again');
  expect(deleteUser).not.toHaveBeenCalled();
});
test('guests cannot delete an account', async () => {
  const deleteUser = vi.fn();
  await expect(deleteVerifiedAccount('owner', 'password', { getUser: async () => null, verifyPassword: async () => null, deleteUser })).rejects.toThrow();
  expect(deleteUser).not.toHaveBeenCalled();
});
test('wrong passwords never delete accounts', async () => {
  const deleteUser = vi.fn();
  await expect(deleteVerifiedAccount('owner', 'wrong', { getUser: async () => ({ id:'owner',email:'owner@example.com' }), verifyPassword: async () => null, deleteUser })).rejects.toThrow('Your password is incorrect.');
  expect(deleteUser).not.toHaveBeenCalled();
});
test('confirmed password deletes exactly the verified account', async () => {
  const deleteUser = vi.fn();
  await expect(deleteVerifiedAccount('owner', 'password', { getUser: async () => ({ id:'owner',email:'owner@example.com' }), verifyPassword: async () => 'owner', deleteUser })).resolves.toEqual({ deleted:true });
  expect(deleteUser).toHaveBeenCalledExactlyOnceWith('owner');
});
test('deletion requires confirmation and cannot accept a target account', () => {
  expect(deleteAccountSchema.safeParse({password:'password',confirmation:'DELETE'}).success).toBe(true);
  expect(deleteAccountSchema.safeParse({password:'password'}).success).toBe(false);
  expect(deleteAccountSchema.safeParse({password:'password',confirmation:'DELETE',userId:'other'}).success).toBe(false);
});