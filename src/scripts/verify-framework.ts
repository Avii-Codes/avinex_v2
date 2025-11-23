import { registry } from '../plugins/converter/registry';
import { executeHybridCommand } from '../plugins/converter/execution';
import { HybridCommand } from '../plugins/converter/types';
import { Client, User, Guild, GuildMember, TextBasedChannel, PermissionsBitField } from 'discord.js';
import chalk from 'chalk';

// Mock Objects
const mockClient = {
    users: {
        fetch: async (id: string) => ({ id, username: 'MockUser' })
    },
    ws: { ping: 20 }
} as unknown as Client;

const mockGuild = {
    id: 'guild-123',
    ownerId: 'owner-123'
} as unknown as Guild;

const mockChannel = {
    send: async (content: any) => console.log(chalk.gray(`[Bot Reply]: ${JSON.stringify(content)}`))
} as unknown as TextBasedChannel;

// Helper to create mock triggers
function createMockMessage(content: string, authorId: string, permissions: bigint = 0n) {
    return {
        content,
        author: { id: authorId, tag: `User#${authorId}`, bot: false },
        member: {
            id: authorId,
            permissions: new PermissionsBitField(permissions)
        },
        guild: mockGuild,
        channel: mockChannel,
        client: mockClient,
        reply: async (content: any) => console.log(chalk.gray(`[Bot Reply]: ${JSON.stringify(content)}`))
    } as any;
}

function createMockVirtualTrigger(content: string, authorId: string) {
    return {
        content,
        author: { id: authorId, tag: `Virtual#${authorId}`, bot: false },
        member: { id: authorId, permissions: new PermissionsBitField(0n) },
        guild: mockGuild,
        channel: mockChannel
    };
}

// Test Commands
const testCommands: HybridCommand[] = [
    {
        name: 'test-user',
        description: 'User level command',
        type: 'both',
        level: 'User',
        run: async (ctx) => { console.log(chalk.green('✅ test-user executed')); }
    },
    {
        name: 'test-admin',
        description: 'Admin level command',
        type: 'both',
        level: 'Admin',
        run: async (ctx) => { console.log(chalk.green('✅ test-admin executed')); }
    },
    {
        name: 'test-owner',
        description: 'Server Owner level command',
        type: 'both',
        level: 'ServerOwner',
        run: async (ctx) => { console.log(chalk.green('✅ test-owner executed')); }
    }
];

async function main() {
    console.log(chalk.bold.cyan('\n🔍 Starting Framework Verification...\n'));

    // 1. Register Test Commands
    console.log(chalk.yellow('1. Registering Test Commands...'));
    testCommands.forEach(cmd => registry.register(cmd, 'virtual-file', 'Test'));

    // 2. Verify Permissions
    console.log(chalk.yellow('\n2. Verifying Permissions...'));

    // 2a. User running User command -> Should Pass
    console.log(chalk.white('  - User running User command:'));
    await executeHybridCommand(createMockMessage('!test-user', 'user-123'));

    // 2b. User running Admin command -> Should Fail
    console.log(chalk.white('  - User running Admin command:'));
    await executeHybridCommand(createMockMessage('!test-admin', 'user-123'));

    // 2c. Admin running Admin command -> Should Pass
    console.log(chalk.white('  - Admin running Admin command:'));
    await executeHybridCommand(createMockMessage('!test-admin', 'admin-123', PermissionsBitField.Flags.Administrator));

    // 2d. User running Owner command -> Should Fail
    console.log(chalk.white('  - User running Owner command:'));
    await executeHybridCommand(createMockMessage('!test-owner', 'user-123'));

    // 2e. Owner running Owner command -> Should Pass
    console.log(chalk.white('  - Owner running Owner command:'));
    await executeHybridCommand(createMockMessage('!test-owner', 'owner-123'));

    // 3. Verify Programmatic Execution
    console.log(chalk.yellow('\n3. Verifying Programmatic Execution (VirtualTrigger)...'));
    console.log(chalk.white('  - Virtual Trigger running User command:'));
    await executeHybridCommand(createMockVirtualTrigger('!test-user', 'virtual-123'));

    // 4. Verify Regression (Prefix Logic)
    console.log(chalk.yellow('\n4. Verifying Regression (Prefix Logic)...'));
    console.log(chalk.white('  - Prefix with arguments:'));
    // Register echo command
    registry.register({
        name: 'echo',
        description: 'Echo',
        args: '<text...>',
        run: async (ctx) => console.log(chalk.green(`✅ Echo: ${ctx.args.text}`))
    } as HybridCommand, 'virtual-echo', 'Test');

    await executeHybridCommand(createMockMessage('!echo Hello World', 'user-123'));

    console.log(chalk.bold.cyan('\n✨ Verification Complete! Check logs above for ✅ or error messages.'));
}

main().catch(console.error);
