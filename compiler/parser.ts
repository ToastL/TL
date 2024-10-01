import { type Token, TokenType, ASTType } from "./types"

const TOKLVL: any = {
    '+': 10,
    '-': 20,
    '*': 30,
    '/': 40,
    '<': 50,
    '>': 50
}

class Parser {
    private index: number
    private ast: object

    private tokenList: Token[]

    private token: Token

    constructor(tokenList: Token[]) {
        this.index = 0
        this.ast = {}

        this.tokenList = tokenList
        this.token = tokenList[this.index]
    }

    private getNextToken(): Token {
        return this.token = this.tokenList[++this.index]
    }

    private parseExpression(): any {
        if (this.token.type == TokenType.NUMBER) {
            const lhs = this.parsePrimary()
            if (!lhs)
                return null

            return this.parseBinOpRHS(0, lhs)
        }

        let value = this.token.value
        if (this.token.type == TokenType.STRING) {
            this.getNextToken()

            return {
                type: ASTType.StringLiteral,
                value
            }
        }

        if (this.token.type == TokenType.BOOLEAN) {
            this.getNextToken()

            return {
                type: ASTType.BooleanLiteral,
                value
            }
        }

        if (this.token.type == TokenType.IDENTIFIER) {
            const lhs = this.parsePrimary()
            if (!lhs)
                return null

            return this.parseBinOpRHS(0, lhs)
        }

        if (this.token.type == TokenType.KEYWORD) {
            return this.parseKeyword()
        }

        if (this.token.type == TokenType.OPERATOR) {
            if (this.token.value != '<') return

            this.getNextToken()

            let V: any = this.parseExpression()

            return {
                type: ASTType.ReturnExpression,
                value: V
            }
        }

        if (this.token.type == TokenType.PAREN) {
            let lhs = this.parsePrimary()
            if (!lhs)
                return null
            
            return this.parseBinOpRHS(0, lhs)
        }

        throw new TypeError(`Unknown token type ${TokenType[this.token.type]}`)
    }

    private parseKeyword() {
        let keyword = this.token

        this.getNextToken()



        switch (keyword.value) {
            default: {
                const type = keyword.value

                const name = this.token.value

                this.getNextToken()
        
                if (this.token.value === '=') {
                    this.getNextToken()
        
                    let value = this.parseExpression()
        
                    return {
                        type: ASTType.VariableDefinition,
                        name,
                        return: type,
                        value
                    }
                }
                
                if (this.token.value === '>') {
                    this.getNextToken()
        
                    let args: any = []
                    while (true) {
                        let arg = this.parseKeyword()

                        args.push(arg)
                        
                        if (this.token.type == TokenType.COMMA && this.token.value == ',') continue
                        if (this.token.type == TokenType.BRACKET && this.token.value == '{') break
                        throw new TypeError(`Expected ',' got ${TokenType[this.token.type]}`)
                    }

                    console.log(args)

                    this.getNextToken()
            
                    let body = []
                    while (this.token.value !== '}')
                        body.push(this.parseExpression())
                    
                    if (this.token.type !== TokenType.BRACKET || this.token.value !== '}')
                        throw new TypeError(`Expected '}' got '${TokenType[this.token.type]}'`)

                    this.getNextToken()
            
                    return {
                        type: ASTType.FunctionDefinition,
                        callee: name,
                        return: type,
                        body,
                        arguments: args
                    }
                }
    
                return {
                    type: ASTType.VariableDefinition,
                    name,
                    return: type,
                    value: undefined
                }
            }
            case 'while': {
                const condition = this.parseExpression()

                if (this.token.type != TokenType.BRACKET || this.token.value != '{')
                    throw new TypeError("Expected '{'")

                this.getNextToken()

                let body = []
                while (this.token.value !== '}')
                    body.push(this.parseExpression())

                this.getNextToken()

                return {
                    type: ASTType.WhileLoop,
                    condition,
                    body
                }
            }
            case 'if': {
                const condition = this.parseExpression()

                if (this.token.type !== TokenType.BRACKET || this.token.value !== '{')
                    throw new TypeError(`Expected '{' got '${TokenType[this.token.type]}'`)

                this.getNextToken()

                let body = []
                while (this.token.value !== '}')
                    body.push(this.parseExpression())

                if (this.token.type != TokenType.BRACKET || this.token.value !== '}')
                    throw new TypeError(`Expected '}' got '${TokenType[this.token.type]}'`)

                this.getNextToken()

                return {
                    type: ASTType.IfStatement,
                    condition,
                    body
                }
            }
        }
        
    }

    private parseIdentifier() {
        let name = this.token.value

        this.getNextToken()

        if (this.token.value == '(') {
            this.getNextToken()

            let args: any = []
            while (this.token.type != TokenType.PAREN || this.token.value != ')')
                args.push(this.parseExpression())

            this.getNextToken()

            return {
                type: ASTType.CallExpression,
                callee: name,
                arguments: args
            }
        }

        if (this.token.type == TokenType.OPERATOR && this.token.value == '=') {
            this.getNextToken()

            let V = this.parseExpression()

            return {
                type: ASTType.SetVariable,
                name,
                value: V
            }
        }

        if (this.token.type == TokenType.SETOP) {
            let op = this.token.value[0]

            this.getNextToken()

            let V = this.parseExpression()

            let res = {
                type: ASTType.SetVariable,
                name,
                value: {
                    type: ASTType.BinaryExpression,
                    value: op,
                    lhs: {
                        type: ASTType.CallVariable,
                        name
                    },
                    rhs: V
                }
            }

            console.log(res)

            return res
        }

        return {
            type: ASTType.CallVariable,
            name
        }
    }

    private parseNumber() {
        let value = this.token.value

        this.getNextToken()

        return {
            type: ASTType.NumberLiteral,
            value
        }
    }

    private parseParen(): any {
        this.getNextToken()

        const V = this.parseExpression()
        if (!V)
            return null
        
        if (this.token.value != ')')
            throw new Error('Expected ")"')

        this.getNextToken()

        return V
    }

    private getTokLvl() {
        const tokLvl = TOKLVL[this.token.value]
        if (tokLvl)
            return tokLvl
    }

    private parsePrimary() {
        switch (this.token.type) {
            default:
                throw new TypeError("Unknown token when expecting an expression")
            case TokenType.IDENTIFIER:
                return this.parseIdentifier()
            case TokenType.NUMBER:
                return this.parseNumber()
            case TokenType.PAREN:
                return this.parseParen()
        }  
    }

    private parseBinOpRHS(exprLvl: number, lhs: any) {
        while (true) {
            let tokLvl = this.getTokLvl()

            if (!tokLvl)
                return lhs

            if (tokLvl < exprLvl)
                return lhs

            let operator = this.token

            this.getNextToken()

            let rhs = this.parsePrimary()
            if (!rhs)
                return null

            let nextTokLvl = this.getTokLvl()
            if (tokLvl < nextTokLvl) {
                rhs = this.parseBinOpRHS(tokLvl+1, rhs)
                if (!rhs)
                    return null
            }

            lhs = {
                type: ASTType.BinaryExpression,
                value: operator.value,
                lhs,
                rhs
            }
        }
    }

    public parse() {
        const body = []
        while (this.token.type != TokenType.EOF)
            body.push(this.parseExpression())

        this.ast = {
            type: ASTType.Program,
            body
        }
    }

    public getAST(): object {
        return this.ast
    }
}

export default Parser;