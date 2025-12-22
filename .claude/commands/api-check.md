# API Consistency Check Command

Analyze the public API for consistency with library conventions and best practices.

## Usage
`/api-check [module_name]` - Check API consistency for a module
`/api-check [file_path]` - Check API consistency for a specific file
`/api-check all` - Check entire library for API consistency

## Task

1. Read the agent prompt from `.claude/agents/api-consistency.md`
2. Identify the scope:
   - If a module name is provided, analyze `src/[module]/`
   - If a file path is provided, analyze that file
   - If `all`, analyze the entire `src/` directory
3. Extract public API:
   - Exported functions and their signatures
   - Exported classes and their public methods
   - Exported types and interfaces
4. Check naming conventions:
   - Factory methods (from*, create*)
   - Conversion methods (to*)
   - Predicates (is*)
   - Arithmetic operations (add, subtract, multiply, divide)
5. Check parameter ordering:
   - Primary value first
   - Options object last
   - Consistent order across similar functions
6. Check return types:
   - Consistent patterns for similar operations
   - Proper handling of optional returns
   - Immutability (new instances returned)
7. Check error handling:
   - Appropriate error types
   - Descriptive messages
   - Consistent validation patterns
8. Compare against existing patterns in the codebase
9. Generate report with:
   - Inconsistencies found
   - Specific recommendations
   - Code examples for fixes
   - Breaking change warnings

## Arguments
$ARGUMENTS

Focus on developer experience and API usability. Consistent APIs are easier to learn and use correctly.
