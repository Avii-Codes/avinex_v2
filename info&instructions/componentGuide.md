# 🚀 What is a Container?
In Components V2, a Container acts as the main wrapper for all your components.
Instead of the old UI system (embeds + attachments + components in fixed positions), the container allows you to freely layout items in any order you want.

Think of it like a page builder where you stack components top-to-bottom.

# Components you can place inside a Container

- Text:Paragraph style text
- Separator:Divider line
- Media Gallery:Images / GIF gallery
- Section:Group text + button accessory/Thumbnail
- Attachment:Add files (Required to send as Attachment in reply if using uploaded images).
- Action Row:Holds buttons or menus
- Container:Message wrapper

# Components you can place inside a Action Row

- Button:Interactive buttons(5 max)
- Link Button:Link buttons(1 max)
- Select Menu:Dropdown menu(1 max)

# Component Helper Guide
The `Container` class in `src/lib/components.ts` simplifies creating Discord V2 components (Containers).

## Quick Start

Import the `Container` class:
```typescript
import { Container } from '../../lib/components';
import { ButtonStyle, MessageFlags } from 'discord.js';
```

Create a container:
```typescript
const container = new Container();
```

Send the message:
```typescript
await ctx.reply({
    components: [container],
    files: container.files, // Important if using addAttachment
    flags: [MessageFlags.IsComponentsV2]
});
```

### Accent Color (Optional)

Set an accent color for the entire container. This provides a visual theme.

**Color Format:** Hex string (`"#8b5a2b"` or `"8b5a2b"`) or hex number (`0x8b5a2b`)

```typescript
// Using hex string (easiest)
const container = new Container()
    .setColor('#8b5a2b')
    .addText('Themed container');

// Or using hex number
const container2 = new Container()
    .setColor(0x8b5a2b)
    .addText('Themed container');
```

### Custom Helper Methods

The Container class provides convenient shortcuts for common patterns:

**addHeader(content, options?)** - Text + Separator (2 components)
```typescript
container.addHeader('## My Section', { spacing: 'small', divider: true });
```

**addFooter(content, options?)** - Separator + Text (2 components)
```typescript
container.addFooter('*Updated: now*', { divider: true });
```

**addDivider(spacing?)** - Visible divider line (1 component)
```typescript
container.addDivider('large');
```

### Dynamic Editing (New!)

You can modify components after adding them. This is useful for stateful updates (e.g., disabling a button after clicking).

**Methods:**
- `container.items`: Get the list of components.
- `container.updateText(index, newContent)`: Update a text block.
- `container.updateButton(rowIndex, btnIndex, options)`: Update a button.
- `container.removeComponent(index)`: Remove a component.

**Example:**
```typescript
// 1. Create initial container
const container = new Container()
    .addText('Status: Active')      // Index 0
    .addActionRow({                 // Index 1
        buttons: [{ customId: 'stop', label: 'Stop', style: 'danger' }]
    });

// 2. Update it later (e.g., in a handler)
container.updateText(0, 'Status: Stopped');
container.updateButton(1, 0, { 
    label: 'Stopped', 
    disabled: true, 
    style: 'secondary' 
});

await ctx.interaction.update({ components: [container] });
```

### Disabling Components (New!)

You can quickly disable interactive elements (buttons, menus) using `.disable()`.

**Usage:**
```typescript
// Disable EVERYTHING (Buttons, Menus, Accessories)
container.disable();

// Disable only specific types
container.disable({ 
    buttons: true,          // Action Row Buttons
    selectMenus: true,      // Select Menus
    buttonAccessories: false // Keep Section Buttons active
});
```

---

## Components

### 1. Text Display

Add text content to your container.

**Character Limit:** 4000 characters per text component

**Simple Form:****
```typescript
container.addText('## Hello World');
container.addText('Regular text with **markdown** support');
```

**Pre-built Form:**
```typescript
import { TextDisplayBuilder } from 'discord.js';

const text = new TextDisplayBuilder()
    .setContent('## Custom Text');
container.addText(text);
```

---

### 2. Separator

Add visual separators between content.

**Options:**
- `spacing`: `'small'` | `'large'` (optional)
- `divider`: `boolean` (optional) - shows a visible line

**Simple Form:**
```typescript
// Default separator
container.addSeparator();

// With options
container.addSeparator({ 
    spacing: 'large',
    divider: true
});
```

