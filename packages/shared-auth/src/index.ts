// TODO: Replace with real auth helpers (JWT verify/sign) as projects require them.
export const PACKAGE_NAME = '@product-engineer/shared-auth';

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
}

export function hasRole(user: AuthUser, role: string): boolean {
  return user.roles.includes(role);
}
