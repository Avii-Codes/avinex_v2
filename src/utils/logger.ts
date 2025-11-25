import winston from 'winston';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';

const isDev = process.env.DEV_MODE === 'true';

// Custom format for colorful console output
const coloredFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    const ts = chalk.gray(`[${timestamp}]`);
    let levelStr = '';

    switch (level) {
        case 'error':
            levelStr = chalk.red.bold('ERROR');
            break;
        case 'warn':
            levelStr = chalk.yellow.bold('WARN');
            break;
        case 'info':
            levelStr = chalk.blue.bold('INFO');
            break;
        case 'debug':
            levelStr = chalk.magenta.bold('DEBUG');
            break;
        case 'verbose':
            levelStr = chalk.cyan.bold('VERBOSE');
            break;
        default:
            levelStr = level.toUpperCase();
    }

    const metaStr = Object.keys(meta).length > 0 ? '\n' + JSON.stringify(meta, null, 2) : '';
    return `${ts} ${levelStr} ${message}${metaStr}`;
});

// Create logger
export const logger = winston.createLogger({
    level: isDev ? 'verbose' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        coloredFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: false }), // We handle colors manually
                coloredFormat
            )
        })
    ]
});

// Professional box drawing utility
export const box = {
    create: (
        content: string,
        style: 'single' | 'double' | 'round' | 'bold' | 'classic' | 'none' = 'double',
        options: any = {}
    ): string => {
        return boxen(content, {
            padding: 1,
            margin: 0,
            borderStyle: style,
            borderColor: 'cyan',
            ...options
        });
    },

    banner: (content: string, options: any = {}): string => {
        return boxen(content, {
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            margin: 0,
            borderStyle: 'none',
            borderColor: 'cyan',
            textAlignment: 'center',
            ...options
        });
    },

    info: (content: string): string => {
        return boxen(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'blue',
            title: 'Info',
            titleAlignment: 'center'
        });
    },

    warn: (content: string): string => {
        return boxen(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'yellow',
            title: 'Warning',
            titleAlignment: 'center'
        });
    },

    error: (content: string): string => {
        return boxen(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'red',
            title: 'Error',
            titleAlignment: 'center'
        });
    },

    success: (content: string): string => {
        return boxen(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'green',
            title: 'Success',
            titleAlignment: 'center'
        });
    }
};

// ASCII Art Banner
export async function animateBanner() {
    // Generate big text using figlet
    const logoText = figlet.textSync('AVINEX', {
        font: 'ANSI Shadow',
        horizontalLayout: 'full',
        verticalLayout: 'default'
    });

    const logo = `
${gradient('#00F0FF', '#00A3FF', '#9D00FF')(logoText)}
${(chalk.bold(gradient('#98FFFD', '#6FCEFF', '#4C8CFF')('⚡ Advanced Discord Bot Framework ⚡')))}
${(chalk.gray('Hybrid Commands • AI Ready • Dynamic Config'))}
`;



    // Create the full boxed banner
    const banner = box.banner(logo, {
        padding: { top: 0, bottom: 0, left: 6, right: 6 },
        margin: { top: 1, bottom: 1 },
        textAlignment: 'center',
        borderColor: 'cyan'
    });

    // Animate banner line by line
    const lines = banner.split('\n');
    for (const line of lines) {
        console.log(line);
        await new Promise(r => setTimeout(r, 50));
    }

    const mode = isDev ? chalk.yellow.bold('DEVELOPMENT') : chalk.green.bold('PRODUCTION');
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    });

    const infoContent = `${chalk.cyan('Mode:')} ${mode}\n${chalk.cyan('Started:')} ${chalk.white(timestamp)}`;

    console.log('  ' + boxen(infoContent, {
        padding: { left: 1, right: 1, top: 0, bottom: 0 },
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        borderStyle: 'round',
        borderColor: 'gray',
        width: 55
    }).split('\n').join('\n  '));
    console.log();
}

export class ProgressBar {
    private total: number;
    private current: number = 0;
    private width: number = 50;
    private message: string = '';

    constructor(total: number, message: string = 'Loading...') {
        this.total = total;
        this.message = message;
    }

    public update(current: number, message?: string) {
        this.current = current;
        if (message) this.message = message;
        this.render();
    }

    public increment(message?: string) {
        this.current++;
        if (message) this.message = message;
        this.render();
    }

    public finish(message: string = 'Done!') {
        this.current = this.total;
        this.render();
        console.log(); // New line
        log.success(message);
    }

    private render() {
        const percentage = Math.min(this.current / this.total, 1);
        const percent = Math.round(percentage * 100).toString().padStart(3);

        // Format: ⟳ 50% | Message
        const bar = `  ${chalk.blue('⟳')} ${chalk.yellow(percent + '%')} ${chalk.gray('|')} ${this.message}`;

        // Clear line and write
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(bar);
    }
}

// Helper logging functions
export const log = {
    info: (message: string, meta?: any) => logger.info(message, meta),
    warn: (message: string, meta?: any) => logger.warn(message, meta),
    error: (message: string, error?: any) => {
        if (error instanceof Error) {
            logger.error(message, { error: error.message, stack: isDev ? error.stack : undefined });
        } else {
            logger.error(message, error);
        }
    },
    debug: (message: string, meta?: any) => logger.debug(message, meta),
    verbose: (message: string, meta?: any) => logger.verbose(message, meta),

    command: (commandName: string, user: string, args?: any) => {
        const argsStr = args && Object.keys(args).length > 0
            ? chalk.gray(` ${JSON.stringify(args)}`)
            : '';
        logger.info(`${chalk.green('⚡')} ${chalk.bold('Command:')} ${chalk.cyan(commandName)} ${chalk.gray('│')} ${chalk.yellow(user)}${argsStr}`);
    },

    category: (categoryName: string, commandCount: number, enabled: boolean = true) => {
        if (!enabled) {
            logger.info(`${chalk.gray('  ⊗')} ${chalk.gray(categoryName)} ${chalk.red('(disabled)')}`);
        } else {
            const icon = commandCount > 0 ? chalk.green('  ✓') : chalk.yellow('  ○');
            const countStr = chalk.gray(`(${commandCount} ${commandCount === 1 ? 'command' : 'commands'})`);
            logger.info(`${icon} ${chalk.cyan.bold(categoryName.padEnd(15))} ${countStr}`);
        }
    },

    success: (message: string) => {
        logger.info(`${chalk.green('  ✓')} ${chalk.bold(message)}`);
    },

    loading: (message: string) => {
        logger.info(`${chalk.blue('  ⟳')} ${message}`);
    },

    separator: () => {
        console.log(chalk.gray('  ' + '─'.repeat(61)));
    },

    section: (title: string) => {
        console.log();
        console.log(chalk.bold.white(`  ${title.toUpperCase()}`));
        console.log(chalk.gray('  ' + '─'.repeat(61)));
    }
};
