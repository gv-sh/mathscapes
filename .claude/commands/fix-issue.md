# Fix Issue Command

Guide the resolution of a bug or issue with proper investigation, fix, and verification.

## Usage
`/fix-issue [issue_description]` - Investigate and fix an issue
`/fix-issue #[issue_number]` - Fix a GitHub issue by number

## Task

This command guides the complete resolution of a bug or issue:

### Phase 1: Investigation
1. Understand the issue from the description
2. If a GitHub issue number is provided, fetch issue details
3. Reproduce the issue (identify failing test or create one)
4. Trace the root cause through the codebase
5. Identify affected files and functions

### Phase 2: Analysis
1. Determine the type of issue:
   - **Mathematical error**: Incorrect formula or algorithm
   - **Numerical instability**: Precision or overflow issues
   - **Edge case**: Missing handling for special inputs
   - **Type error**: TypeScript type issues
   - **Logic bug**: Incorrect control flow
2. Assess impact on other parts of the codebase
3. Consider related edge cases that might have similar issues

### Phase 3: Fix Implementation
1. Implement the fix following library conventions
2. Ensure the fix doesn't introduce regressions
3. Handle any related edge cases discovered
4. Maintain backward compatibility if possible

### Phase 4: Testing
1. Add a test that reproduces the original issue
2. Verify the test now passes
3. Add tests for related edge cases
4. Run full test suite to check for regressions

### Phase 5: Documentation
1. Update documentation if behavior changed
2. Add comments explaining the fix if non-obvious
3. Note any breaking changes

## Fix Verification Checklist

- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Test added for original issue
- [ ] Related edge cases tested
- [ ] No regressions introduced
- [ ] Documentation updated if needed
- [ ] Commit message explains the fix

## Output Format

```markdown
# Issue Fix Report

## Issue Summary
[What was reported/observed]

## Root Cause
[Technical explanation of why it happened]

## Solution
[What was changed and why]

## Files Modified
- file1.ts: [change description]
- file2.ts: [change description]

## Tests Added
- test description 1
- test description 2

## Verification
- [x] Original issue resolved
- [x] No regressions
- [x] Tests pass
```

## Arguments
$ARGUMENTS

This command ensures issues are properly investigated and fixed with appropriate test coverage.
