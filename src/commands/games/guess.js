import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('guess')
  .setDescription('Doan so tu 1 den 100 - bot se ra goi y cao/thap')
  .addIntegerOption((opt) =>
    opt
      .setName('so')
      .setDescription('Con so ban doan (1-100)')
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  );

/**
 * Game don gian khong luu trang thai: moi lan goi tao 1 so ngau nhien,
 * va so sanh voi so ban doan. (Choi nhanh, vui la chinh.)
 * Muon doan nhieu luot 1 so co dinh thi can luu state theo user - co the mo rong sau.
 */
export async function execute(interaction) {
  const guess = interaction.options.getInteger('so');
  const target = 1 + Math.floor(Math.random() * 100);

  let result;
  if (guess === target) {
    result = `🎯 **Chinh xac!** So la **${target}**. Ban gioi qua!`;
  } else {
    const diff = Math.abs(guess - target);
    let hint;
    if (diff <= 5) hint = 'rat gan!';
    else if (diff <= 15) hint = 'kha gan';
    else hint = 'con xa lam';
    const direction = guess < target ? 'cao hon ⬆️' : 'thap hon ⬇️';
    result = `❌ Sai roi! So dung la **${target}**.\nBan doan ${direction}, ${hint}`;
  }

  await interaction.reply(result);
}
