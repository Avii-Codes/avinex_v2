# Component Helper Guide

The `Container` class in `src/lib/components.ts` simplifies creating Discord V2 components (Containers).

## Usage

Import the `Container` class:
```typescript
import { Container } from '../../lib/components';
import { ButtonStyle } from 'discord.js';
```

### 1. Basic Container
Create a new container instance. It extends `ContainerBuilder`, so you can pass it directly to `components`.

```typescript
const container = new Container();
```

### 2. Adding Text
Add a simple text block.

```typescript
container.addText('## Hello World');
```

### 3. Adding Separators
Add a separator line. You can customize spacing and visibility.

```typescript
// Default separator
container.addSeparator();

// Customized separator
container.addSeparator({ 
    spacing: 'small', // 'small' | 'large'
    divider: true     // boolean
});
```

### 4. Adding Sections
Sections allow you to group text with an accessory (Button or Thumbnail).

#### Button Section
**Note**: `customId` is required unless you provide a `url`.

```typescript
container.addSection({
    texts: ['Click the button below to learn more.'],
    accessory: {
        type: 'button',
        label: 'Click Me',          // Optional
        emoji: '🔗',                // Optional
        style: ButtonStyle.Primary, // Optional (Default: Secondary)
        customId: 'my_button_id'    // Required for non-link buttons
    }
});
```

#### Link Button Section
If a `url` is provided, the style is automatically set to `Link`.

```typescript
container.addSection({
    texts: ['Visit our website'],
    accessory: {
        type: 'button',
        label: 'Website',
        url: 'https://example.com'
    }
});
```

#### Thumbnail Section
Displays a small image next to the text.

```typescript
container.addSection({
    texts: ['User Profile', 'Level: 50'],
    accessory: {
        type: 'thumbnail',
        url: 'https://example.com/avatar.png' // Required
    }
});
```

## Full Example

```typescript
const container = new Container()
    .addText('## User Stats')
    .addSeparator({ spacing: 'small', divider: true })
    .addSection({
        texts: ['**Username:** User123', '**Rank:** #1'],
        accessory: {
            type: 'thumbnail',
            url: 'https://example.com/avatar.png'
        }
    })
    .addSeparator()
    .addSection({
        texts: ['View full profile on website'],
        accessory: {
            type: 'button',
            label: 'View Profile',
            url: 'https://example.com/profile'
        }
    });

await ctx.edit({ 
    content: '', 
    components: [container], 
    flags: [MessageFlags.IsComponentsV2] 
});
```
