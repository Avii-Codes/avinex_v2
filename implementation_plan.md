# Implementation Plan - Router Plugin

## Goal
Implement a high-performance **Router Plugin** for handling Discord components (buttons, menus) directly within `HybridCommand` files.
**Key Features**: Lazy Registration, In-Memory State, Granular Permissions, and Robust Error Handling.

## User Review Required
> [!IMPORTANT]
> **State Persistence**: Handlers are stateless. Use `ctx.createId(key, data, ttl)` to store state. State is stored in **Memory (RAM)** and is lost on bot restart.
> **Global Handlers**: Define shared handlers in `src/handlers/global.ts`.
> **Dev Mode**: Set `DEV_MODE=true` in `.env` for detailed interaction logs.

## System Overview: How it Works

### 1. Startup (Lazy Registration)
- The plugin scans all commands.
- **Optimization**: If a command has no `components`, it is skipped instantly.
- **Mapping**: It maps `Command Prefix -> Command Object`. It does *not* register individual buttons, keeping startup fast and memory low.

### 2. ID Generation (State Token)
- Call `ctx.createId('vote', { userId: '123' }, 60)`.
- **Token**: Generates a random ID (e.g., `a1b2`).
- **Storage**: Saves `{ userId: '123' }` to **Memory**,later to database if needed.
- **Result**: Returns ID `poll:vote:a1b2`.

### 3. Interaction Handling
- User clicks `poll:vote:a1b2`.
- **Router**:
  1.  Parses ID: Prefix=`poll`, Key=`vote`, Token=`a1b2`.
  2.  **Lookup**: Finds the `poll` command object (using Aliases if needed).
  3.  **Hydration**: Loads data for `a1b2` into `ctx.state`.
  4.  **Checks**: Verifies Permissions, Cooldowns, and Owner Only.
  5.  **Execution**: Runs `poll.components.vote(ctx)`.

## Proposed Changes

### 1. Extend `HybridCommand` Interface
#### [MODIFY] [types.ts](file:///c:/Users/sambi/Downloads/new%20bottt/hybrid-bot/src/plugins/converter/types.ts)
```typescript
export interface HybridContext {
  command: HybridCommand;
  createId(key: string, data?: any, ttl?: number): string; 
}

export interface ComponentContext extends HybridContext {
    interaction: ButtonInteraction | StringSelectMenuInteraction | any;
    state: any; // Hydrated from cache
    componentArgs: string[]; // Raw args
}

export interface ComponentConfig {
    run: (ctx: ComponentContext) => Promise<void>;
    global?: boolean;
    permissions?: PermissionResolvable[];
    roles?: string[]; // Role IDs
    users?: string[]; // User IDs
    ownerOnly?: boolean;
    cooldown?: number;
}

export interface HybridCommand {
    components?: Record<string, (ctx: ComponentContext) => Promise<void> | ComponentConfig>;
    idPrefix?: string; // Internal
}
```

### 2. Create Router Plugin
#### [NEW] [src/plugins/router/state.ts](file:///c:/Users/sambi/Downloads/new%20bottt/hybrid-bot/src/plugins/router/state.ts)
- **StateManager**: 
  - **In-Memory Map**: Fast access.
  - **Active Garbage Collection**: 
    - Runs every 60 seconds.
    - Scans all keys and deletes expired ones.
    - **Guarantee**: Even if a user never clicks the button, the data IS removed. Nothing piles up.


#### [NEW] [src/plugins/router/registry.ts](file:///c:/Users/sambi/Downloads/new%20bottt/hybrid-bot/src/plugins/router/registry.ts)
- **ComponentRegistry**: 
  - **Global**: `ID -> Handler`.
  - **Commands**: `Prefix -> Command` (Maps Name AND Aliases).

#### [NEW] [src/plugins/router/index.ts](file:///c:/Users/sambi/Downloads/new%20bottt/hybrid-bot/src/plugins/router/index.ts)
- **Scanner**: Skips commands without components. Maps prefixes.
- **Dispatcher**: 
  - **Lookup**: Finds command -> component.
  - **Safety**: Try/Catch wrappers.
  - **Logging**: Detailed logs if `DEV_MODE=true`.

#### [NEW] [src/plugins/router/context.ts](file:///c:/Users/sambi/Downloads/new%20bottt/hybrid-bot/src/plugins/router/context.ts)
- **createId**: Generates ID, stores state, checks length limit (100 chars).

## Verification Plan
1.  **Startup**: Verify fast startup time.
2.  **State**: Create button -> Click Button (Should work).
3.  **Permissions**: Test `ownerOnly` with alt account.
4.  **Error**: Click button with missing handler (Should reply error).

## Usage Examples

### 1. Simple Poll (In-Command)
```typescript
const command: HybridCommand = {
    name: 'poll',
    run: async (ctx) => {
        const btn = new ButtonBuilder()
            .setCustomId(ctx.createId('vote'))
            .setLabel('Vote');
        await ctx.reply({ components: [new Container().addButton(btn)] });
    },
    components: {
        vote: async (ctx) => {
            await ctx.reply({ content: 'Voted!', ephemeral: true });
        }
    }
};
```

### 2. Ban with State (Data Passing)
```typescript
const command: HybridCommand = {
    name: 'ban',
    run: async (ctx) => {
        // Store targetId in state (Auto-expires in 120s)
        const confirmId = ctx.createId('confirm', { targetId: ctx.args.user.id }, 120);
        await ctx.reply({ components: [new Container().addButton({ label: 'Confirm', customId: confirmId })] });
    },
    components: {
        confirm: async (ctx) => {
            if (!ctx.state) return ctx.reply('Expired.');
            await ctx.guild.members.ban(ctx.state.targetId);
            await ctx.reply('Banned!');
        }
    }
};
```

### 3. Stability (Aliases for Old Buttons)
If you rename `poll` to `poll_v2`, add `aliases: ['poll']` to keep old buttons working.

```typescript
const command: HybridCommand = {
    name: 'poll_v2', // New Name
    aliases: ['poll'], // Old Name (for backward compatibility)
    run: async (ctx) => { ... },
    components: {
        vote: async (ctx) => { ... }
    }
};
```
- **New Buttons**: `poll_v2:vote` -> Works.
- **Old Buttons**: `poll:vote` -> Finds Alias -> Works.
