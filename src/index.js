import { Client, GatewayIntentBits, Events, Collection } from 'discord.js';
import { config } from '../config.js';
import { loadCommands } from './handlers/loadCommands.js';
import { startReminderScheduler } from './handlers/reminderScheduler.js';

if (!config.token || !config.clientId) {
  process.exit(1);
}

const client = new Client({
  // Chi can Guilds de chay slash command. Khong can intent dac quyen (privileged).
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

client.once(Events.ClientReady, (c) => {
  console.log(`✅ Da dang nhap voi tai khoan: ${c.user.tag}`);
  console.log(`📊 Dang hoat dong tren ${c.guilds.cache.size} server.`);
  c.user.setActivity('/help | nhac nho & mini game');
  startReminderScheduler(c);
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Xu ly nut bam (mini game tuong tac)
  if (interaction.isButton()) {
    const [commandName] = interaction.customId.split(':');
    const command = client.commands.get(commandName);
    if (command?.handleButton) {
      try {
        await command.handleButton(interaction);
      } catch (err) {
        console.error(`[nut] Loi o ${commandName}:`, err);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[lenh] Loi khi chay /${interaction.commandName}:`, err);
    const reply = { content: '❌ Da co loi xay ra khi chay lenh nay.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

async function main() {
  const commands = await loadCommands();
  for (const [name, command] of commands) {
    client.commands.set(name, command);
  }
  console.log(`📦 Da nap ${commands.size} lenh.`);
  await client.login(config.token);
}

main().catch((err) => {
  console.error('Khong the khoi dong bot:', err);
  process.exit(1);
});
