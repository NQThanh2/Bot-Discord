import { REST, Routes } from 'discord.js';
import { config } from '../config.js';
import { loadCommands } from './handlers/loadCommands.js';

/**
 * Dang ky slash command voi Discord.
 * - Neu co GUILD_ID: dang ky cho rieng server do (cap nhat tuc thi, tien test).
 * - Neu khong: dang ky global (ap dung moi server, co the mat toi ~1 gio).
 */
async function deploy() {
  if (!config.token || !config.clientId) {
    console.error('Thieu DISCORD_TOKEN hoac CLIENT_ID trong .env');
    process.exit(1);
  }

  const commandsMap = await loadCommands();
  const body = [...commandsMap.values()].map((c) => c.data.toJSON());

  const rest = new REST().setToken(config.token);

  try {
    if (config.guildId) {
      const data = await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body }
      );
      console.log(`✅ Da dang ky ${data.length} lenh cho server ${config.guildId} (tuc thi).`);
    } else {
      const data = await rest.put(
        Routes.applicationCommands(config.clientId),
        { body }
      );
      console.log(`✅ Da dang ky ${data.length} lenh GLOBAL (co the mat ~1 gio de hien tren moi server).`);
    }
  } catch (err) {
    console.error('Loi khi dang ky lenh:', err);
    process.exit(1);
  }
}

deploy();
