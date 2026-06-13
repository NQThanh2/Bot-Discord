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
    const hhmm =
      r.hour != null
        ? `${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')}`
        : null;

    if (r.target === 'everyone') {
      const lap = r.repeat === 'daily' ? `hang ngay ${hhmm}` : `mot lan ${hhmm}`;
      return `\`${r.id}\` 📢 **@everyone ${lap}** (lan toi ${when})\n> ${r.message}`;
    }
    if (r.repeat === 'daily') {
      return `\`${r.id}\` 🔁 **hang ngay ${hhmm}** (lan toi ${when})\n> ${r.message}`;
    }
    return `\`${r.id}\` 🔔 ${when}\n> ${r.message}`;
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📋 Nhac nho cua ${interaction.user.username}`)
    .setDescription(lines.join('\n\n'))
    .setFooter({ text: `Tong: ${reminders.length} • Xoa bang /delremind ma` });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
