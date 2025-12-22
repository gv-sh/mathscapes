# Test Coverage Analysis Command

Analyze test coverage for the specified file or module and generate comprehensive test cases.

## Usage
`/test-coverage [file_path]` - Analyze coverage for a specific source file
`/test-coverage [module_name]` - Analyze coverage for an entire module

## Task

1. Read the agent prompt from `.claude/agents/test-coverage.md`
2. Identify the source file(s) to analyze:
   - If a file path is provided, analyze that file
   - If a module name is provided, analyze `src/[module]/`
3. Find the corresponding test file(s) in `tests/`
4. Run coverage analysis if needed: `npm run test:coverage`
5. Identify gaps in test coverage:
   - Untested functions
   - Missing edge cases
   - Uncovered branches
   - Missing mathematical property tests
6. Generate comprehensive test code:
   - Unit tests for untested functions
   - Edge case tests (zero, infinity, NaN, negatives)
   - Property-based tests (mathematical identities)
   - Integration tests where appropriate
7. Output ready-to-use test code that can be added to the test suite

## Arguments
$ARGUMENTS

Focus on generating high-quality tests that verify mathematical correctness and handle edge cases properly.
