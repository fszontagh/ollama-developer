// commandHandler.ts
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import readline from 'readline';

//const commandsDir = path.resolve(__dirname, 'commands');

type CommandFunction = (rl: readline.Interface, args: string[]) => Promise<void>;

const commands: Map<string, CommandFunction> = new Map();

export async function registerCommands(commandsDir = './dist/commands') {
  const dirPath = path.resolve(commandsDir);
  const files = await fs.readdir(dirPath);

  for (const file of files) {
    if (file.endsWith('.js')) {
      const command_name = '/' + path.basename(file, '.js');
      const command_cmd = path.join(dirPath, file).replace(/\\/g, '/');
      const module = await import(command_cmd);
      let handler: CommandFunction = module.default;

      if (typeof handler !== 'function' && typeof module.default?.default === 'function') {
        handler = module.default.default; // fallback: double default
      }

      if (typeof handler !== 'function') {
        console.warn(`⚠️ A parancs "${command_name}" nem exportál érvényes függvényt (default export).`);
        continue;
      }


      commands.set(command_name, handler);
    }
  }
}


export async function executeCommand(input: string, rl: readline.Interface): Promise<boolean> {
  if (!input.startsWith('/')) return false;

  const [cmd, ...args] = input.trim().split(/\s+/);
  const command = commands.get(cmd);

  if (!command) {
    console.log(`❌ Ismeretlen parancs: ${cmd}`);
    return true;
  }

  try {
    const handler: CommandFunction = command;
    await handler(rl, args);
  } catch (err) {
    console.error(`⚠️ Hiba a parancs (${cmd}) futtatása közben:`, err);
  }

  return true;
}
