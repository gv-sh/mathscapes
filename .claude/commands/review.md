# Code Review Command

Review the specified file or module for code quality, TypeScript best practices, and mathematical implementation correctness.

## Usage
`/review [file_path]` - Review a specific file
`/review [module_name]` - Review an entire module (e.g., `core`, `symbolic`, `numeric`)

## Task

1. Read the agent prompt from `.claude/agents/code-reviewer.md`
2. Read the specified file(s):
   - If a file path is provided, read that specific file
   - If a module name is provided, find all source files in `src/[module]/`
3. Analyze the code against the review checklist:
   - Type safety
   - Code quality
   - Mathematical correctness indicators
   - Documentation
   - Testing compatibility
4. Provide structured feedback with:
   - Summary
   - Critical issues (must fix)
   - Suggestions (nice to have)
   - Positive observations
   - Specific code improvement examples

## Arguments
$ARGUMENTS

Focus on actionable feedback that will improve the code quality and mathematical correctness of the Mathscapes library.
