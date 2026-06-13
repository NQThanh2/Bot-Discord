import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { randomUUID } from 'node:crypto';
import { addReminder } from '../../utils/store.js';
import { parseDuration, formatDuration } from '../../utils/parseTime.js';

export const data = new SlashCommandBuilder()
  .setName('remind')
  .setDescription('Dat nhac nho sau 1 khoang thoi gian')
  .addStringOption((opt) =>
    opt
      .setName('thoi_gian')
      .setDescription('Vi du: 10s, 5m, 2h, 1d, 1h30m')
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('noi_dung')
      .setDescription('Noi dung can nhac')
      .setRequired(true)
  );

export async function execute(interaction) {
  const timeStr = interaction.options.getString('thoi_gian');
  const message = interaction.options.getString('noi_dung');

  const ms = parseDuration(timeStr);
  if (ms === null) {
    return interaction.reply({
      content:
        '❌ Thoi gian khong hop le. Dung dinh dang: `10s`, `5m`, `2h`, `1d`, hoac ghep `1h30m`. ' +
        '(Toi da 30 ngay)',
      ephemeral: true,
    });
  }

  const triggerAt = Date.now() + ms;
  const reminder = {
    id: randomUUID().slice(0, 8),
    userId: interaction.user.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    message,
    createdAt: Date.now(),
    triggerAt,
  };

  await addReminder(reminder);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle('⏰ Da dat nhac nho!')
    .setDescription(`> ${message}`)
    .addFields(
      { name: 'Sau', value: formatDuration(ms), inline: true },
      { name: 'Luc', value: `<t:${Math.floor(triggerAt / 1000)}:R>`, inline: true },
      { name: 'Ma', value: `\`${reminder.id}\``, inline: true }
    )
    .setFooter({ text: 'Dung /reminders de xem, /delremind de xoa' });

  await interaction.reply({ embeds: [embed] });
}
