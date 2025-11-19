/**
 * Mathematical Set class with comprehensive set operations
 * Provides exact mathematical set operations for finite sets
 */
export class MathSet<T = any> {
  private elements: Set<T>;

  /**
   * Creates a new MathSet
   * @param elements - Initial elements (optional)
   */
  constructor(elements?: Iterable<T>) {
    this.elements = new Set(elements);
  }

  /**
   * Creates a MathSet from an array
   * @param array - Array of elements
   */
  static fromArray<T>(array: T[]): MathSet<T> {
    return new MathSet(array);
  }

  /**
   * Creates an empty set
   */
  static empty<T>(): MathSet<T> {
    return new MathSet<T>();
  }

  /**
   * Gets the cardinality (size) of the set
   */
  get cardinality(): number {
    return this.elements.size;
  }

  /**
   * Alias for cardinality
   */
  get size(): number {
    return this.elements.size;
  }

  /**
   * Checks if the set is empty
   */
  isEmpty(): boolean {
    return this.elements.size === 0;
  }

  /**
   * Adds an element to the set
   * @param element - The element to add
   */
  add(element: T): MathSet<T> {
    const newSet = this.clone();
    newSet.elements.add(element);
    return newSet;
  }

  /**
   * Removes an element from the set
   * @param element - The element to remove
   */
  remove(element: T): MathSet<T> {
    const newSet = this.clone();
    newSet.elements.delete(element);
    return newSet;
  }

  /**
   * Checks if an element is in the set
   * @param element - The element to check
   */
  has(element: T): boolean {
    return this.elements.has(element);
  }

  /**
   * Alias for has()
   * @param element - The element to check
   */
  contains(element: T): boolean {
    return this.elements.has(element);
  }

  /**
   * Computes the union of this set with another set
   * A ∪ B = {x : x ∈ A or x ∈ B}
   * @param other - The other set
   */
  union(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>();
    for (const element of this.elements) {
      result.elements.add(element);
    }
    for (const element of other.elements) {
      result.elements.add(element);
    }
    return result;
  }

  /**
   * Computes the intersection of this set with another set
   * A ∩ B = {x : x ∈ A and x ∈ B}
   * @param other - The other set
   */
  intersection(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>();
    for (const element of this.elements) {
      if (other.elements.has(element)) {
        result.elements.add(element);
      }
    }
    return result;
  }

  /**
   * Computes the difference of this set with another set
   * A \ B = {x : x ∈ A and x ∉ B}
   * @param other - The other set
   */
  difference(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>();
    for (const element of this.elements) {
      if (!other.elements.has(element)) {
        result.elements.add(element);
      }
    }
    return result;
  }

  /**
   * Computes the symmetric difference of this set with another set
   * A △ B = (A \ B) ∪ (B \ A) = {x : x ∈ A ⊕ x ∈ B}
   * @param other - The other set
   */
  symmetricDifference(other: MathSet<T>): MathSet<T> {
    const result = new MathSet<T>();

    // Add elements in this but not in other
    for (const element of this.elements) {
      if (!other.elements.has(element)) {
        result.elements.add(element);
      }
    }

    // Add elements in other but not in this
    for (const element of other.elements) {
      if (!this.elements.has(element)) {
        result.elements.add(element);
      }
    }

    return result;
  }

