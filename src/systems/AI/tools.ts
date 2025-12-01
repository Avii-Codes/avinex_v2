import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { registry } from '../../plugins/converter/registry';
import { parseGrammar } from '../../plugins/converter/grammar';
import { ExtendedClient } from '../../client/ExtendedClient';
import { log } from '../../utils/logger';
import { AITool } from '../../services/BaseService';
import { executeHybridCommand, VirtualTrigger } from '../../plugins/converter/execution';

export function generateTools(client: ExtendedClient): Map<string, AITool> {
    const tools = new Map<string, AITool>();

    // 1. Convert Commands to Tools
    const commands = registry.getFlattenedCommands();

    for (const [name, cmd] of commands) {
        // Only allow User-level commands for safety
        if (cmd.level && cmd.level !== 'User') continue;

        // Skip commands without description
        if (!cmd.description) continue;

        let toolName = name.replace(/[^a-zA-Z0-9_]/g, '_'); // Replace non-alphanumeric with _
        if (/^[0-9]/.test(toolName)) toolName = `_${toolName}`; // Ensure it doesn't start with a number

        const parameters: any = {
            type: SchemaType.OBJECT,
            properties: {},
            required: []
        };

        if (cmd.args) {
            const args = parseGrammar(cmd.args);
            for (const arg of args) {
                const paramType = mapArgTypeToSchemaType(arg.type);

                let desc = `Argument: ${arg.name} (${arg.type})`;
                if (arg.type === 'user') desc += ' - Pass the User ID or Mention (e.g. <@123>)';
                if (arg.type === 'channel') desc += ' - Pass the Channel ID or Mention (e.g. <#123>)';
                if (arg.type === 'role') desc += ' - Pass the Role ID or Mention (e.g. <@&123>)';

                parameters.properties[arg.name] = {
                    type: paramType,
                    description: desc
                };

                if (!arg.optional) {
                    parameters.required.push(arg.name);
                }
            }
        }

        tools.set(toolName, {
            declaration: {
                name: toolName,
                description: `${cmd.description} (Usage: ${cmd.args || 'No args'})`,
                parameters: Object.keys(parameters.properties).length > 0 ? parameters : undefined
            },
            execute: async (args: any, context: any) => {
                const { user, channel, client } = context;

                // Construct content string
                // Replace underscores with spaces for subcommands (e.g., "user_avatar" -> "user avatar")
                const commandString = name.replace(/\//g, ' ');
                let content = `${process.env.PREFIX || '!'}${commandString}`;

                // Reconstruct args in order based on command definition
                if (args && cmd.args) {
                    const parsedArgs = parseGrammar(cmd.args);
                    for (const argDef of parsedArgs) {
                        const val = args[argDef.name];
                        if (val !== undefined && val !== null) {
                            content += ` "${val}"`;
                        }
                    }
                } else if (args) {
                    // Fallback for commands without explicit args definition
                    for (const key in args) {
                        content += ` "${args[key]}"`;
                    }
                }

                const trigger: VirtualTrigger = {
                    content,
                    author: user,
                    channel: channel,
                    // @ts-ignore
                    client: client
                };

                await executeHybridCommand(trigger);
                return "Command executed.";
            },
            isCommand: true
        });
    }

    // 2. Convert Services to Tools
    if (client.services) {
        for (const service of client.services.values()) {
            if (typeof service.getAITools === 'function') {
                const serviceTools = service.getAITools();
                for (const tool of serviceTools) {
                    tools.set(tool.declaration.name, tool);
                }
            }
        }
    }

    // 3. Add Special Tools (Containers)
    tools.set('send_container', {
        declaration: {
            name: 'send_container',
            description: 'Send a rich message container. LIMITS: Max 40 components total (Header=2, Footer=2, Text=1, ImageGallery=1). Max 4000 chars per text. Max 10 images per gallery. Items stack vertically.',
            parameters: {
                type: SchemaType.OBJECT,
                properties: {
                    header: {
                        type: SchemaType.STRING,
                        description: 'Title/Header of the container'
                    },
                    text: {
                        type: SchemaType.STRING,
                        description: 'Main text content (Max 4000 chars)'
                    },
                    image_urls: {
                        type: SchemaType.ARRAY,
                        description: 'List of image URLs to display (Max 10 images)',
                        items: {
                            type: SchemaType.STRING
                        }
                    },
                    footer: {
                        type: SchemaType.STRING,
                        description: 'Footer text'
                    }
                },
                required: []
            }
        },
        execute: async (args: any, context: any) => {
            const { channel } = context;
            const { Container } = require('../../lib/components'); // Lazy load to avoid circular deps if any
            const { MessageFlags } = require('discord.js');

            const container = new Container();

            if (args.header) container.addHeader(args.header);
            if (args.text) container.addText(args.text);

            if (args.image_urls && Array.isArray(args.image_urls)) {
                const mediaItems = args.image_urls.map((url: string) => ({ url }));
                container.addMedia(mediaItems);
            } else if (args.image_url) {
                // Backward compatibility or fallback if AI hallucinates singular
                container.addMedia([{ url: args.image_url }]);
            }

            if (args.footer) container.addFooter(args.footer);

            if (container['componentCount'] === 0) {
                return "Error: Container cannot be empty. Provide at least one of: header, text, image_url, footer.";
            }

            try {
                await channel.send({
                    components: [container],
                    flags: [MessageFlags.IsComponentsV2]
                });
                return "Container sent successfully.";
            } catch (error: any) {
                return `Error sending container: ${error.message}`;
            }
        }
    });

    log.verbose(`Generated ${tools.size} AI tools.`);
    return tools;
}

function mapArgTypeToSchemaType(type: string): SchemaType {
    switch (type) {
        case 'number': return SchemaType.NUMBER;
        case 'boolean': return SchemaType.BOOLEAN;
        default: return SchemaType.STRING; // user, channel, role, string -> passed as ID or name
    }
}