**Pre-built Form:**
```typescript
import { SeparatorBuilder, SeparatorSpacingSize } from 'discord.js';

const separator = new SeparatorBuilder()
    .setSpacing(SeparatorSpacingSize.Large)
    .setDivider(true);
container.addSeparator(separator);
```

- `accessory.style`: `ButtonStyle` or `'primary'` | `'secondary'` | `'success'` | `'danger'` | `'link'` (optional, default: `'secondary'`)
- `accessory.disabled`: `boolean` (optional, default: `false`)

**Regular Button:**
```typescript
// Using string style (easiest)
container.addSection({
    texts: ['Click the button below'],
    accessory: {
        type: 'button',
        label: 'Click Me',
        emoji: '🔗',
        customId: 'my_button',
        style: 'primary', // Simple string!
        disabled: false
    }
});

// Or using ButtonStyle enum
import { ButtonStyle } from 'discord.js';
container.addSection({
    texts: ['Click the button below'],
    accessory: {
        type: 'button',
        label: 'Click Me',
        emoji: '🔗',
        customId: 'my_button',
        style: ButtonStyle.Primary,
        disabled: false
    }
});
```

**Link Button:**
```typescript
container.addSection({
    texts: ['Visit our website'],
    accessory: {
        type: 'button',
        label: 'Website',
        url: 'https://example.com',
        emoji: '🌐',
        disabled: false
    }
});
```

#### Thumbnail Section

**Options:**
- `texts`: `string[]` (required)
- `accessory.type`: `'thumbnail'` (required)
- `accessory.url`: `string` (required)

```typescript
container.addSection({
    texts: ['User Profile', 'Level: 50', 'XP: 12,345'],
    accessory: {
        type: 'thumbnail',
        url: 'https://example.com/avatar.png'
    }
});
```

**Pre-built Form:**
```typescript
import { SectionBuilder, TextDisplayBuilder, ThumbnailBuilder } from 'discord.js';

const section = new SectionBuilder()
    .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('Custom Section')
    )
    .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: 'https://example.com/avatar.png' } })
    );
container.addSection(section);
```

---

### 4. Media Gallery

Display up to 10 images in a gallery format.

**Options:**
- `url`: `string` - Image URL or `attachment://filename.png` (required)
- `description`: `string` (optional)

**Remote Images:**
```typescript
container.addMedia([
    { url: 'https://example.com/image1.png', description: 'First image' },
    { url: 'https://example.com/image2.png', description: 'Second image' }
]);
```

**Local Attachments:**
```typescript
import { AttachmentBuilder } from 'discord.js';

// Create attachment
const file = new AttachmentBuilder('./path/to/image.png', { name: 'image.png' });

// Reference it
container.addMedia([
    { url: 'attachment://image.png', description: 'Local file' }
]);

// Send with files array
await ctx.reply({
    components: [container],
    files: [file],
    flags: [MessageFlags.IsComponentsV2]
});
```

**Pre-built Form:**
```typescript
import { MediaGalleryBuilder } from 'discord.js';

const gallery = new MediaGalleryBuilder().addItems([
    { media: { url: 'https://example.com/pic.jpg' }, description: 'Custom' }
]);
container.addMedia(gallery);
```

---

### 5. Attachments

Add files to the container's file list for easy management.

**Options:**
- `attachment`: `string` (file path) | `Buffer` | `AttachmentBuilder`
- `name`: `string` (required if using path/Buffer)

```typescript
// File path
container.addAttachment('./image.png', 'image.png');

// Buffer
container.addAttachment(buffer, 'file.png');

// Pre-built AttachmentBuilder
const attachment = new AttachmentBuilder('./file.png', { name: 'file.png' });
container.addAttachment(attachment);

// Send
await ctx.reply({
    components: [container],
    files: container.files,
    flags: [MessageFlags.IsComponentsV2]
});
```

---

### 6. Action Rows

Add interactive components (buttons and select menus) grouped horizontally.

**Rules:**
- Max 5 buttons per row
- Only 1 select menu per row
- Cannot mix buttons and menus in the same row

#### Buttons

**Options:**
- `label`: `string` (optional, but recommended)
- `emoji`: `string` (optional)
- `customId`: `string` (required for non-link buttons)
- `url`: `string` (optional, makes it a link button)
- `style`: `ButtonStyle` or `'primary'` | `'secondary'` | `'success'` | `'danger'` | `'link'` (optional, default: `'secondary'`)
- `disabled`: `boolean` (optional, default: `false`)

