// commands/menu.ts
import { assistantSay, chatPrompt, clearConsoleAndScrollbackBuffer } from '../gui/chat-prompt';
import { loadHistory, saveHistory } from '../history';
import readline from 'readline';

export default async function (rl: readline.Interface, args: string[]) {
    clearConsoleAndScrollbackBuffer();
    assistantSay('📋 **Menü**:\n1. Save history\n2. Reload history\n3. ❌ Return to chat');

    while (true) {
        const choice = await chatPrompt(rl);

        switch (choice.trim()) {
            case '1':
                clearConsoleAndScrollbackBuffer();
                saveHistory();
                break;
            case '2':
                clearConsoleAndScrollbackBuffer();
                loadHistory();
                break;
            case '3':
                clearConsoleAndScrollbackBuffer();
                assistantSay('👋 Exit from history...');
                return;
            default:
                assistantSay('❓ Ismeretlen opció, kérlek válassz 1–3 között.');
                break;
        }
    }
}
