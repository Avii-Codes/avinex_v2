import { createInterface, emitKeypressEvents } from 'readline';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import chalk from 'chalk';
import { stdin, stdout } from 'process';

const COMMANDS_DIR = join(process.cwd(), 'src', 'commands');

// Helper to ask questions
function ask(question: string): Promise<string> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(chalk.cyan('? ') + chalk.bold(question) + ' ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// Helper to convert string to PascalCase/camelCase
function toPascalCase(str: string) {
    return str.replace(/(\w)(\w*)/g, (_, g1, g2) => g1.toUpperCase() + g2.toLowerCase());
}

// Interactive Select List
async function select(question: string, options: string[]): Promise<string> {
    return new Promise((resolve) => {
        let selectedIndex = 0;
        const rl = createInterface({ input: stdin, output: stdout });
        emitKeypressEvents(stdin);

        const cleanup = () => {
            stdin.removeListener('keypress', handleKey);
            if (stdin.isTTY) stdin.setRawMode(false);
            rl.close();
        };

        const printList = () => {
            // Clear previous lines if not the first render
            if (stdin.isTTY) {
                stdout.moveCursor(0, -options.length);
                stdout.clearScreenDown();
            }

            options.forEach((opt, i) => {
                const isSelected = i === selectedIndex;
                const prefix = isSelected ? chalk.green('❯ ') : '  ';
                const text = isSelected ? chalk.cyan.bold(opt) : chalk.gray(opt);
                console.log(prefix + text);
            });
        };

        console.log(chalk.cyan('? ') + chalk.bold(question));

        if (stdin.isTTY) stdin.setRawMode(true);
        stdout.write('\x1B[?25l'); // Hide cursor

        printList();

        const handleKey = (_: any, key: any) => {
            if (key.name === 'up') {
                selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            } else if (key.name === 'down') {
                selectedIndex = (selectedIndex + 1) % options.length;
            } else if (key.name === 'return') {
                cleanup();
                stdout.write('\x1B[?25h'); // Show cursor

                // Clear the list from screen and print selected
                stdout.moveCursor(0, -options.length - 1); // Move up to the question line
                stdout.clearScreenDown(); // Clear everything below and including the question

                console.log(chalk.cyan('? ') + chalk.bold(question) + ' ' + chalk.cyan(options[selectedIndex]));
                resolve(options[selectedIndex]);
                return;
            } else if (key.ctrl && key.name === 'c') {
                cleanup();
                process.exit(0);
            }

            // Re-render
            printList();
        };

        stdin.on('keypress', handleKey);
    });
}

async function main() {
    console.log(chalk.bold.green('\n🚀 Hybrid Command Generator\n'));

    // 1. Get Categories
    if (!existsSync(COMMANDS_DIR)) {
        mkdirSync(COMMANDS_DIR, { recursive: true });
    }

    const categories = readdirSync(COMMANDS_DIR).filter(f =>
        statSync(join(COMMANDS_DIR, f)).isDirectory()
    );

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
    if (!description) description = 'No description provided.';

    // 5. Ask for Command Type
    const type = await select('Command Type:', ['both', 'slash', 'prefix']);

    // 6. Ask for Permission Level
    const level = await select('Permission Level:', ['User', 'Admin', 'ServerOwner', 'Developer']);

    // 7. Generate File
    const categoryDir = join(COMMANDS_DIR, category);
    if (!existsSync(categoryDir)) {
        mkdirSync(categoryDir, { recursive: true });
        console.log(chalk.green(`\nCreated new category: ${category}`));
    }

    const filePath = join(categoryDir, `${name}.ts`);
    if (existsSync(filePath)) {
        console.log(chalk.red(`\nError: Command "${name}" already exists in "${category}".`));
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

    writeFileSync(filePath, template);

    console.log(chalk.green(`\n✅ Successfully created command: ${chalk.bold(name)}`));
    console.log(chalk.gray(`   Path: src/commands/${category}/${name}.ts`));
}

main().catch(console.error);