  /**
   * Checks if this set is a subset of another set
   * A ⊆ B ⟺ ∀x(x ∈ A → x ∈ B)
   * @param other - The potential superset
   */
  isSubsetOf(other: MathSet<T>): boolean {
    for (const element of this.elements) {
      if (!other.elements.has(element)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if this set is a proper subset of another set
   * A ⊂ B ⟺ (A ⊆ B) ∧ (A ≠ B)
   * @param other - The potential superset
   */
  isProperSubsetOf(other: MathSet<T>): boolean {
    return this.isSubsetOf(other) && this.cardinality < other.cardinality;
  }

  /**
   * Checks if this set is a superset of another set
   * A ⊇ B ⟺ ∀x(x ∈ B → x ∈ A)
   * @param other - The potential subset
   */
  isSupersetOf(other: MathSet<T>): boolean {
    return other.isSubsetOf(this);
  }

  /**
   * Checks if this set is a proper superset of another set
   * A ⊃ B ⟺ (A ⊇ B) ∧ (A ≠ B)
   * @param other - The potential subset
   */
  isProperSupersetOf(other: MathSet<T>): boolean {
    return other.isProperSubsetOf(this);
  }

  /**
   * Checks if two sets are equal
   * A = B ⟺ (A ⊆ B) ∧ (B ⊆ A)
   * @param other - The other set
   */
  equals(other: MathSet<T>): boolean {
    if (this.cardinality !== other.cardinality) {
      return false;
    }
    return this.isSubsetOf(other);
  }

  /**
   * Checks if two sets are disjoint (have no elements in common)
   * A ∩ B = ∅
   * @param other - The other set
   */
  isDisjointFrom(other: MathSet<T>): boolean {
    for (const element of this.elements) {
      if (other.elements.has(element)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Computes the power set (set of all subsets)
   * 𝒫(A) = {S : S ⊆ A}
   * Note: Power set size is 2^n where n is the cardinality
   */
  powerSet(): MathSet<MathSet<T>> {
    const elements = Array.from(this.elements);
    const result = new MathSet<MathSet<T>>();
    const n = elements.length;
    const powerSetSize = Math.pow(2, n);

    // Generate all 2^n subsets using binary representation
    for (let i = 0; i < powerSetSize; i++) {
      const subset = new MathSet<T>();
      for (let j = 0; j < n; j++) {
        // Check if jth bit is set in i
        if ((i & (1 << j)) !== 0) {
          subset.elements.add(elements[j]);
        }
      }
      result.elements.add(subset);
    }

    return result;
  }

  /**
   * Computes the Cartesian product with another set
   * A × B = {(a, b) : a ∈ A, b ∈ B}
   * @param other - The other set
   */
  cartesianProduct<U>(other: MathSet<U>): MathSet<[T, U]> {
    const result = new MathSet<[T, U]>();
    for (const a of this.elements) {
      for (const b of other.elements) {
        result.elements.add([a, b]);
      }
    }
    return result;
  }

  /**
   * Applies a function to each element and returns a new set
   * @param fn - The mapping function
   */
  map<U>(fn: (element: T) => U): MathSet<U> {
    const result = new MathSet<U>();
    for (const element of this.elements) {
      result.elements.add(fn(element));
    }
    return result;
  }

  /**
   * Filters elements based on a predicate
   * @param predicate - The filtering function
   */
  filter(predicate: (element: T) => boolean): MathSet<T> {
    const result = new MathSet<T>();
    for (const element of this.elements) {
      if (predicate(element)) {
        result.elements.add(element);
      }
    }
    return result;
  }

  /**
   * Reduces the set to a single value
   * @param fn - The reducing function
   * @param initial - The initial value
   */
  reduce<U>(fn: (accumulator: U, element: T) => U, initial: U): U {
    let accumulator = initial;
    for (const element of this.elements) {
      accumulator = fn(accumulator, element);
    }
    return accumulator;
  }

  /**
   * Checks if any element satisfies a predicate
   * @param predicate - The testing function
   */
  some(predicate: (element: T) => boolean): boolean {
    for (const element of this.elements) {
      if (predicate(element)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if all elements satisfy a predicate
   * @param predicate - The testing function
   */
  every(predicate: (element: T) => boolean): boolean {
    for (const element of this.elements) {
      if (!predicate(element)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Finds an element that satisfies a predicate
   * @param predicate - The testing function
   */
  find(predicate: (element: T) => boolean): T | undefined {
    for (const element of this.elements) {
      if (predicate(element)) {
        return element;
      }
    }
    return undefined;
  }

  /**
   * Executes a function for each element
   * @param fn - The function to execute
   */
  forEach(fn: (element: T, index: number) => void): void {
    let index = 0;
    for (const element of this.elements) {
      fn(element, index++);
    }
  }

  /**
   * Converts the set to an array
   */
  toArray(): T[] {
    return Array.from(this.elements);
  }

  /**
   * Creates a shallow copy of this set
   */
  clone(): MathSet<T> {
    return new MathSet(this.elements);
  }

  /**
   * Returns an iterator for the set elements
   */
  [Symbol.iterator](): Iterator<T> {
    return this.elements[Symbol.iterator]();
  }

  /**
   * Returns a string representation of the set
   */
  toString(): string {
    const elements = Array.from(this.elements).map(e => {
      if (e instanceof MathSet) {
        return e.toString();
      }
      return JSON.stringify(e);
    }).join(', ');
    return `{${elements}}`;
  }

  /**
   * Computes the union of multiple sets
   * @param sets - Array of sets to union
   */
  static union<T>(...sets: MathSet<T>[]): MathSet<T> {
    if (sets.length === 0) {
      return new MathSet<T>();
    }
    return sets.reduce((acc, set) => acc.union(set));
  }

  /**
   * Computes the intersection of multiple sets
   * @param sets - Array of sets to intersect
   */
  static intersection<T>(...sets: MathSet<T>[]): MathSet<T> {
    if (sets.length === 0) {
      return new MathSet<T>();
    }
    return sets.reduce((acc, set) => acc.intersection(set));
  }

  /**
   * Creates a set from a range of numbers
   * @param start - Start of range (inclusive)
   * @param end - End of range (exclusive)
   * @param step - Step size (default: 1)
   */
  static range(start: number, end: number, step: number = 1): MathSet<number> {
    const elements: number[] = [];
    for (let i = start; i < end; i += step) {
      elements.push(i);
    }
    return new MathSet(elements);
  }
}
