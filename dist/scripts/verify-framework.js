"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../plugins/converter/registry");
const execution_1 = require("../plugins/converter/execution");
const discord_js_1 = require("discord.js");
const chalk_1 = __importDefault(require("chalk"));
// Mock Objects
const mockClient = {
    users: {
        fetch: async (id) => ({ id, username: 'MockUser' })
    },
    ws: { ping: 20 }
};
const mockGuild = {
    id: 'guild-123',
    ownerId: 'owner-123'
};
const mockChannel = {
    send: async (content) => console.log(chalk_1.default.gray(`[Bot Reply]: ${JSON.stringify(content)}`))
};
// Helper to create mock triggers
function createMockMessage(content, authorId, permissions = 0n) {
    return {
        content,
        author: { id: authorId, tag: `User#${authorId}`, bot: false },
        member: {
            id: authorId,
            permissions: new discord_js_1.PermissionsBitField(permissions)
        },
        guild: mockGuild,
        channel: mockChannel,
        client: mockClient,
        reply: async (content) => console.log(chalk_1.default.gray(`[Bot Reply]: ${JSON.stringify(content)}`))
    };
}
function createMockVirtualTrigger(content, authorId) {
    return {
        content,
        author: { id: authorId, tag: `Virtual#${authorId}`, bot: false },
        member: { id: authorId, permissions: new discord_js_1.PermissionsBitField(0n) },
        guild: mockGuild,
        channel: mockChannel
    };
}
// Test Commands
const testCommands = [
    {
        name: 'test-user',
        description: 'User level command',
        type: 'both',
        level: 'User',
        run: async (ctx) => { console.log(chalk_1.default.green('✅ test-user executed')); }
    },
    {
        name: 'test-admin',
        description: 'Admin level command',
        type: 'both',
        level: 'Admin',
        run: async (ctx) => { console.log(chalk_1.default.green('✅ test-admin executed')); }
    },
    {
        name: 'test-owner',
        description: 'Server Owner level command',
        type: 'both',
        level: 'ServerOwner',
        run: async (ctx) => { console.log(chalk_1.default.green('✅ test-owner executed')); }
    }
];
async function main() {
    console.log(chalk_1.default.bold.cyan('\n🔍 Starting Framework Verification...\n'));
    // 1. Register Test Commands
    console.log(chalk_1.default.yellow('1. Registering Test Commands...'));
    testCommands.forEach(cmd => registry_1.registry.register(cmd, 'virtual-file', 'Test'));
    // 2. Verify Permissions
    console.log(chalk_1.default.yellow('\n2. Verifying Permissions...'));
    // 2a. User running User command -> Should Pass
    console.log(chalk_1.default.white('  - User running User command:'));
    await (0, execution_1.executeHybridCommand)(createMockMessage('!test-user', 'user-123'));
    // 2b. User running Admin command -> Should Fail
    console.log(chalk_1.default.white('  - User running Admin command:'));
    await (0, execution_1.executeHybridCommand)(createMockMessage('!test-admin', 'user-123'));
    // 2c. Admin running Admin command -> Should Pass
    console.log(chalk_1.default.white('  - Admin running Admin command:'));
    await (0, execution_1.executeHybridCommand)(createMockMessage('!test-admin', 'admin-123', discord_js_1.PermissionsBitField.Flags.Administrator));
    // 2d. User running Owner command -> Should Fail
    console.log(chalk_1.default.white('  - User running Owner command:'));
    await (0, execution_1.executeHybridCommand)(createMockMessage('!test-owner', 'user-123'));
    // 2e. Owner running Owner command -> Should Pass
    console.log(chalk_1.default.white('  - Owner running Owner command:'));
    await (0, execution_1.executeHybridCommand)(createMockMessage('!test-owner', 'owner-123'));
    // 3. Verify Programmatic Execution
    console.log(chalk_1.default.yellow('\n3. Verifying Programmatic Execution (VirtualTrigger)...'));
    console.log(chalk_1.default.white('  - Virtual Trigger running User command:'));
    await (0, execution_1.executeHybridCommand)(createMockVirtualTrigger('!test-user', 'virtual-123'));
    // 4. Verify Regression (Prefix Logic)
    console.log(chalk_1.default.yellow('\n4. Verifying Regression (Prefix Logic)...'));
    console.log(chalk_1.default.white('  - Prefix with arguments:'));
    // Register echo command
    registry_1.registry.register({
        name: 'echo',
        description: 'Echo',
        args: '<text...>',
        run: async (ctx) => console.log(chalk_1.default.green(`✅ Echo: ${ctx.args.text}`))
    }, 'virtual-echo', 'Test');
    await (0, execution_1.executeHybridCommand)(createMockMessage('!echo Hello World', 'user-123'));
    console.log(chalk_1.default.bold.cyan('\n✨ Verification Complete! Check logs above for ✅ or error messages.'));
}
main().catch(console.error);
//# sourceMappingURL=verify-framework.js.map