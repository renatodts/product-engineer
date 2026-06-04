// TODO: Replace with real shared domain types as projects require them.
export const PACKAGE_NAME = '@product-engineer/shared-types';

export type Id = string;

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}
