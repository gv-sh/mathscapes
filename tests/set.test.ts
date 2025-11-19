import { MathSet } from '../src/core/set';

describe('MathSet', () => {
  describe('Construction', () => {
    test('creates empty set', () => {
      const set = new MathSet();
      expect(set.isEmpty()).toBe(true);
      expect(set.cardinality).toBe(0);
    });

    test('creates set from array', () => {
      const set = MathSet.fromArray([1, 2, 3]);
      expect(set.cardinality).toBe(3);
      expect(set.has(1)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(3)).toBe(true);
    });

    test('creates set from iterable', () => {
      const set = new MathSet([1, 2, 2, 3]); // duplicates removed
      expect(set.cardinality).toBe(3);
    });

    test('creates empty set with static method', () => {
      const set = MathSet.empty<number>();
      expect(set.isEmpty()).toBe(true);
    });
  });

  describe('Basic Operations', () => {
    test('adds element', () => {
      const set = new MathSet([1, 2]);
      const newSet = set.add(3);
      expect(newSet.has(3)).toBe(true);
      expect(newSet.cardinality).toBe(3);
      expect(set.cardinality).toBe(2); // original unchanged
    });

    test('removes element', () => {
      const set = new MathSet([1, 2, 3]);
      const newSet = set.remove(2);
      expect(newSet.has(2)).toBe(false);
      expect(newSet.cardinality).toBe(2);
    });

    test('checks if element is in set', () => {
      const set = new MathSet([1, 2, 3]);
      expect(set.has(2)).toBe(true);
      expect(set.has(4)).toBe(false);
    });

    test('contains is alias for has', () => {
      const set = new MathSet([1, 2, 3]);
      expect(set.contains(2)).toBe(true);
      expect(set.contains(4)).toBe(false);
    });
  });

  describe('Set Operations', () => {
    test('computes union', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([3, 4, 5]);
      const result = a.union(b);
      expect(result.cardinality).toBe(5);
      expect(result.has(1)).toBe(true);
      expect(result.has(5)).toBe(true);
    });

    test('computes intersection', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([2, 3, 4]);
      const result = a.intersection(b);
      expect(result.cardinality).toBe(2);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
      expect(result.has(1)).toBe(false);
    });

    test('computes difference', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([2, 3, 4]);
      const result = a.difference(b);
      expect(result.cardinality).toBe(1);
      expect(result.has(1)).toBe(true);
      expect(result.has(2)).toBe(false);
    });

    test('computes symmetric difference', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([2, 3, 4]);
      const result = a.symmetricDifference(b);
      expect(result.cardinality).toBe(2);
      expect(result.has(1)).toBe(true);
      expect(result.has(4)).toBe(true);
      expect(result.has(2)).toBe(false);
      expect(result.has(3)).toBe(false);
    });

    test('union with empty set', () => {
      const a = new MathSet([1, 2, 3]);
      const b = MathSet.empty<number>();
      const result = a.union(b);
      expect(result.cardinality).toBe(3);
    });

    test('intersection with empty set', () => {
      const a = new MathSet([1, 2, 3]);
      const b = MathSet.empty<number>();
      const result = a.intersection(b);
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe('Subset and Superset', () => {
    test('checks if subset', () => {
      const a = new MathSet([1, 2]);
      const b = new MathSet([1, 2, 3]);
      expect(a.isSubsetOf(b)).toBe(true);
      expect(b.isSubsetOf(a)).toBe(false);
    });

    test('set is subset of itself', () => {
      const a = new MathSet([1, 2, 3]);
      expect(a.isSubsetOf(a)).toBe(true);
    });

    test('checks if proper subset', () => {
      const a = new MathSet([1, 2]);
      const b = new MathSet([1, 2, 3]);
      const c = new MathSet([1, 2]);
      expect(a.isProperSubsetOf(b)).toBe(true);
      expect(a.isProperSubsetOf(c)).toBe(false); // not proper
    });

    test('checks if superset', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([1, 2]);
      expect(a.isSupersetOf(b)).toBe(true);
      expect(b.isSupersetOf(a)).toBe(false);
    });

    test('checks if proper superset', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([1, 2]);
      const c = new MathSet([1, 2, 3]);
      expect(a.isProperSupersetOf(b)).toBe(true);
      expect(a.isProperSupersetOf(c)).toBe(false);
    });

    test('empty set is subset of any set', () => {
      const a = MathSet.empty<number>();
      const b = new MathSet([1, 2, 3]);
      expect(a.isSubsetOf(b)).toBe(true);
    });
  });

  describe('Equality and Disjoint', () => {
    test('checks if sets are equal', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([3, 2, 1]); // order doesn't matter
      const c = new MathSet([1, 2]);
      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    test('checks if sets are disjoint', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([4, 5, 6]);
      const c = new MathSet([3, 4, 5]);
      expect(a.isDisjointFrom(b)).toBe(true);
      expect(a.isDisjointFrom(c)).toBe(false);
    });

    test('empty sets are disjoint', () => {
      const a = MathSet.empty<number>();
      const b = MathSet.empty<number>();
      expect(a.isDisjointFrom(b)).toBe(true);
    });
  });

  describe('Power Set', () => {
    test('computes power set of empty set', () => {
      const set = MathSet.empty<number>();
      const powerSet = set.powerSet();
      expect(powerSet.cardinality).toBe(1); // only empty set
    });

    test('computes power set of single element', () => {
      const set = new MathSet([1]);
      const powerSet = set.powerSet();
      expect(powerSet.cardinality).toBe(2); // {}, {1}
    });

    test('computes power set of two elements', () => {
      const set = new MathSet([1, 2]);
      const powerSet = set.powerSet();
      expect(powerSet.cardinality).toBe(4); // {}, {1}, {2}, {1,2}
    });

    test('computes power set of three elements', () => {
      const set = new MathSet([1, 2, 3]);
      const powerSet = set.powerSet();
      expect(powerSet.cardinality).toBe(8); // 2^3
    });

    test('power set contains empty set', () => {
      const set = new MathSet([1, 2]);
      const powerSet = set.powerSet();
      const hasEmptySet = powerSet.some(subset => subset.isEmpty());
      expect(hasEmptySet).toBe(true);
    });

    test('power set contains original set', () => {
      const set = new MathSet([1, 2]);
      const powerSet = set.powerSet();
      const hasOriginal = powerSet.some(subset => subset.equals(set));
      expect(hasOriginal).toBe(true);
    });
  });

  describe('Cartesian Product', () => {
    test('computes cartesian product', () => {
      const a = new MathSet([1, 2]);
      const b = new MathSet(['a', 'b']);
      const product = a.cartesianProduct(b);
      expect(product.cardinality).toBe(4);

      // Convert to array and check contents
      const productArray = product.toArray();
      const hasPair = (arr: [number, string][], pair: [number, string]) =>
        arr.some(p => p[0] === pair[0] && p[1] === pair[1]);

      expect(hasPair(productArray, [1, 'a'])).toBe(true);
      expect(hasPair(productArray, [1, 'b'])).toBe(true);
      expect(hasPair(productArray, [2, 'a'])).toBe(true);
      expect(hasPair(productArray, [2, 'b'])).toBe(true);
    });

    test('cartesian product with empty set is empty', () => {
      const a = new MathSet([1, 2]);
      const b = MathSet.empty<string>();
      const product = a.cartesianProduct(b);
      expect(product.isEmpty()).toBe(true);
    });

    test('cartesian product of single elements', () => {
      const a = new MathSet([1]);
      const b = new MathSet(['x']);
      const product = a.cartesianProduct(b);
      expect(product.cardinality).toBe(1);

      const productArray = product.toArray();
      expect(productArray[0][0]).toBe(1);
      expect(productArray[0][1]).toBe('x');
    });
  });

  describe('Functional Methods', () => {
    test('maps elements', () => {
      const set = new MathSet([1, 2, 3]);
      const mapped = set.map(x => x * 2);
      expect(mapped.has(2)).toBe(true);
      expect(mapped.has(4)).toBe(true);
      expect(mapped.has(6)).toBe(true);
    });

    test('filters elements', () => {
      const set = new MathSet([1, 2, 3, 4, 5]);
      const filtered = set.filter(x => x % 2 === 0);
      expect(filtered.cardinality).toBe(2);
      expect(filtered.has(2)).toBe(true);
      expect(filtered.has(4)).toBe(true);
    });

    test('reduces to a value', () => {
      const set = new MathSet([1, 2, 3, 4]);
      const sum = set.reduce((acc, x) => acc + x, 0);
      expect(sum).toBe(10);
    });

    test('some returns true if any element matches', () => {
      const set = new MathSet([1, 2, 3]);
      expect(set.some(x => x > 2)).toBe(true);
      expect(set.some(x => x > 5)).toBe(false);
    });

    test('every returns true if all elements match', () => {
      const set = new MathSet([2, 4, 6]);
      expect(set.every(x => x % 2 === 0)).toBe(true);
      expect(set.every(x => x > 3)).toBe(false);
    });

    test('finds element matching predicate', () => {
      const set = new MathSet([1, 2, 3, 4]);
      expect(set.find(x => x > 2)).toBeDefined();
      expect(set.find(x => x > 10)).toBeUndefined();
    });
  });

  describe('Utility Methods', () => {
    test('converts to array', () => {
      const set = new MathSet([1, 2, 3]);
      const arr = set.toArray();
      expect(arr.length).toBe(3);
      expect(arr).toContain(1);
      expect(arr).toContain(2);
      expect(arr).toContain(3);
    });

    test('clones set', () => {
      const set = new MathSet([1, 2, 3]);
      const clone = set.clone();
      expect(clone.equals(set)).toBe(true);
      const modified = clone.add(4);
      expect(set.has(4)).toBe(false);
    });

    test('toString returns string representation', () => {
      const set = new MathSet([1, 2, 3]);
      const str = set.toString();
      expect(str).toContain('1');
      expect(str).toContain('2');
      expect(str).toContain('3');
    });

    test('iterates over elements', () => {
      const set = new MathSet([1, 2, 3]);
      const elements: number[] = [];
      for (const elem of set) {
        elements.push(elem);
      }
      expect(elements.length).toBe(3);
    });

    test('forEach executes function for each element', () => {
      const set = new MathSet([1, 2, 3]);
      const elements: number[] = [];
      set.forEach(elem => elements.push(elem));
      expect(elements.length).toBe(3);
    });
  });

  describe('Static Methods', () => {
    test('computes union of multiple sets', () => {
      const a = new MathSet([1, 2]);
      const b = new MathSet([2, 3]);
      const c = new MathSet([3, 4]);
      const result = MathSet.union(a, b, c);
      expect(result.cardinality).toBe(4);
      expect(result.has(1)).toBe(true);
      expect(result.has(4)).toBe(true);
    });

    test('computes intersection of multiple sets', () => {
      const a = new MathSet([1, 2, 3]);
      const b = new MathSet([2, 3, 4]);
      const c = new MathSet([2, 3, 5]);
      const result = MathSet.intersection(a, b, c);
      expect(result.cardinality).toBe(2);
      expect(result.has(2)).toBe(true);
      expect(result.has(3)).toBe(true);
    });

    test('creates set from range', () => {
      const set = MathSet.range(1, 5);
      expect(set.cardinality).toBe(4);
      expect(set.has(1)).toBe(true);
      expect(set.has(4)).toBe(true);
      expect(set.has(5)).toBe(false);
    });

    test('creates set from range with step', () => {
      const set = MathSet.range(0, 10, 2);
      expect(set.cardinality).toBe(5);
      expect(set.has(0)).toBe(true);
      expect(set.has(2)).toBe(true);
      expect(set.has(8)).toBe(true);
      expect(set.has(1)).toBe(false);
    });
  });
});
