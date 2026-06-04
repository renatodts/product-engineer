// TODO: Replace with real test factories/matchers as projects require them.
export const PACKAGE_NAME = '@product-engineer/shared-testing';

let seq = 0;
export function makeId(prefix = 'id'): string {
  seq += 1;
  return `${prefix}-${seq}`;
}
