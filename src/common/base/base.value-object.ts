/**
 * Value objects are immutable and compared by structural equality, not identity.
 *
 * Why: Domain concepts like Priority, Status, or Email are not "things" —
 * they are values. Two Priority.HIGH values are the same regardless of which
 * object instance holds them. This distinction prevents subtle bugs where
 * reference equality masks semantic equality failures.
 */
export abstract class BaseValueObject<T extends object> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze({ ...props });
  }

  equals(other: BaseValueObject<T>): boolean {
    if (other === null || other === undefined) return false;
    if (other.constructor !== this.constructor) return false;
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
