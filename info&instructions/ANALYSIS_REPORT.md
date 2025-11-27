# Avinex Hybrid Bot - Codebase Analysis

## 1. Project Overview
**Avinex** is a hybrid Discord bot built with TypeScript, designed to support both **Slash Commands** (Interaction) and **Prefix Commands** (Message) using a single codebase. It leverages `@sapphire/framework` as a base but implements a custom **Hybrid Command System** to handle the dual-nature of commands.

### Key Technologies
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: `@sapphire/framework` (Base), `discord.js`
- **Database**: MongoDB (via `mongoose`)
- **Utilities**: `boxen`, `chalk`, `gradient-string` (CLI UI), `winston` (Logging)

---

## 2. Core Architecture

### Entry Point (`src/index.ts`)
- Initializes the `ExtendedClient`.
- Sets up graceful shutdown handlers (`SIGINT`, `SIGTERM`) to ensure database connections are closed properly.
- Catches fatal errors during initialization.

### Extended Client (`src/client/ExtendedClient.ts`)
- Extends `SapphireClient`.
- **Initialization Flow (`init`)**:
  1.  **UI**: Animates the startup banner.
  2.  **Database**: Connects to MongoDB via `DatabaseManager`.
  3.  **Plugins**: Registers the custom `ConverterPlugin` (Hybrid Command System).
  4.  **Handlers**: Sets up component handlers (buttons/select menus).
  5.  **Systems**: Dynamically loads modular systems from `src/systems`.
  6.  **Events**: Dynamically loads event handlers from `src/events`.
  7.  **Login**: Authenticates with Discord.
- **System Loading**: Scans `src/systems` for classes extending `BaseSystem` and initializes them.

### Database (`src/database/index.ts`)
- Implements a **Singleton** pattern (`DatabaseManager`).
- Manages the MongoDB connection with event listeners for connection status (connected, error, disconnected).
- Enforces `strictQuery`.

---

## 3. The Hybrid Command System (`src/plugins/converter`)
This is the core innovation of the bot, allowing commands to be defined once and work everywhere.

### 3.1. Registry (`registry.ts`)
- Central store for all commands.
- **Structure**:
  - `commands`: Top-level commands.
  - `subcommands`: Root commands containing subcommands or groups.
  - `aliases`: Maps alias strings to canonical command names.
- **Collision Detection**: Prevents duplicate commands or aliases during registration.
- **Fingerprinting**: Uses file content hashes to detect renames (though currently just logs them).

### 3.2. Command Loading (`register.ts`)
- **Recursive Scan**: Traverses `src/commands`.
- **Hierarchy Support**:
  - **Category**: Top-level folders (e.g., `moderation`, `utility`).
  - **Root Command**: Folders inside categories (e.g., `user`).
  - **Group**: Folders inside roots (e.g., `settings`).
  - **Subcommand**: Files inside roots or groups.
- **Validation**: Checks for name format, description length, and `run` function presence.
- **Deployment**: `deployCommands` converts the internal registry into Discord API-compatible JSON (SlashCommandBuilder) and deploys them.

### 3.3. Grammar & Lexing (`grammar.ts`, `lexer.ts`)
- **Grammar**: Defines a custom syntax for arguments in command definitions.
  - Format: `<name:type?>` (e.g., `<user:user>`, `<reason:string?>`).
  - Types: `string`, `number`, `user`, `channel`, `role`, `boolean`, `auto`.
- **Lexer**: Tokenizes raw message content for prefix commands.
  - Handles quotes (`"`, `'`) for multi-word arguments.
  - Handles escape characters.

### 3.4. Execution Engine (`execution.ts`)
The `executeHybridCommand` function is the universal handler.
1.  **Trigger Resolution**: Determines if the source is a Message, Interaction, or Virtual trigger.
2.  **Command Resolution**:
    - **Slash**: Uses `interaction.commandName` and subcommand options.
    - **Prefix**: Tokenizes content, checks registry for Command, Alias, or Subcommand hierarchy (Root -> Group -> Sub).
3.  **Permission Checking**:
    - **Levels**: `User`, `Admin`, `ServerOwner`, `Developer`.
    - **Discord Permissions**: Checks `Member.permissions`.
4.  **Cooldowns**: In-memory map to rate-limit users.
5.  **Argument Parsing**:
    - **Slash**: Extracts typed options directly.
    - **Prefix**: Maps tokens to the defined grammar types (resolves IDs to User objects, casts numbers/booleans).
6.  **Context Creation**: Wraps the trigger in a `HybridContext`.
7.  **Execution**: Calls `cmd.run(ctx)`.
8.  **Error Handling**: Catches execution errors and replies to the user.

### 3.5. Unified Context (`context.ts`)
- Abstracts the difference between `Message` and `Interaction`.
- Provides unified methods: `reply()`, `edit()`, `follow()`.
- Handles the logic of "replying" to a message vs "editing" a deferred interaction.

---

## 4. UI Component Library (`src/lib/components.ts`)
A fluent API for building Discord UI components (containers + Rows).

- **Container**: The main builder class.
    - Manages a list of components (Containers, Buttons, Select Menus).
    - Enforces component limits (Discord limits).
    - **Fluent Methods**: `addText`, `addSeparator`, `addSection`, `addButton`, `addMedia`.
- **Abstraction**: Hides the complexity of `ActionRowBuilder` and `ContainerBuilder`.
- **Design System**: Standardizes colors, spacing, and layout.

---

## 5. File Structure Summary
- `src/commands`: Command definitions.
- `src/componentHandlers`: Logic for buttons and select menus.
- `src/events`: Discord event listeners (e.g., `ready`, `guildMemberAdd`).
- `src/systems`: Modular features (e.g., XP, Economy).
- `src/utils`: Helpers for logging, config, etc.


