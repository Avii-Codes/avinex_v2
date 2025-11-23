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
// Simple form
container.addText('## Hello World');

// Or pass a pre-built TextDisplayBuilder
const textDisplay = new TextDisplayBuilder()
    .setContent('## Custom Text');
container.addText(textDisplay);
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

// Or pass a pre-built SeparatorBuilder
const separator = new SeparatorBuilder()
    .setSpacing(SeparatorSpacingSize.Large)
    .setDivider(true);
container.addSeparator(separator);
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

// Or pass a pre-built SectionBuilder
const section = new SectionBuilder()
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('Custom Section'))
    .setThumbnailAccessory(new ThumbnailBuilder({ media: { url: 'https://example.com/avatar.png' } }));
container.addSection(section);
```

### 5. Adding Media Gallery
Add a gallery of images (max 10 items). You can use remote URLs or local attachments.

**Note**: For local attachments, you must construct the `AttachmentBuilder` manually and pass it in the `files` array when sending the message. The URL in `addMedia` should be `attachment://filename.png`.

```typescript
// Remote Image
container.addMedia([
    { url: 'https://example.com/image.png', description: 'A remote image' }
]);

// Local Attachment
container.addMedia([
    { url: 'attachment://local.png', description: 'A local file' }
]);

// Or pass a pre-built MediaGalleryBuilder
const gallery = new MediaGalleryBuilder().addItems([
    { media: { url: 'https://example.com/pic.jpg' }, description: 'Custom gallery' }
]);
container.addMedia(gallery);

// Sending with attachments
import { AttachmentBuilder } from 'discord.js';
const file = new AttachmentBuilder('./path/to/local.png', { name: 'local.png' });

await ctx.reply({
    components: [container],
    files: [file],
    flags: [MessageFlags.IsComponentsV2]
});
```

### 6. Adding Attachments
You can add attachments directly to the container. They are stored in the `files` property, which you must pass to the reply options.

```typescript
// Add attachment
container.addAttachment('./image.png', 'image.png');

// Or with Buffer
container.addAttachment(buffer, 'image.png');

// Send message
await ctx.reply({
    components: [container],
    files: container.files, // Pass the files here
    flags: [MessageFlags.IsComponentsV2]
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
