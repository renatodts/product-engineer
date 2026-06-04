// TODO: Replace with real domain primitives as DDD projects require them.
export const PACKAGE_NAME = '@product-engineer/shared-domain';

export abstract class ValueObject<T> {
  protected constructor(protected readonly props: T) {}
  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}

export abstract class Entity<T> {
  protected constructor(
    public readonly id: string,
    protected readonly props: T,
  ) {}
  equals(other: Entity<T>): boolean {
    return this.id === other.id;
  }
}
