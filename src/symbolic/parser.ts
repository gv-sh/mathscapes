/**
 * Expression Parser
 *
 * Parses mathematical expression strings into Abstract Syntax Trees (AST).
 * Supports standard mathematical notation with proper operator precedence.
 *
 * Grammar:
 * - Expression: Term (('+' | '-') Term)*
 * - Term: Factor (('*' | '/') Factor)*
 * - Factor: Base ('^' Base)*
 * - Base: Number | Variable | Function | '(' Expression ')' | '-' Base
 */

import {
    Expression,
    Constant,
    Variable,
    Add,
    Subtract,
    Multiply,
    Divide,
    Power,
    Negate
} from './expression';

import {
    Sin,
    Cos,
    Tan,
    Asin,
    Acos,
    Atan,
    Exp,
    Ln,
    Log,
    Sqrt,
    Abs
} from './functions';

/**
 * Token types for lexical analysis
 */
enum TokenType {
    NUMBER,
    VARIABLE,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    POWER,
    LPAREN,
    RPAREN,
    FUNCTION,
    EOF
}

/**
 * Token representation
 */
interface Token {
    type: TokenType;
    value: string | number;
}

/**
 * Lexical analyzer (tokenizer)
 */
class Lexer {
    private pos = 0;
    private current: string | null = null;

    constructor(private text: string) {
        this.text = text.replace(/\s+/g, ''); // Remove whitespace
        this.current = this.text.length > 0 ? this.text[0] : null;
    }

    private advance(): void {
        this.pos++;
        this.current = this.pos < this.text.length ? this.text[this.pos] : null;
    }

    private peek(): string | null {
        const peekPos = this.pos + 1;
        return peekPos < this.text.length ? this.text[peekPos] : null;
    }

    private isDigit(char: string | null): boolean {
        return char !== null && /[0-9]/.test(char);
    }

    private isAlpha(char: string | null): boolean {
        return char !== null && /[a-zA-Z]/.test(char);
    }

    private readNumber(): number {
        let numStr = '';
        while (this.isDigit(this.current) || this.current === '.') {
            numStr += this.current;
            this.advance();
        }
        return parseFloat(numStr);
    }

    private readIdentifier(): string {
        let identifier = '';
        while (this.isAlpha(this.current) || this.isDigit(this.current)) {
            identifier += this.current;
            this.advance();
        }
        return identifier;
    }

    getNextToken(): Token {
        while (this.current !== null) {
            if (this.isDigit(this.current)) {
                return { type: TokenType.NUMBER, value: this.readNumber() };
            }

            if (this.isAlpha(this.current)) {
                const identifier = this.readIdentifier();
                const functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan',
                                   'exp', 'ln', 'log', 'sqrt', 'abs'];

                if (functions.includes(identifier.toLowerCase())) {
                    return { type: TokenType.FUNCTION, value: identifier.toLowerCase() };
                }

                return { type: TokenType.VARIABLE, value: identifier };
            }

            if (this.current === '+') {
                this.advance();
                return { type: TokenType.PLUS, value: '+' };
            }

            if (this.current === '-') {
                this.advance();
                return { type: TokenType.MINUS, value: '-' };
            }

            if (this.current === '*') {
                this.advance();
                return { type: TokenType.MULTIPLY, value: '*' };
            }

            if (this.current === '/') {
                this.advance();
                return { type: TokenType.DIVIDE, value: '/' };
            }

            if (this.current === '^') {
                this.advance();
                return { type: TokenType.POWER, value: '^' };
            }

            if (this.current === '(') {
                this.advance();
                return { type: TokenType.LPAREN, value: '(' };
            }

            if (this.current === ')') {
                this.advance();
                return { type: TokenType.RPAREN, value: ')' };
            }

            throw new Error(`Invalid character: ${this.current}`);
        }

        return { type: TokenType.EOF, value: '' };
    }
}

/**
 * Recursive descent parser
 */
class Parser {
    private currentToken: Token;

    constructor(private lexer: Lexer) {
        this.currentToken = this.lexer.getNextToken();
    }

