# Mathematical Correctness Check Command

Verify the mathematical correctness and numerical stability of implementations.

## Usage
`/math-check [file_path]` - Check a specific file
`/math-check [module_name]` - Check an entire module
`/math-check [function_name]` - Deep-dive into a specific function

## Task

1. Read the agent prompt from `.claude/agents/math-correctness.md`
2. Identify the implementation to verify:
   - If a file path is provided, analyze that file
   - If a module name is provided, analyze `src/[module]/`
   - If a function name is provided, find and focus on that function
3. Verify mathematical correctness:
   - Compare implementation against standard mathematical definitions
   - Check known values (e.g., sin(π/2) = 1, e^0 = 1)
   - Verify mathematical identities are satisfied
   - Check inverse function relationships
4. Analyze numerical stability:
   - Look for catastrophic cancellation
   - Check overflow/underflow handling
   - Verify precision for edge cases
   - Check condition number sensitivity
5. Verify edge case handling:
   - Zero and near-zero values
   - Infinity and NaN
   - Negative inputs where applicable
   - Boundary conditions
6. Identify issues with:
   - Severity rating
   - Mathematical explanation
   - Correct formula
   - Code fix
7. Suggest verification tests

## Arguments
$ARGUMENTS

Focus on ensuring mathematical accuracy and numerical robustness. Flag any implementation that deviates from mathematical definitions.
