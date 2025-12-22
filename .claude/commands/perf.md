# Performance Analysis Command

Analyze performance characteristics and suggest optimizations for the specified code.

## Usage
`/perf [file_path]` - Analyze performance of a specific file
`/perf [module_name]` - Analyze performance of an entire module
`/perf [function_name]` - Deep-dive into a specific function's performance

## Task

1. Read the agent prompt from `.claude/agents/performance.md`
2. Identify the code to analyze:
   - If a file path is provided, analyze that file
   - If a module name is provided, analyze `src/[module]/`
   - If a function name is provided, find and focus on that function
3. Perform analysis:
   - Calculate time complexity (Big-O notation)
   - Calculate space complexity
   - Identify hot paths and bottlenecks
   - Check for JavaScript-specific performance issues
   - Look for memory allocation in loops
4. Suggest optimizations:
   - Algorithm improvements
   - JavaScript/V8 optimization techniques
   - Memory optimization strategies
   - Cache opportunities
5. Provide before/after code examples
6. Suggest benchmark tests to validate improvements
7. Check existing benchmarks in `benchmarks/` directory

## Arguments
$ARGUMENTS

Focus on practical optimizations that maintain code readability while improving performance for numerical computing tasks.
