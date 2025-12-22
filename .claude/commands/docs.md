# Documentation Command

Generate or improve documentation for the specified file, module, or function.

## Usage
`/docs [file_path]` - Document a specific file
`/docs [module_name]` - Document an entire module
`/docs [function_name]` - Document a specific function

## Task

1. Read the agent prompt from `.claude/agents/documentation.md`
2. Identify what needs documentation:
   - If a file path is provided, analyze that file
   - If a module name is provided, analyze `src/[module]/`
   - If a function name is provided, search for it in the codebase
3. Analyze existing documentation:
   - Check for JSDoc comments
   - Verify @param, @returns, @throws, @example tags
   - Check for mathematical notation
4. Generate missing documentation:
   - Complete JSDoc blocks following TypeDoc standards
   - Use proper mathematical notation (Unicode symbols)
   - Include practical code examples
   - Add cross-references (@see, @link)
   - Document algorithm complexity where relevant
5. Output ready-to-add documentation blocks
6. Suggest examples for the `examples/` directory if appropriate

## Arguments
$ARGUMENTS

Focus on creating documentation that serves both beginners learning the concepts and advanced users needing API reference.
