# 🚀 The Ultimate Hybrid Discord Bot Framework

Avinex is a next-generation framework designed to make building complex Discord bots **effortless**. It combines the best of both worlds: the speed of prefix commands and the interactivity of slash commands, all with a unified API.

## ⚡ Why Avinex?

| Feature | Traditional Frameworks | Avinex Hybrid Framework |
| :--- | :--- | :--- |
| **Command Type** | Separate handlers for `/` and `!` | **One file** handles both automatically |
| **UI Building** | Hard to build complex interfaces | **Freeform Layout** Container Helpers to build complex v2 container interfaces easily |
| **State Management** | Requires Database/Redis setup | **Magic State** (Embedded in IDs + Memory/Redis Hybrid) |
| **Cleanup** | Manual `setTimeout` tracking | **One-liner** `ctx.registerAutoDisable()` |
| **Safety** | "Interaction Failed" errors common | **Auto-Deferral** prevents timeouts automatically |

---

## 🌟 Feature Highlights

### 1. Unified Hybrid Commands
Write your logic once. It works as a Slash Command (`/ping`) and a Prefix Command (`!ping`) instantly.

```typescript
const command: HybridCommand = {
    name: 'ping',
    type: 'both', // <--- That's it!
    run: async (ctx) => {
        await ctx.reply('Pong! 🏓');
    }
};
```

### 2. Fluent UI Builder
Forget complexity of using v2 components. Build beautiful, Discord V2 Container interfaces with a readable, chainable API.

```typescript
const container = new Container()
    .addHeader('## 📊 Dashboard')
    .addSection({
        texts: ['**Status:** Online', '**Uptime:** 24h'],
        accessory: { type: 'button', label: 'Refresh', customId: ctx.createId('refresh') }
    })
    .addDivider();
```

### 2.1. More Container Helpers

```typescript
container.disable();//disables all components
container.clone();//clones the container
container.disable('refresh');//disables a specific component
container.clone('refresh');//clones a specific component

```

### 3. Magic State Management
Pass data through buttons *without* a database. The framework handles the heavy lifting, storing state in memory/Redis and linking it to a secure, short ID.

```typescript
// Create a button that "remembers" the user and count
const btnId = ctx.createId('click', { user: 'Avinex', count: 5 });

// In your handler:
click: async (ctx) => {
    const { user, count } = ctx.state; // <--- Auto-hydrated!
    await ctx.reply(`${user} clicked ${count} times!`);
}
```

### 4. Autocomplete Made Easy
Add dynamic autocomplete to your commands with a simple handler.

```typescript
args: '<fruit:auto>',
auto: async (ctx) => {
    // Filter options as user types
    const focused = ctx.raw.options.getFocused();
    const fruits = ['Apple', 'Banana', 'Cherry'];
    await ctx.raw.respond(
        fruits.filter(f => f.startsWith(focused)).map(f => ({ name: f, value: f }))
    );
}
```

### 5. Effortless Cleanup
Stop worrying about memory leaks or "Interaction Failed" on old buttons.

```typescript
// Automatically disable all components after 60 seconds
ctx.registerAutoDisable(message, container, 60);
```

---

## 🚀 Get Started

Check out `src/commands/developer/example.ts` for a complete, runnable example of all these features in action!

```bash
npm run cc # Interactive Command Creator
```