    private eat(tokenType: TokenType): void {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.lexer.getNextToken();
        } else {
            throw new Error(`Expected token type ${TokenType[tokenType]}, got ${TokenType[this.currentToken.type]}`);
        }
    }

    /**
     * Parse expression: term (('+' | '-') term)*
     */
    private expression(): Expression {
        let node = this.term();

        while (this.currentToken.type === TokenType.PLUS ||
               this.currentToken.type === TokenType.MINUS) {
            const token = this.currentToken;

            if (token.type === TokenType.PLUS) {
                this.eat(TokenType.PLUS);
                const right = this.term();
                // Flatten addition
                if (node instanceof Add) {
                    node = new Add([...node.terms, right]);
                } else {
                    node = new Add([node, right]);
                }
            } else if (token.type === TokenType.MINUS) {
                this.eat(TokenType.MINUS);
                node = new Subtract(node, this.term());
            }
        }

        return node;
    }

    /**
     * Parse term: factor (('*' | '/') factor)*
     */
    private term(): Expression {
        let node = this.factor();

        while (this.currentToken.type === TokenType.MULTIPLY ||
               this.currentToken.type === TokenType.DIVIDE) {
            const token = this.currentToken;

            if (token.type === TokenType.MULTIPLY) {
                this.eat(TokenType.MULTIPLY);
                const right = this.factor();
                // Flatten multiplication
                if (node instanceof Multiply) {
                    node = new Multiply([...node.factors, right]);
                } else {
                    node = new Multiply([node, right]);
                }
            } else if (token.type === TokenType.DIVIDE) {
                this.eat(TokenType.DIVIDE);
                node = new Divide(node, this.factor());
            }
        }

        return node;
    }

    /**
     * Parse factor: base ('^' factor)*
     * Note: right-associative for power
     */
    private factor(): Expression {
        const node = this.base();

        if (this.currentToken.type === TokenType.POWER) {
            this.eat(TokenType.POWER);
            return new Power(node, this.factor()); // Right-associative
        }

        return node;
    }

    /**
     * Parse base: number | variable | function | '(' expression ')' | '-' base
     */
    private base(): Expression {
        const token = this.currentToken;

        if (token.type === TokenType.NUMBER) {
            this.eat(TokenType.NUMBER);
            return new Constant(token.value as number);
        }

        if (token.type === TokenType.VARIABLE) {
            this.eat(TokenType.VARIABLE);
            return new Variable(token.value as string);
        }

        if (token.type === TokenType.FUNCTION) {
            const funcName = token.value as string;
            this.eat(TokenType.FUNCTION);
            this.eat(TokenType.LPAREN);
            const arg = this.expression();
            this.eat(TokenType.RPAREN);

            switch (funcName) {
                case 'sin': return new Sin(arg);
                case 'cos': return new Cos(arg);
                case 'tan': return new Tan(arg);
                case 'asin': return new Asin(arg);
                case 'acos': return new Acos(arg);
                case 'atan': return new Atan(arg);
                case 'exp': return new Exp(arg);
                case 'ln': return new Ln(arg);
                case 'log': return new Log(arg);
                case 'sqrt': return new Sqrt(arg);
                case 'abs': return new Abs(arg);
                default:
                    throw new Error(`Unknown function: ${funcName}`);
            }
        }

        if (token.type === TokenType.LPAREN) {
            this.eat(TokenType.LPAREN);
            const node = this.expression();
            this.eat(TokenType.RPAREN);
            return node;
        }

        if (token.type === TokenType.MINUS) {
            this.eat(TokenType.MINUS);
            return new Negate(this.base());
        }

        throw new Error(`Unexpected token: ${TokenType[token.type]}`);
    }

    /**
     * Parse the entire expression
     */
    parse(): Expression {
        const node = this.expression();

        if (this.currentToken.type !== TokenType.EOF) {
            throw new Error('Unexpected tokens after expression');
        }

        return node;
    }
}

/**
 * Parse a mathematical expression string into an AST
 *
 * @param input - Mathematical expression string (e.g., "x^2 + 2*x + 1")
 * @returns Expression AST
 *
 * @example
 * ```typescript
 * const expr = parse("x^2 + 2*x + 1");
 * console.log(expr.toString()); // "(x^2 + (2 * x) + 1)"
 * console.log(expr.toLatex());  // "x^{2} + 2 \cdot x + 1"
 *
 * const vars = new Map([["x", 3]]);
 * console.log(expr.evaluate(vars)); // 16
 * ```
 */
export function parse(input: string): Expression {
    const lexer = new Lexer(input);
    const parser = new Parser(lexer);
    return parser.parse();
}

/**
 * Parse and simplify a mathematical expression
 *
 * @param input - Mathematical expression string
 * @returns Simplified expression AST
 *
 * @example
 * ```typescript
 * const expr = parseAndSimplify("2 + 3 * 4");
 * console.log(expr.toString()); // "14"
 * ```
 */
export function parseAndSimplify(input: string): Expression {
    return parse(input).simplify();
}