```typescript
container.addActionRow({
    buttons: [
        { 
            label: 'Play', 
            customId: 'play', 
            emoji: '▶️',
            style: 'success', // Simple string!
            disabled: false
        },
        { 
            label: 'Pause', 
            customId: 'pause', 
            emoji: '⏸️',
            style: 'primary',
            disabled: false
        },
        { 
            label: 'Stop', 
            customId: 'stop', 
            emoji: '⏹️',
            style: 'danger',
            disabled: false
        },
        { 
            label: 'Help', 
            url: 'https://example.com/help',
            emoji: '❓',
            disabled: false
        }
    ]
});
```

#### Select Menus

**Types:** `'string'` | `'user'` | `'role'` | `'mentionable'` | `'channel'`

**Important Notes:**
- **String Select**: Max 25 options, you must provide the `options` array
- **User/Role/Channel/Mentionable**: Discord auto-generates the list, **do not** provide `options`

| Select Menu Type | Max Options | Options List |
|------------------|-------------|--------------|
| String Select | 25 | ✅ Required |
| User Select | N/A | ⚠️ Auto-generated by Discord |
| Role Select | N/A | ⚠️ Auto-generated by Discord |
| Channel Select | N/A | ⚠️ Auto-generated by Discord |
| Mentionable Select | N/A | ⚠️ Auto-generated by Discord |

**Common Options:**
- `type`: `SelectMenuType` (required)
- `customId`: `string` (required)
- `placeholder`: `string` (optional)
- `minValues`: `number` (optional)
- `maxValues`: `number` (optional)
- `disabled`: `boolean` (optional, default: `false`)

**String Select Only:**
- `options`: Array of `{ label, value, description?, emoji? }` (required, max 25)

**String Select Menu:**
```typescript
container.addActionRow({
    menu: {
        type: 'string',
        customId: 'menu1',
        placeholder: 'Choose an option',
        options: [
            { 
                label: 'Option A', 
                value: 'A', 
                description: 'First option',
                emoji: '🅰️'
            },
            { 
                label: 'Option B', 
                value: 'B',
                description: 'Second option',
                emoji: '🅱️'
            }
        ],
        minValues: 1,
        maxValues: 2,
        disabled: false
    }
});
```

**User Select Menu:**
```typescript
container.addActionRow({
    menu: {
        type: 'user',
        customId: 'user_select',
        placeholder: 'Select users',
        minValues: 1,
        maxValues: 5,
        disabled: false
    }
});
```

**Role Select Menu:**
```typescript
container.addActionRow({
    menu: {
        type: 'role',
        customId: 'role_select',
        placeholder: 'Select a role',
        disabled: false
    }
});
```

**Mentionable Select Menu:**
```typescript
container.addActionRow({
    menu: {
        type: 'mentionable',
        customId: 'mention_select',
        placeholder: 'Select users or roles'
    }
});
```

**Channel Select Menu:**
```typescript
container.addActionRow({
    menu: {
        type: 'channel',
        customId: 'channel_select',
        placeholder: 'Select a channel'
    }
});
```

**Pre-built Form:**
```typescript
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
        .setCustomId('btn1')
        .setLabel('Click')
        .setStyle(ButtonStyle.Primary)
);
container.addActionRow(row);
```

---

## Complete Example

Here's a comprehensive example using all features:

