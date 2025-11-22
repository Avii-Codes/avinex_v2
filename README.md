# Hybrid Discord Bot

A powerful Discord bot template featuring a **Hybrid Command System** (Slash + Prefix), **Dynamic Configuration**, and **Hierarchical Permissions**.

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

## 🌟 Features

### 1. Hybrid Commands
Write one command file, run it as both **Slash Command** (`/ping`) and **Prefix Command** (`!ping`).

### 2. Permission Levels
Control who can use commands with a simple `level` property.

| Level | Description |
| :--- | :--- |
| `User` | Default. Available to everyone. |
| `Admin` | Requires `Administrator` permission in the server. |
| `ServerOwner` | Restricted to the Guild Owner. |
| `Developer` | Restricted to users in `OWNER_IDS`. Bypasses all checks. |

**Example:**
```typescript
export default {
  name: 'nuke',
  level: 'ServerOwner', // Only server owner can use this
  run(ctx) { ... }
}
```

### 3. Dynamic Configuration (`commands.json`)
The bot automatically generates a `commands.json` file on the first run.
You can edit this file to control your bot **without touching code**:

*   **Enable/Disable**: Turn off specific commands or entire categories.
*   **Aliases**: Add custom aliases (e.g., `!ban`, `!b`, `!hammer`).
*   **Cooldowns**: Set per-command cooldowns in seconds.

**Example `commands.json`:**
```json
{
  "categories": {
    "General": {
      "enabled": true,
      "commands": {
        "ping": {
          "enabled": true,
          "aliases": ["pong", "latency"],
          "cooldown": 5
        }
      }
    }
  }
}
```
*New commands created in code are automatically added to this file!*

## 🛠 Creating Commands

Create a new file in `src/commands/`.

```typescript
import { HybridCommand } from '../plugins/converter/types';

export default {
  name: 'greet',
  description: 'Greets a user',
  type: 'both',
  level: 'User',
  args: '<name:string> <age:number?>', 
  
  async run(ctx) {
    const { name, age } = ctx.args;
    await ctx.reply(`Hello ${name}!`);
  }
} as HybridCommand;
```

### Argument Grammar
- `<name>`: Required string
- `<name?>`: Optional string
- `<name:number>`: Number
- `<name:user>`: Discord User
- `<name:auto>`: Autocomplete String
- `<name...>`: Rest (captures remaining text)

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
| `npm run reset-commands` | `npm run rs` | Clear all slash commands from Discord |
| `npm run sync-config` | `npm run sc` | Sync `commands.json` with codebase |
| `npm run refresh` | `npm run rf` | Reset + Sync (full refresh) |

