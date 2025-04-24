// configManager.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_PATH = path.join(os.homedir(), '.ollama-developer.json');

let config: Record<string, any> = {};

function loadConfig(): void {
  if (fs.existsSync(CONFIG_PATH)) {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    try {
      config = JSON.parse(content);
    } catch (e) {
      console.error('Hibás JSON a config fájlban:', e);
      config = {};
    }
  }
}

function saveConfig(): void {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Nem sikerült menteni a configot:', e);
  }
}

export function getConfig(key: string): any {
  loadConfig();
  return config[key];
}

export function setConfig(key: string, value: any): void {
  loadConfig();
  config[key] = value;
  saveConfig();
}
