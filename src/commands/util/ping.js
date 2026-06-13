import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Kiem tra do tre cua bot');

export async function execute(interaction) {
  const sent = await interaction.reply({ content: '🏓 Dang do...', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  await interaction.editReply(
    `🏓 Pong! Do tre: **${latency}ms** | API: **${Math.round(interaction.client.ws.ping)}ms**`
  );
}
