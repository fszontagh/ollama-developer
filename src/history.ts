import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type Message = {
    role: string;
    content: string;
    tool_calls?: any;
};

export const conversationHistory: Message[] = [];

const CONFIG_PATH = path.join(os.homedir(), '.ollama-developer.history.json');

/**
 * Append a single message to the history
 */
export const appendMessage = (message: Message) => {
    conversationHistory.push(message);
};

/**
 * Append multiple messages to the history
 */
export const appendMessages = (messages: Message[]) => {
    conversationHistory.push(...messages);
};

/**
 * Save conversation history to a file
 */
export const saveHistory = () => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(conversationHistory, null, 2), 'utf-8');
    } catch (err) {
        console.error('Failed to save conversation history:', err);
    }
};

/**
 * Load conversation history from file (overwrites current history)
 */
export const loadHistory = () => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
            const parsed: Message[] = JSON.parse(data);
            conversationHistory.length = 0;
            conversationHistory.push(...parsed);
        }
    } catch (err) {
        console.error('Failed to load conversation history:', err);
    }
};


export function getMessages(): Message[] {
    return conversationHistory;
}