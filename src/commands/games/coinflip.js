import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Tung dong xu: ngua hay sap?');

export async function execute(interaction) {
  const result = Math.random() < 0.5 ? 'Ngua 🦅' : 'Sap 🪙';
  await interaction.reply(`🪙 Dong xu xoay tit... **${result}**!`);
}
