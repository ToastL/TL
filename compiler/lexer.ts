import { type Token, TokenType } from './types'

const LETTERS = /^[a-zA-Z]/i
const NUMBERS = /^[0-9]/i
const OPERATORS = /[=<>\-+*/]/i

class Lexer {
    private index: number
    private src: string
    private tokens: Token[]

    constructor(src: string) {
        this.index = 0

        this.src = src

        this.tokens = []
    }

    private isKeyword(identifier: string) {
        return identifier == 'int'      || identifier == 'any'  ||
               identifier == 'while'    || identifier == 'if'   ||
               identifier == 'use'
    }

    private isBoolean(identifier: string) {
        return identifier == 'true'     || identifier == 'false'
    }

    public lex() {
        while (this.index < this.src.length) {
            let char = this.src[this.index]

            if (LETTERS.test(char)) {
                let identifier = ''

                while (LETTERS.test(char) || NUMBERS.test(char)) {
                    identifier += char

                    this.index++
                    char = this.src[this.index]
                }

                let type = TokenType.IDENTIFIER
                type = this.isKeyword(identifier) ? TokenType.KEYWORD : type
                type = this.isBoolean(identifier) ? TokenType.BOOLEAN : type

                this.tokens.push({
                    type,
                    value: identifier
                })

                continue
            }

            if (NUMBERS.test(char) || char === '.') {
                let number = ''

                let float = false
                while (NUMBERS.test(char) || char === '.') {
                    number += char

                    if (char === '.' && float)
                        throw new TypeError('Cannot add multiple dots in a number')
                    if (char === '.')
                        float = true

                    this.index++
                    char = this.src[this.index]
                }

                this.tokens.push({
                    type: TokenType.NUMBER,
                    value: number
                })
            }

            if (char === '(' || char === ')') {
                this.tokens.push({
                    type: TokenType.PAREN,
                    value: char
                })

                this.index++
                continue
            } 

            if (char === '{' || char === '}') {
                this.tokens.push({
                    type: TokenType.BRACKET,
                    value: char
                })

                this.index++
                continue
            } 

            if (OPERATORS.test(char)) {
                const op = char

                this.index++
                char = this.src[this.index]

                if (char == '=') {
                    this.tokens.push({
                        type: TokenType.SETOP,
                        value: `${op}${char}`
                    })

                    this.index++
                    continue
                }

                this.tokens.push({
                    type: TokenType.OPERATOR,
                    value: op
                })
                continue
            }
            
            if (char === '\'' || char == '"') {
                let opener = char

                let str = ''
                while ((char = this.src[++this.index]) !== opener)
                    str += char

                this.tokens.push({
                    type: TokenType.STRING,
                    value: str
                })

                this.index++
                continue
            }

            if (char === ' ' || char === '\n') {
                this.index++
                continue
            }

            if (char === '\0') {
                this.tokens.push({
                    type: TokenType.EOF,
                    value: ''
                })

                this.index++
                continue
            }

            if (char === ',') {
                this.tokens.push({
                    type: TokenType.COMMA,
                    value: char
                })

                this.index++
                continue
            }

            throw new TypeError(`Unknown character: '${char}'`)
        }
    }

    public getTokens(): Token[] {
        return this.tokens
    }
}

export default Lexer;