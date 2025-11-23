"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexCommand = lexCommand;
function lexCommand(content) {
    const tokens = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    let startIndex = 0;
    let escaped = false;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (escaped) {
            current += char;
            escaped = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (inQuote) {
            if (char === quoteChar) {
                inQuote = false;
                tokens.push({ value: current, raw: quoteChar + current + quoteChar, index: startIndex });
                current = '';
                quoteChar = '';
            }
            else {
                current += char;
            }
        }
        else {
            if (char === '"' || char === "'") {
                if (current.length > 0) {
                    tokens.push({ value: current, raw: current, index: startIndex });
                    current = '';
                }
                inQuote = true;
                quoteChar = char;
                startIndex = i;
            }
            else if (/\s/.test(char)) {
                if (current.length > 0) {
                    tokens.push({ value: current, raw: current, index: startIndex });
                    current = '';
                }
            }
            else {
                if (current.length === 0)
                    startIndex = i;
                current += char;
            }
        }
    }
    if (current.length > 0 || inQuote) {
        // If still in quote, we treat it as a token anyway (forgiving parser)
        tokens.push({ value: current, raw: inQuote ? quoteChar + current : current, index: startIndex });
    }
    return tokens;
}
//# sourceMappingURL=lexer.js.map