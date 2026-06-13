import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { randomUUID } from 'node:crypto';
import { addReminder } from '../../utils/store.js';
import { parseTimeOfDay, computeNextDailyTrigger } from '../../utils/parseTime.js';
import { config } from '../../../config.js';

export const data = new SlashCommandBuilder()
  .setName('dailyremind')
  .setDescription('Dat nhac LAP LAI vao 1 gio co dinh moi ngay')
  .addStringOption((opt) =>
    opt
      .setName('gio')
      .setDescription('Gio trong ngay dang HH:MM (vd 7:00, 21:30)')
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('noi_dung')
      .setDescription('Noi dung can nhac')
      .setRequired(true)
  );

export async function execute(interaction) {
  const gio = interaction.options.getString('gio');
  const message = interaction.options.getString('noi_dung');

  const tod = parseTimeOfDay(gio);
  if (!tod) {
    return interaction.reply({
      content: '❌ Gio khong hop le. Dung dinh dang `HH:MM` (24 gio), vd `7:00`, `21:30`.',
      ephemeral: true,
    });
  }

  const offsetHours = config.tzOffsetHours;
  const triggerAt = computeNextDailyTrigger(tod.hour, tod.minute, offsetHours);

  const reminder = {
    id: randomUUID().slice(0, 8),
    userId: interaction.user.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    message,
    createdAt: Date.now(),
    triggerAt,
    repeat: 'daily',
    hour: tod.hour,
    minute: tod.minute,
    offsetHours,
  };

  await addReminder(reminder);

  const hhmm = `${String(tod.hour).padStart(2, '0')}:${String(tod.minute).padStart(2, '0')}`;
  const tzLabel = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;

  const embed = new EmbedBuilder()
    .setColor(0xfee75c)
    .setTitle('🔁 Da dat nhac hang ngay!')
    .setDescription(`> ${message}`)
    .addFields(
      { name: 'Moi ngay luc', value: `**${hhmm}** (${tzLabel})`, inline: true },
      { name: 'Lan toi', value: `<t:${Math.floor(triggerAt / 1000)}:R>`, inline: true },
      { name: 'Ma', value: `\`${reminder.id}\``, inline: true }
    )
    .setFooter({ text: 'Dung /reminders de xem, /delremind de tat' });

  await interaction.reply({ embeds: [embed] });
}
