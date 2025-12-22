# Polish Module Command

Run a comprehensive quality check on a module, including code review, documentation, tests, and API consistency.

## Usage
`/polish [module_name]` - Run all quality checks on a module
`/polish [file_path]` - Run all quality checks on a specific file

## Task

This is a comprehensive polishing workflow that runs multiple quality checks:

1. **Code Review** (from `.claude/agents/code-reviewer.md`)
   - TypeScript best practices
   - Code quality assessment
   - Mathematical implementation review

2. **Documentation Check** (from `.claude/agents/documentation.md`)
   - JSDoc completeness
   - Example quality
   - Mathematical notation

3. **Test Coverage** (from `.claude/agents/test-coverage.md`)
   - Coverage gaps
   - Missing edge cases
   - Property tests

4. **Mathematical Correctness** (from `.claude/agents/math-correctness.md`)
   - Formula accuracy
   - Numerical stability
   - Edge case handling

5. **API Consistency** (from `.claude/agents/api-consistency.md`)
   - Naming conventions
   - Parameter ordering
   - Return type patterns

## Workflow

1. Identify all source files in the target module/file
2. Run each analysis in sequence
3. Collect all findings
4. Prioritize issues:
   - **Critical**: Mathematical errors, type safety issues
   - **High**: Missing tests for edge cases, documentation gaps
   - **Medium**: API inconsistencies, performance concerns
   - **Low**: Style suggestions, minor improvements
5. Generate a comprehensive report
6. Provide actionable fixes with code examples

## Output Format

```markdown
# Polish Report: [Module/File]

## Summary
- Critical Issues: X
- High Priority: Y
- Medium Priority: Z
- Low Priority: W

## Critical Issues
[Must be fixed before release]

## High Priority
[Should be fixed soon]

## Medium Priority
[Good to fix when time allows]

## Low Priority
[Nice to have improvements]

## Recommended Actions
1. [Specific action with code]
2. [Next action]
...
```

## Arguments
$ARGUMENTS

This command provides a holistic view of module quality and prioritized improvement recommendations.
