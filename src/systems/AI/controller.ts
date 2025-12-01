import { User, TextBasedChannel, Message, MessagePayload, MessageCreateOptions, MessageFlags, TextDisplayBuilder } from 'discord.js';
import { AIManager } from './manager';
import { generateTools } from './tools';
import { ExtendedClient } from '../../client/ExtendedClient';
import { executeHybridCommand, VirtualTrigger } from '../../plugins/converter/execution';
import { log } from '../../utils/logger';
import { Container } from '../../lib/components';

export class AIController {
    private manager: AIManager;

    private toolsCache: Map<string, any> | null = null;

    constructor() {
        this.manager = new AIManager();
    }

    public async ask(prompt: string, user: User, channel: TextBasedChannel, client: ExtendedClient, onProgress?: (status: string) => Promise<void>): Promise<string | MessagePayload | MessageCreateOptions> {
        // 1. Get Tools (Cached)
        if (!this.toolsCache) {
            this.toolsCache = generateTools(client);
        }
        const tools = this.toolsCache!;

        // 2. Initial Call
        let currentResponse = await this.manager.generateContent(prompt, tools);
        let chatSession = currentResponse.chat;
        let response = currentResponse.response;

        // 3. Tool Execution Loop
        const maxSteps = 5;
        let steps = 0;
        let bufferedToolPayloads: any[] = [];

        while (steps < maxSteps) {
            const functionCalls = response.functionCalls();

            if (!functionCalls || functionCalls.length === 0) {
                const finalText = response.text();

                // FINAL MERGE STRATEGY
                // If we have buffered tool payloads (specifically Containers), merge them with the text.
                if (bufferedToolPayloads.length > 0) {
                    const lastPayload = bufferedToolPayloads[bufferedToolPayloads.length - 1];

                    // Check if the payload has components (Container)
                    if (lastPayload.components && lastPayload.components.length > 0) {
                        const container = lastPayload.components[0];

                        // Create TextDisplay for the AI's response
                        const textDisplay = new TextDisplayBuilder().setContent(finalText);

                        // Construct combined payload
                        return {
                            content: '', // Clear content as we use TextDisplay
                            components: [textDisplay, container] as any, // Text first, then Container
                            files: lastPayload.files || [],
                            flags: [MessageFlags.IsComponentsV2],
                            allowedMentions: { repliedUser: false }
                        };
                    }
                }

                return finalText;
            }

            const toolParts: any[] = [];

            for (const call of functionCalls) {
                log.verbose(`AI calling tool: ${call.name}`, call.args);

                let output = '';
                try {
                    const tool = tools.get(call.name);

                    if (tool) {
                        // PROGRESS UPDATE
                        if (onProgress) {
                            const statusMsg = tool.isCommand
                                ? `Executing command: ${call.name.replace(/_/g, ' ')}...`
                                : `Searching...`;
                            await onProgress(statusMsg);
                        }

                        // Spy on the channel to capture output (SUPPRESS SENDING)
                        const { spyChannel, getPayloads } = this.createSpyChannel(channel, true);

                        // Execute with Spy Channel in context
                        const returnValue = await tool.execute(call.args, {
                            user,
                            channel: spyChannel,
                            client
                        });

                        const payloads = getPayloads();
                        if (payloads.length > 0) {
                            bufferedToolPayloads.push(...payloads);
                            output = `(Tool executed. Output buffered. Return Value: ${returnValue})`;
                        } else {
                            output = returnValue;
                        }

                    } else {
                        output = `Error: Tool '${call.name}' not found.`;
                    }

                } catch (error: any) {
                    output = `Error executing tool: ${error.message}`;
                    log.error(`Tool execution failed: ${call.name}`, error);
                }

                toolParts.push({
                    functionResponse: {
                        name: call.name,
                        response: { output: output }
                    }
                });
            }

            const nextResult = await chatSession.sendMessage(toolParts);
            response = nextResult.response;
            steps++;
        }

        return response.text();
    }

    private createSpyChannel(realChannel: TextBasedChannel, suppress: boolean = false) {
        let capturedPayloads: any[] = [];

        const spyChannel = new Proxy(realChannel, {
            get(target, prop, receiver) {
                if (prop === 'send') {
                    return async (payload: any) => {
                        // Capture full payload
                        capturedPayloads.push(payload);

                        log.info('SpyChannel Captured:', JSON.stringify(payload, null, 2));

                        if (suppress) {
                            // Return a fake message object to satisfy the caller
                            return { id: 'virtual_message_id', content: 'Buffered' } as Message;
                        }

                        // Pass through if not suppressed
                        return (target as any).send(payload);
                    };
                }
                return Reflect.get(target, prop, receiver);
            }
        });

        return {
            spyChannel: spyChannel as TextBasedChannel,
            getPayloads: () => capturedPayloads
        };
    }
}
