import { SlashCommandBuilder } from 'discord.js';
import { removeReminder } from '../../utils/store.js';

export const data = new SlashCommandBuilder()
  .setName('delremind')
  .setDescription('Xoa 1 nhac nho theo ma')
  .addStringOption((opt) =>
    opt
      .setName('ma')
      .setDescription('Ma reminder (xem bang /reminders)')
      .setRequired(true)
  );

export async function execute(interaction) {
  const id = interaction.options.getString('ma');
  const removed = await removeReminder(id, interaction.user.id);

  if (!removed) {
    return interaction.reply({
      content: `❌ Khong tim thay nhac nho voi ma \`${id}\` (hoac khong phai cua ban).`,
      ephemeral: true,
    });
  }

  await interaction.reply({
    content: `🗑️ Da xoa nhac nho \`${id}\`: "${removed.message}"`,
    ephemeral: true,
  });
}
