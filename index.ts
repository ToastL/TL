import * as fs from "fs"
import path from 'path'

import Lexer from "./compiler/lexer"
import Parser from "./compiler/parser"
import CodeGen from "./compiler/jsCodeGen"

let file = fs.readFileSync(path.join(__dirname, '/test.tt')).toString()
file += "\0"

let lexer = new Lexer(file)
lexer.lex()

console.log(lexer.getTokens())

let parser = new Parser(lexer.getTokens())
parser.parse()

console.log(JSON.stringify(parser.getAST()));

let generator = new CodeGen(parser.getAST());
generator.gen()

fs.writeFileSync(path.join(__dirname, "/out.js"), generator.getCode())