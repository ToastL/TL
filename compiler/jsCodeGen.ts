import * as fs from 'fs'
import path from 'path'

import { ASTType } from "./types"

class CodeGen {
    private ast: any

    private code: string

    private vars: any = {
        'print': 'void'
    }

    constructor(ast: any) {
        this.ast = ast

        this.code = ""
    }

    private walkNode(node: any): any {
        if (node.type === ASTType.NumberLiteral) {
            return node.value
        }
        if (node.type === ASTType.StringLiteral) {
            return `'${node.value}'`
        }
        if (node.type === ASTType.BooleanLiteral) {
            return node.value
        }

        if (node.type === ASTType.BinaryExpression) {
            return `${this.walkNode(node.lhs)}${node.value}${this.walkNode(node.rhs)}`
        }
        if (node.type === ASTType.ReturnExpression) {
            return `return ${this.walkNode(node.value)}`
        }


        if (node.type === ASTType.VariableDefinition) {
            if (this.vars[node.name])
                throw new Error(`'${node.name}' is already a variable or function`)

            this.vars[node.name] = node.type

            return `let ${node.name}=${this.walkNode(node.value)}`
        }
        if (node.type === ASTType.FunctionDefinition) {
            if (this.vars[node.callee])
                throw new Error(`'${node.callee}' is already a variable or function`)

            this.vars[node.callee] = node.type

            const oldVars = {...this.vars}

            const createArg = (arg: any) => {this.vars[arg.name] = arg.type; return arg.name}
            
            let fn = `function ${node.callee}(${node.arguments.map(createArg).join(',')}){${this.walkNodes(node.body)}}`
            
            this.vars = oldVars
            return fn
        }


        if (node.type === ASTType.CallVariable) {
            if (!this.vars[node.name])
                throw new Error(`Variable does not exist '${node.name}'`)

            return `${node.name}`
        }
        if (node.type === ASTType.CallExpression) {
            if (!this.vars[node.callee])
                throw new Error(`Function does not exist '${node.callee}'`)

            let args: any = []
            node.arguments.forEach((arg: any) => {
                args.push(this.walkNode(arg))
            });

            return `${node.callee}(${args.join(', ')})`
        }


        if (node.type === ASTType.SetVariable) {
            return `${node.name}=${this.walkNode(node.value)}`
        }


        if (node.type === ASTType.WhileLoop) {
            return `while(${this.walkNode(node.condition)}){${this.walkNodes(node.body)}}`
        }
        if (node.type === ASTType.IfStatement) {
            return `if(${this.walkNode(node.condition)}){${this.walkNodes(node.body)}}`
        }


        throw new Error(`Unknown node type ${ASTType[node.type]}`)
    }

    private walkNodes(nodes: any) {
        let code = ''
        nodes.forEach((node: any) => {
            code += `${this.walkNode(node)};`
            
        })

        return code
    }

    public gen() {
        if (this.ast.type === ASTType.Program) {
            this.code = this.walkNodes(this.ast.body)
        }
    }

    public getCode(): string {
        return `${this.code}`;
    }
}

export default CodeGen