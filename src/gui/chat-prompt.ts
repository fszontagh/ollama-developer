import * as readline from 'readline';
import chalk from 'chalk';
import { marked } from 'marked';
import TerminalRenderer from "marked-terminal";
import { clearLines } from '../utils/console';

marked.setOptions({
  renderer: new TerminalRenderer({
    headingCenter: false,  // Ne igazítsa középre a fejlécet
  })
});

export function clearConsoleAndScrollbackBuffer() {
  process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
  console.clear();
}

function getLabel(role: 'user' | 'assistant') {
  let label = role === 'user' ? chalk.blue('user:') : chalk.yellow('assistant:');
  return label;
}

function getTimestamp() {
  const now = new Date();
  return chalk.gray(`[${now.toLocaleTimeString()}]`);
}

function writeMessage(role: 'user' | 'assistant', text: string) {
  if (role == 'user') {
    clearLines(1);
  }
  const label = getLabel(role).trim();
  const timestamp = getTimestamp();
  process.stdout.write(`${timestamp} ${label} ${text.trim()}\n`);
}

export async function chatPrompt(rl: readline.Interface): Promise<string> {

  return new Promise((resolve) => {
    let label = getLabel('user');
    rl.question(label + ' ', (answer) => {
      writeMessage('user', answer);
      resolve(answer);
    });
  });
}

export async function assistantSayChunks(chunks: string[]) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    writeMessage('assistant', chunk);
    if (i < chunks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms szünet
    }
  }
}

export function assistantSay(text: string) {
  writeMessage('assistant', text);
}
