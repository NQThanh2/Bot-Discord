import { SlashCommandBuilder } from 'discord.js';

const ANSWERS = [
  'Chac chan roi 👍',
  'Khong nghi ngo gi nua ✅',
  'Co the lam 🤔',
  'Trien vong tot 🌟',
  'Cu thu di 🎯',
  'Hmm... chua chac 😶',
  'Hoi lai sau nhe ⏳',
  'Toi khong chac dau 🤷',
  'Dung trong cho 🙅',
  'Kho day, kha nang thap 📉',
  'Tuyet doi khong ❌',
  'Dau hieu cho thay: Co ✨',
];

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Hoi qua cau pha le 8 bi an')
  .addStringOption((opt) =>
    opt
      .setName('cau_hoi')
      .setDescription('Cau hoi cua ban')
      .setRequired(true)
  );

export async function execute(interaction) {
  const question = interaction.options.getString('cau_hoi');
  const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
  await interaction.reply(`🎱 **Cau hoi:** ${question}\n**Tra loi:** ${answer}`);
}
