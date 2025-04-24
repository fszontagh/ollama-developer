import ollama, { AbortableAsyncIterator, ChatResponse } from 'ollama';
import { executeCommand, registerCommands } from './command-handler';
import { chatPrompt, assistantSay, assistantSayChunks, clearConsoleAndScrollbackBuffer } from './gui/chat-prompt';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import { getFunctionDefinitions, listTools, loadAllTools, runTool } from './tool-manager';
import { appendMessage, getMessages, saveHistory } from './history';
import chalk from 'chalk';
import readline, { clearLine } from 'readline';
import { clearLines, countVisualRows } from './utils/console';
import { createLogUpdate } from 'log-update';

marked.setOptions({
    renderer: new TerminalRenderer({
        headingCenter: false,
        strong: chalk.bold,
        em: chalk.italic,
        codespan: chalk.cyan,
    })
});

async function handleToolCalls(toolCalls: any) {
    const tools = [];
    for (const tool of toolCalls) {
        tools.push(tool);
    }
    return tools;
}

async function processResponse(response: AbortableAsyncIterator<ChatResponse>, logUpdate: ((...text: string[]) => void) & { clear(): void; done(): void; }) {
    let buffer = '';
    let toolCalls = [];

    for await (const part of response) {
        if (part.done === false && part.message.content.length > 0) {
            buffer += part.message.content;
            logUpdate(buffer);
        } else if (part.done === false && part.message.tool_calls && part.message.tool_calls.length > 0) {
            toolCalls = await handleToolCalls(part.message.tool_calls);
        } else if (part.done === true) {
            logUpdate.clear();
            if (toolCalls.length === 0) {
                if (buffer.length == 0 && part.message.content.length > 0) {
                    buffer = part.message.content;
                }
                appendMessage({ role: part.message.role, content: buffer });
                saveHistory();
                process.stdout.write(await marked(buffer));
            } else {
                assistantSay("Calling tools... ");
            }
            buffer = '';
        }
    }
    return toolCalls;
}

async function callTools(tools: string | any[]) {
    for (let i = 0; i < tools.length; i++) {
        const result = await runTool(tools[i].function.name, tools[i].function.arguments);
        if (result) {
            appendMessage({
                role: 'tool',
                content: result.toString()
            });
        }
    }
}

async function main() {
    await registerCommands();
    await loadAllTools();

    const logUpdate = createLogUpdate(process.stdout, {
        showCursor: true
    });

    while (true) {

        process.stdin.setEncoding('utf8');
        process.stdin.setRawMode(true);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const input = await chatPrompt(rl);

        if (input.toLowerCase() === 'exit') {
            clearLines(2);
            process.exit(0);
        }

        const wasCommand = await executeCommand(input, rl);
        if (!wasCommand) {
            assistantSay("");

            const message = { role: 'user', content: input };
            appendMessage(message);
            const response = await ollama.chat({ model: 'devlama', messages: getMessages(), stream: true, tools: getFunctionDefinitions() });

            let toolCalls = await processResponse(response, logUpdate);

            if (toolCalls.length > 0) {
                await callTools(toolCalls);

                // Re-run the chat with updated messages and tool functions
                const updatedResponse = await ollama.chat({ model: 'devlama', messages: getMessages(), stream: true, tools: getFunctionDefinitions() });
                toolCalls = await processResponse(updatedResponse, logUpdate);
            }
        }

        rl.close();
    }
}

main();
