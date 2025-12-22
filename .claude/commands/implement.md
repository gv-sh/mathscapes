# Implement Feature Command

Guide the implementation of a new mathematical feature with proper structure, tests, and documentation.

## Usage
`/implement [feature_description]` - Implement a new feature following Mathscapes conventions

## Task

This command guides the complete implementation of a new feature:

### Phase 1: Planning
1. Understand the feature requirements from the description
2. Identify which module(s) the feature belongs to
3. Research existing patterns in similar modules
4. Design the API following `.claude/agents/api-consistency.md` conventions
5. Identify mathematical foundations and edge cases

### Phase 2: Implementation
1. Create/modify source files in appropriate `src/[module]/` directory
2. Follow TypeScript best practices
3. Implement core functionality
4. Handle edge cases (zero, infinity, NaN, negatives)
5. Ensure numerical stability
6. Add proper error handling

### Phase 3: Testing
1. Create test file in `tests/[module]/`
2. Write unit tests following `.claude/agents/test-coverage.md`
3. Add edge case tests
4. Add mathematical property tests
5. Verify coverage meets 95% target

### Phase 4: Documentation
1. Add JSDoc comments following `.claude/agents/documentation.md`
2. Include @param, @returns, @throws, @example
3. Add mathematical notation where appropriate
4. Update module exports in `src/[module]/index.ts`
5. Update main exports in `src/index.ts` if needed

### Phase 5: Verification
1. Run tests: `npm test`
2. Check types: `npm run build`
3. Verify documentation: `npm run docs`
4. Run mathematical correctness checks

## Implementation Checklist

- [ ] API design follows library conventions
- [ ] TypeScript types are correct and complete
- [ ] Edge cases are handled
- [ ] Numerical stability is considered
- [ ] Tests cover core functionality
- [ ] Tests cover edge cases
- [ ] Tests verify mathematical properties
- [ ] JSDoc documentation is complete
- [ ] Examples are provided
- [ ] Module exports are updated

## Arguments
$ARGUMENTS

This command ensures new features meet the quality standards of the Mathscapes library.
