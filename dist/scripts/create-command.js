"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = require("readline");
const path_1 = require("path");
const fs_1 = require("fs");
const chalk_1 = __importDefault(require("chalk"));
const process_1 = require("process");
const COMMANDS_DIR = (0, path_1.join)(process.cwd(), 'src', 'commands');
// Helper to ask questions
function ask(question) {
    const rl = (0, readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(chalk_1.default.cyan('? ') + chalk_1.default.bold(question) + ' ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
// Helper to convert string to PascalCase/camelCase
function toPascalCase(str) {
    return str.replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
}
// Interactive Select List
async function select(question, options) {
    return new Promise((resolve) => {
        let selectedIndex = 0;
        const rl = (0, readline_1.createInterface)({ input: process_1.stdin, output: process_1.stdout });
        (0, readline_1.emitKeypressEvents)(process_1.stdin);
        const cleanup = () => {
            process_1.stdin.removeListener('keypress', handleKey);
            if (process_1.stdin.isTTY)
                process_1.stdin.setRawMode(false);
            rl.close();
        };
        const printList = () => {
            // Clear previous lines if not the first render
            if (process_1.stdin.isTTY) {
                process_1.stdout.moveCursor(0, -options.length);
                process_1.stdout.clearScreenDown();
            }
            options.forEach((opt, i) => {
                const isSelected = i === selectedIndex;
                const prefix = isSelected ? chalk_1.default.green('❯ ') : '  ';
                const text = isSelected ? chalk_1.default.cyan.bold(opt) : chalk_1.default.gray(opt);
                console.log(prefix + text);
            });
        };
        console.log(chalk_1.default.cyan('? ') + chalk_1.default.bold(question));
        if (process_1.stdin.isTTY)
            process_1.stdin.setRawMode(true);
        process_1.stdout.write('\x1B[?25l'); // Hide cursor
        printList();
        const handleKey = (_, key) => {
            if (key.name === 'up') {
                selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            }
            else if (key.name === 'down') {
                selectedIndex = (selectedIndex + 1) % options.length;
            }
            else if (key.name === 'return') {
                cleanup();
                process_1.stdout.write('\x1B[?25h'); // Show cursor
                // Clear the list from screen and print selected
                process_1.stdout.moveCursor(0, -options.length - 1); // Move up to the question line
                process_1.stdout.clearScreenDown(); // Clear everything below and including the question
                console.log(chalk_1.default.cyan('? ') + chalk_1.default.bold(question) + ' ' + chalk_1.default.cyan(options[selectedIndex]));
                resolve(options[selectedIndex]);
                return;
            }
            else if (key.ctrl && key.name === 'c') {
                cleanup();
                process.exit(0);
            }
            // Re-render
            printList();
        };
        process_1.stdin.on('keypress', handleKey);
    });
}
async function main() {
    console.log(chalk_1.default.bold.green('\n🚀 Hybrid Command Generator\n'));
    // 1. Get Categories
    if (!(0, fs_1.existsSync)(COMMANDS_DIR)) {
        (0, fs_1.mkdirSync)(COMMANDS_DIR, { recursive: true });
    }
    const categories = (0, fs_1.readdirSync)(COMMANDS_DIR).filter(f => (0, fs_1.statSync)((0, path_1.join)(COMMANDS_DIR, f)).isDirectory());
    // 2. Ask for Category
    const choices = [...categories, '+ Create New Category'];
    let category = await select('Select Category:', choices);
    if (category === '+ Create New Category') {
        category = await ask('Enter New Category Name:');
        while (!category) {
            category = await ask('Category Name is required:');
        }
    }
    // Normalize category name (Capitalize first letter)
    category = category.charAt(0).toUpperCase() + category.slice(1);
    // 3. Ask for Command Name
    let name = await ask('Command Name:');
    while (!name) {
        name = await ask('Command Name is required:');
    }
    name = name.toLowerCase();
    // 4. Ask for Description
    let description = await ask('Description:');
    if (!description)
        description = 'No description provided.';
    // 5. Ask for Command Type
    const type = await select('Command Type:', ['both', 'slash', 'prefix']);
    // 6. Ask for Permission Level
    const level = await select('Permission Level:', ['User', 'Admin', 'ServerOwner', 'Developer']);
    // 7. Generate File
    const categoryDir = (0, path_1.join)(COMMANDS_DIR, category);
    if (!(0, fs_1.existsSync)(categoryDir)) {
        (0, fs_1.mkdirSync)(categoryDir, { recursive: true });
        console.log(chalk_1.default.green(`\nCreated new category: ${category}`));
    }
    const filePath = (0, path_1.join)(categoryDir, `${name}.ts`);
    if ((0, fs_1.existsSync)(filePath)) {
        console.log(chalk_1.default.red(`\nError: Command "${name}" already exists in "${category}".`));
        process.exit(1);
    }
    const template = `import { HybridCommand } from '../../plugins/converter/types';

const command: HybridCommand = {
    name: '${name}',
    description: '${description.replace(/'/g, "\\'")}',
    type: '${type}',
    level: '${level}',
    // args: '<arg:string>',

    async run(ctx) {
        // const { arg } = ctx.args;
        await ctx.reply('Hello from ${name}!');
    }
};

export default command;
`;
    (0, fs_1.writeFileSync)(filePath, template);
    console.log(chalk_1.default.green(`\n✅ Successfully created command: ${chalk_1.default.bold(name)}`));
    console.log(chalk_1.default.gray(`   Path: src/commands/${category}/${name}.ts`));
}
main().catch(console.error);
//# sourceMappingURL=create-command.js.map