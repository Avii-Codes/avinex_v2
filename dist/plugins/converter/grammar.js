"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGrammar = parseGrammar;
function parseGrammar(grammar) {
    if (!grammar)
        return [];
    // Regex to match <name:type?> or <name...> or <name>
    // Groups: 1=name, 2=rest(...), 3=type, 4=optional(?)
    const regex = /<([a-zA-Z0-9_]+)(\.\.\.)?(?::([a-zA-Z]+))?(\?)?>/g;
    const args = [];
    let match;
    while ((match = regex.exec(grammar)) !== null) {
        const name = match[1];
        const isRest = !!match[2];
        const typeRaw = match[3] || 'string';
        const isOptional = !!match[4];
        let type = 'string';
        switch (typeRaw.toLowerCase()) {
            case 'number':
                type = 'number';
                break;
            case 'user':
                type = 'user';
                break;
            case 'channel':
                type = 'channel';
                break;
            case 'role':
                type = 'role';
                break;
            case 'bool':
            case 'boolean':
                type = 'boolean';
                break;
            case 'auto':
                type = 'auto';
                break;
            default: type = 'string';
        }
        args.push({
            name,
            type,
            optional: isOptional,
            rest: isRest
        });
    }
    return args;
}
//# sourceMappingURL=grammar.js.map