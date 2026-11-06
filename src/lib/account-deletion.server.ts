type VerifiedUser = { id: string; email?: string };
type DeletionDependencies = {
  getUser: () => Promise<VerifiedUser | null>;
  verifyPassword: (email: string, password: string) => Promise<string | null>;
  deleteUser: (id: string) => Promise<void>;
};

export async function deleteVerifiedAccount(userId: string, password: string, dependencies: DeletionDependencies) {
  const user = await dependencies.getUser();
  if (!user?.email || user.id !== userId) throw new Error('Please log in again before deleting your account.');
  const verifiedId = await dependencies.verifyPassword(user.email, password);
  if (verifiedId !== userId) throw new Error('Your password is incorrect.');
  await dependencies.deleteUser(userId);
  return { deleted: true };
}