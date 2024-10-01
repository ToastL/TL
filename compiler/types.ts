enum TokenType {
    EOF,
    IDENTIFIER,
    KEYWORD,
    OPERATOR,
    SETOP,
    NUMBER,
    STRING,
    PAREN,
    BRACKET,
    BOOLEAN,
    COMMA,
}

interface Token {
    type: TokenType
    value: string
}


enum ASTType {
    Program,

    NumberLiteral,
    StringLiteral,
    BooleanLiteral,

    BinaryExpression,
    ReturnExpression,

    VariableDefinition,
    FunctionDefinition,

    CallVariable,
    CallExpression,

    SetVariable,

    WhileLoop,
    IfStatement
}

export { TokenType, ASTType };
export type { Token };