```typescript
import { Container } from '../../lib/components';
import { ButtonStyle, MessageFlags, AttachmentBuilder } from 'discord.js';

// Create container
const container = new Container()
    // Set accent color (optional)
    .setColor('#8b5a2b')
    
    // Header
    .addText('## 🎮 Music Player Dashboard')
    .addSeparator({ spacing: 'small', divider: true })
    
    // Now Playing Section with Thumbnail
    .addSection({
        texts: [
            '**Now Playing:** Song Title',
            '**Artist:** Artist Name',
            '**Duration:** 3:45 / 5:30'
        ],
        accessory: {
            type: 'thumbnail',
            url: 'https://example.com/album-cover.png'
        }
    })
    .addSeparator({ spacing: 'large' })
    
    // Playback Controls (Buttons)
    .addActionRow({
        buttons: [
            { label: 'Previous', customId: 'prev', emoji: '⏮️', style: ButtonStyle.Secondary },
            { label: 'Play', customId: 'play', emoji: '▶️', style: ButtonStyle.Success },
            { label: 'Pause', customId: 'pause', emoji: '⏸️', style: ButtonStyle.Primary, disabled: true },
            { label: 'Next', customId: 'next', emoji: '⏭️', style: ButtonStyle.Secondary },
            { label: 'Stop', customId: 'stop', emoji: '⏹️', style: ButtonStyle.Danger }
        ]
    })
    
    // Volume & Settings
    .addActionRow({
        buttons: [
            { label: 'Volume Down', customId: 'vol_down', emoji: '🔉', style: ButtonStyle.Secondary },
            { label: 'Volume Up', customId: 'vol_up', emoji: '🔊', style: ButtonStyle.Secondary },
            { label: 'Settings', customId: 'settings', emoji: '⚙️', style: ButtonStyle.Secondary }
        ]
    })
    
    // Queue Selection
    .addActionRow({
        menu: {
            type: 'string',
            customId: 'queue_select',
            placeholder: 'Jump to song in queue',
            options: [
                { label: 'Song 1', value: '1', description: 'Next in queue', emoji: '🎵' },
                { label: 'Song 2', value: '2', description: 'Track 2', emoji: '🎵' },
                { label: 'Song 3', value: '3', description: 'Track 3', emoji: '🎵' }
            ],
            minValues: 1,
            maxValues: 1
        }
    })
    
    .addSeparator({ spacing: 'small', divider: true })
    
    // Stats & Info Section with Button
    .addSection({
        texts: [
            '**Queue:** 15 songs',
            '**Total Duration:** 1:23:45',
            '**Listeners:** 42 users'
        ],
        accessory: {
            type: 'button',
            label: 'View Full Queue',
            customId: 'view_queue',
            emoji: '📋',
            style: ButtonStyle.Primary
        }
    })
    
    // Image Gallery
    .addMedia([
        { url: 'https://example.com/visual1.png', description: 'Visualizer 1' },
        { url: 'https://example.com/visual2.png', description: 'Visualizer 2' }
    ])
    
    .addSeparator({ spacing: 'large' })
    
    // Links & External Actions
    .addActionRow({
        buttons: [
            { label: 'Spotify', url: 'https://spotify.com/track/...', emoji: '🎧' },
            { label: 'YouTube', url: 'https://youtube.com/watch?v=...', emoji: '▶️' }
        ]
    });

// Optional: Add file attachments
const coverArt = new AttachmentBuilder('./cover.png', { name: 'cover.png' });
container.addAttachment(coverArt);

// Send message
await ctx.reply({
    content: '',
    components: [container],
    files: container.files,
    flags: [MessageFlags.IsComponentsV2]
});
```

---

## Tips & Best Practices

1. **Chaining**: All methods return `this`, allowing for method chaining
2. **Files**: Always include `files: container.files` if you used `addAttachment` or local media
3. **Flags**: Always include `flags: [MessageFlags.IsComponentsV2]` for V2 components
4. **Validation**: The helper automatically validates constraints (max buttons, required fields, etc.)
5. **Disabled State**: Use `disabled: true` to show inactive buttons/menus
6. **Pre-built**: You can mix simple and pre-built forms in the same container
7. **Markdown**: Text supports Discord markdown formatting
8. **Component Limit**: **Maximum 40 components per Container**
   - Each `addText()` = 1 component
   - Each `addSeparator()` = 1 component  
   - Each `addSection()` = 1 component (regardless of text count or accessory)
   - Each `addMedia()` = 1 component (even with 10 images)
   - Each `addActionRow()` = 1 component (regardless of buttons/menu inside)
   - The Container will throw an error if you exceed this limit

---

## Quick Reference

| Component | Max Count | Required Fields | Optional Fields |
|-----------|-----------|-----------------|-----------------|
| **Container** | **40 total components** | - | `setColor()` |
| Text | Unlimited (within container limit) | `content` (max 4000 chars) | - |
| Separator | Unlimited (within container limit) | - | `spacing`, `divider` |
| Section | Unlimited (within container limit) | `texts` (1-3 items), `accessory.type`, `accessory.url` (thumbnail) OR `accessory.customId` (button) | `label`, `emoji`, `style`, `disabled` |
| Media | 10 per gallery | `url` | `description` |
| Attachment | Unlimited | `path/buffer`, `name` | - |
| Action Row (Buttons) | 5 per row | `customId` OR `url` | `label`, `emoji`, `style`, `disabled` |
| Action Row (Menu) | 1 per row | `type`, `customId` | `placeholder`, `options`, `minValues`, `maxValues`, `disabled` |
