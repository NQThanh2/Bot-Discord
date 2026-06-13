import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, '..', 'commands');

/**
 * Doc tat ca file lenh trong cac thu muc con cua src/commands.
 * Moi file phai export { data, execute }.
 * Tra ve Map<string, command>.
 */
export async function loadCommands() {
  const commands = new Map();
  const categories = await readdir(COMMANDS_DIR, { withFileTypes: true });

  for (const category of categories) {
    if (!category.isDirectory()) continue;
    const categoryPath = join(COMMANDS_DIR, category.name);
    const files = (await readdir(categoryPath)).filter((f) => f.endsWith('.js'));

    for (const file of files) {
      const filePath = pathToFileURL(join(categoryPath, file)).href;
      const command = await import(filePath);
      if (command.data && command.execute) {
        commands.set(command.data.name, command);
      } else {
        console.warn(`[lenh] Bo qua ${category.name}/${file}: thieu "data" hoac "execute".`);
      }
    }
  }

  return commands;
}
