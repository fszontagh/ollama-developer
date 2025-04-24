// commands/menu.ts
import { assistantSay, chatPrompt } from '../gui/chat-prompt';
import readline from 'readline';

export default async function (rl: readline.Interface) {
  assistantSay('📋 **Menü**:\n1. 🍞 Kenyér betöltése\n2. 🧠 Agy optimalizálása\n3. ❌ Kilépés');

  while (true) {
    const choice = await chatPrompt(rl);

    switch (choice.trim()) {
      case '1':
        assistantSay('🥖 Kenyér betöltése folyamatban... Kész!');
        break;
      case '2':
        assistantSay('🧠 Agy újrakalibrálása... ✅ Sikeres!');
        break;
      case '3':
        assistantSay('👋 Kilépés a menüből.');
        return;
      default:
        assistantSay('❓ Ismeretlen opció, kérlek válassz 1–3 között.');
        break;
    }
  }
}
