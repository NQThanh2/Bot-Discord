import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('dice')
  .setDescription('Tung xuc xac')
  .addIntegerOption((opt) =>
    opt
      .setName('mat')
      .setDescription('So mat cua xuc xac (mac dinh 6)')
      .setMinValue(2)
      .setMaxValue(1000)
  )
  .addIntegerOption((opt) =>
    opt
      .setName('so_luong')
      .setDescription('So vien xuc xac (mac dinh 1, toi da 10)')
      .setMinValue(1)
      .setMaxValue(10)
  );

export async function execute(interaction) {
  const sides = interaction.options.getInteger('mat') ?? 6;
  const count = interaction.options.getInteger('so_luong') ?? 1;

  const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides));
  const total = rolls.reduce((a, b) => a + b, 0);

  let reply = `🎲 Tung ${count}d${sides}: ${rolls.map((r) => `**${r}**`).join(', ')}`;
  if (count > 1) reply += `\nTong cong: **${total}**`;

  await interaction.reply(reply);
}
