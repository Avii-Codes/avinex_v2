"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.box = exports.logger = void 0;
exports.displayBanner = displayBanner;
const winston_1 = __importDefault(require("winston"));
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importDefault(require("boxen"));
const isDev = process.env.DEV_MODE === 'true';
// Custom format for colorful console output
const coloredFormat = winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
    const ts = chalk_1.default.gray(`[${timestamp}]`);
    let levelStr = '';
    switch (level) {
        case 'error':
            levelStr = chalk_1.default.red.bold('ERROR');
            break;
        case 'warn':
            levelStr = chalk_1.default.yellow.bold('WARN');
            break;
        case 'info':
            levelStr = chalk_1.default.blue.bold('INFO');
            break;
        case 'debug':
            levelStr = chalk_1.default.magenta.bold('DEBUG');
            break;
        case 'verbose':
            levelStr = chalk_1.default.cyan.bold('VERBOSE');
            break;
        default:
            levelStr = level.toUpperCase();
    }
    const metaStr = Object.keys(meta).length > 0 ? '\n' + JSON.stringify(meta, null, 2) : '';
    return `${ts} ${levelStr} ${message}${metaStr}`;
});
// Create logger
exports.logger = winston_1.default.createLogger({
    level: isDev ? 'verbose' : 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), coloredFormat),
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize({ all: false }), // We handle colors manually
            coloredFormat)
        })
    ]
});
// Professional box drawing utility
exports.box = {
    create: (content, style = 'double', options = {}) => {
        return (0, boxen_1.default)(content, {
            padding: 1,
            margin: 0,
            borderStyle: style,
            borderColor: 'cyan',
            ...options
        });
    },
    banner: (content, options = {}) => {
        return (0, boxen_1.default)(content, {
            padding: { top: 1, bottom: 1, left: 2, right: 2 },
            margin: 0,
            borderStyle: 'double',
            borderColor: 'cyan',
            textAlignment: 'center',
            ...options
        });
    },
    info: (content) => {
        return (0, boxen_1.default)(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'blue',
            title: 'Info',
            titleAlignment: 'center'
        });
    },
    warn: (content) => {
        return (0, boxen_1.default)(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'yellow',
            title: 'Warning',
            titleAlignment: 'center'
        });
    },
    error: (content) => {
        return (0, boxen_1.default)(content, {
            padding: 1,
            margin: 0,
            borderStyle: 'round',
            borderColor: 'red',
            title: 'Error',
            titleAlignment: 'center'
        });
    },
    success: (content) => {
        return (0, boxen_1.default)(content, {
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
function displayBanner() {
    const logo = `
${chalk_1.default.bold.magenta('  █████╗ ██╗   ██╗██╗███╗   ██╗███████╗██╗  ██╗')}
${chalk_1.default.bold.magenta(' ██╔══██╗██║   ██║██║████╗  ██║██╔════╝╚██╗██╔╝')}
${chalk_1.default.bold.magenta(' ███████║██║   ██║██║██╔██╗ ██║█████╗   ╚███╔╝')}
${chalk_1.default.bold.magenta(' ██╔══██║╚██╗ ██╔╝██║██║╚██╗██║██╔══╝   ██╔██╗')}
${chalk_1.default.bold.magenta(' ██║  ██║ ╚████╔╝ ██║██║ ╚████║███████╗██╔╝ ██╗')}
${chalk_1.default.bold.magenta(' ╚═╝  ╚═╝  ╚═══╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝')}

${chalk_1.default.yellow.bold('⚡ Advanced Discord Bot Framework ⚡')}
${chalk_1.default.gray('Hybrid Commands • AI Ready • Dynamic Config')}
`;
    console.log(exports.box.banner(logo, {
        padding: { top: 0, bottom: 0, left: 5, right: 5 },
        margin: { top: 1, bottom: 1 },
        textAlignment: 'center'
    }));
    const mode = isDev ? chalk_1.default.yellow.bold('DEVELOPMENT') : chalk_1.default.green.bold('PRODUCTION');
    const timestamp = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'medium'
    });
    // Use boxen for info box
    const infoContent = `${chalk_1.default.cyan('Mode:')} ${mode}
${chalk_1.default.cyan('Started:')} ${chalk_1.default.white(timestamp)}`;
    console.log(); // Empty line
    console.log('  ' + (0, boxen_1.default)(infoContent, {
        padding: { left: 1, right: 1, top: 0, bottom: 0 },
        margin: 0,
        borderStyle: 'single',
        borderColor: 'gray',
        width: 55
    }).split('\n').join('\n  '));
    console.log();
}
// Helper logging functions
exports.log = {
    info: (message, meta) => exports.logger.info(message, meta),
    warn: (message, meta) => exports.logger.warn(message, meta),
    error: (message, error) => {
        if (error instanceof Error) {
            exports.logger.error(message, { error: error.message, stack: isDev ? error.stack : undefined });
        }
        else {
            exports.logger.error(message, error);
        }
    },
    debug: (message, meta) => exports.logger.debug(message, meta),
    verbose: (message, meta) => exports.logger.verbose(message, meta),
    command: (commandName, user, args) => {
        const argsStr = args && Object.keys(args).length > 0
            ? chalk_1.default.gray(` ${JSON.stringify(args)}`)
            : '';
        exports.logger.info(`${chalk_1.default.green('⚡')} ${chalk_1.default.bold('Command:')} ${chalk_1.default.cyan(commandName)} ${chalk_1.default.gray('│')} ${chalk_1.default.yellow(user)}${argsStr}`);
    },
    category: (categoryName, commandCount, enabled = true) => {
        if (!enabled) {
            exports.logger.info(`${chalk_1.default.gray('  ⊗')} ${chalk_1.default.gray(categoryName)} ${chalk_1.default.red('(disabled)')}`);
        }
        else {
            const icon = commandCount > 0 ? chalk_1.default.green('  ✓') : chalk_1.default.yellow('  ○');
            const countStr = chalk_1.default.gray(`(${commandCount} ${commandCount === 1 ? 'command' : 'commands'})`);
            exports.logger.info(`${icon} ${chalk_1.default.cyan.bold(categoryName.padEnd(15))} ${countStr}`);
        }
    },
    success: (message) => {
        exports.logger.info(`${chalk_1.default.green('  ✓')} ${chalk_1.default.bold(message)}`);
    },
    loading: (message) => {
        exports.logger.info(`${chalk_1.default.blue('  ⟳')} ${message}`);
    },
    separator: () => {
        console.log(chalk_1.default.gray('  ' + '─'.repeat(61)));
    },
    section: (title) => {
        console.log();
        console.log(chalk_1.default.bold.white(`  ${title.toUpperCase()}`));
        console.log(chalk_1.default.gray('  ' + '─'.repeat(61)));
    }
};
//# sourceMappingURL=logger.js.map