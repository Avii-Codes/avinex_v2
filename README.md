# Hybrid Discord Bot

A powerful Discord bot template featuring a **Hybrid Command System** (Slash + Prefix), **Dynamic Configuration**, and **Hierarchical Permissions**.

> [!TIP]
> **New to the framework?**
> Check out [FRAMEWORK_DOCS.md](FRAMEWORK_DOCS.md) for a deep dive into how everything works under the hood!

## 📦 Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Environment**:
    Rename `.env.example` to `.env` and fill in your details:
    ```env
    DISCORD_TOKEN=your_bot_token
    PREFIX=!
    OWNER_IDS=123456789,987654321
    ```

3.  **Run Development Mode**:
    ```bash
    npm run dev
    ```

## 🌟 Key Features

- **Hybrid Commands**: Write once, run as Slash (`/`) or Prefix (`!`).
- **Unified Execution**: Same logic for all trigger types.
- **Robust Validation**: Fatal errors for invalid commands at startup.
- **Smart Config**: `commands.json` auto-syncs even if you rename or move files.
- **Monotonic Cooldowns**: Accurate cooldowns immune to system time changes.
- **Auto-Deferral**: Never see "Interaction failed" again for slow commands.

## 🛠 Creating Commands

**The easiest way to create a command is using the CLI generator:**

```bash
npm run cc
```

This interactive tool will ask for the category, name, type, and permission level, then generate a clean file for you.

### Manual Creation
Create a new file in `src/commands/`.

```typescript
import { HybridCommand } from '../plugins/converter/types';

const command: HybridCommand = {
  name: 'greet',
  description: 'Greets a user',
  type: 'both',
  level: 'User',
  args: '<name:string> <age:number?>', 
  
  async run(ctx) {
    const { name, age } = ctx.args;
    await ctx.reply(`Hello ${name}!`);
  }
};

export default command;
```

For more details on argument grammar and advanced usage, see [FRAMEWORK_DOCS.md](FRAMEWORK_DOCS.md).

## 🤖 Programmatic Command Execution

You can execute commands programmatically from anywhere in your code. This is perfect for **AI agents** or **internal automation**.

```typescript
import { executeCommand } from './plugins/converter/register';

// Example: AI decides to ban a user
await executeCommand(
  client,
  user,
  channel,
  'ban',
  { user: targetUser, reason: 'AI detected spam' }
);

// Example: Execute a subcommand
await executeCommand(
  client,
  user,
  channel,
  'user info',
  { target: someUser }
);
```

**Parameters:**
- `client`: The Discord.js Client instance
- `user`: The User executing the command
- `channel`: The TextBasedChannel to send responses to
- `commandName`: Command name (or "group subcommand" for subcommands)
- `args`: Object with command arguments

## 📜 Utility Scripts

| Script | Alias | Description |
| :--- | :--- | :--- |
| `npm run dev` | - | Start bot with hot-reload |
| `npm run build` | - | Compile TypeScript |
| `npm run create-command` | `npm run cc` | **Interactive Command Generator** |
| `npm run verify` | - | Verify framework integrity |
| `npm run reset-commands` | `npm run rs` | Clear all slash commands from Discord |
| `npm run sync-config` | `npm run sc` | Sync `commands.json` with codebase |
| `npm run refresh` | `npm run rf` | Reset + Sync (full refresh) |

## 📁 Code Base Structure

```text
hybrid-bot/
├── src/
│   ├── commands/       # Your command files
│   ├── plugins/        # Core framework logic
│   ├── scripts/        # Utility scripts
│   ├── utils/          # Helpers (Config, Logger)
│   ├── client.ts       # Client setup
│   └── index.ts        # Entry point
├── commands.json       # Dynamic config (Auto-generated)
└── README.md           # This file
```
