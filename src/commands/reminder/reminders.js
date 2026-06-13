import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserReminders } from '../../utils/store.js';

export const data = new SlashCommandBuilder()
  .setName('reminders')
  .setDescription('Xem danh sach nhac nho cua ban');

export async function execute(interaction) {
  const reminders = (await getUserReminders(interaction.user.id))
    .sort((a, b) => a.triggerAt - b.triggerAt);

  if (!reminders.length) {
    return interaction.reply({
      content: '📭 Ban chua co nhac nho nao. Dung `/remind` de tao.',
      ephemeral: true,
    });
  }

  const lines = reminders.slice(0, 25).map((r) => {
    const when = `<t:${Math.floor(r.triggerAt / 1000)}:R>`;
    return `\`${r.id}\` • ${when}\n> ${r.message}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📋 Nhac nho cua ${interaction.user.username}`)
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Tong: ${reminders.length} • Xoa bang /delremind ma` });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
