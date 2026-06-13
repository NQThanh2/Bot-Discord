import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { randomUUID } from 'node:crypto';
import { addReminder } from '../../utils/store.js';
import { parseTimeOfDay, computeNextDailyTrigger } from '../../utils/parseTime.js';
import { config } from '../../../config.js';

export const data = new SlashCommandBuilder()
  .setName('announce')
  .setDescription('Dat lich thong bao @everyone vao gio co dinh (chi Quan tri server)')
  // Chi thanh vien co quyen "Manage Server" moi thay & dung duoc lenh nay
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addStringOption((opt) =>
    opt
      .setName('gio')
      .setDescription('Gio trong ngay dang HH:MM (vd 8:00, 18:30)')
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('noi_dung')
      .setDescription('Noi dung thong bao')
      .setRequired(true)
  )
  .addBooleanOption((opt) =>
    opt
      .setName('lap_lai')
      .setDescription('Lap lai moi ngay? (mac dinh: co). Chon "false" de chi bao 1 lan.')
  )
  .addChannelOption((opt) =>
    opt
      .setName('kenh')
      .setDescription('Kenh se dang thong bao (mac dinh: kenh hien tai)')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
  );

export async function execute(interaction) {
  // Phong ve: kiem tra lai quyen tai thoi diem chay
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      content: '⛔ Ban can quyen **Quan ly may chu (Manage Server)** de dung lenh nay.',
      ephemeral: true,
    });
  }

  const gio = interaction.options.getString('gio');
  const message = interaction.options.getString('noi_dung');
  const repeat = interaction.options.getBoolean('lap_lai') ?? true;
  const channel = interaction.options.getChannel('kenh') ?? interaction.channel;

  const tod = parseTimeOfDay(gio);
  if (!tod) {
    return interaction.reply({
      content: '❌ Gio khong hop le. Dung dinh dang `HH:MM` (24 gio), vd `8:00`, `18:30`.',
      ephemeral: true,
    });
  }

  const offsetHours = config.tzOffsetHours;
  const triggerAt = computeNextDailyTrigger(tod.hour, tod.minute, offsetHours);

  const reminder = {
    id: randomUUID().slice(0, 8),
    userId: interaction.user.id, // nguoi tao (de quan ly/xoa)
    channelId: channel.id,
    guildId: interaction.guildId,
    message,
    createdAt: Date.now(),
    triggerAt,
    target: 'everyone',
    repeat: repeat ? 'daily' : 'once',
    hour: tod.hour,
    minute: tod.minute,
    offsetHours,
  };

  await addReminder(reminder);

  const hhmm = `${String(tod.hour).padStart(2, '0')}:${String(tod.minute).padStart(2, '0')}`;
  const tzLabel = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}`;
  const kieu = repeat ? '🔁 Moi ngay' : '🔔 Mot lan';

  const embed = new EmbedBuilder()
    .setColor(0xeb459e)
    .setTitle('📢 Da dat lich thong bao @everyone!')
    .setDescription(`> ${message}`)
    .addFields(
      { name: 'Kenh', value: `${channel}`, inline: true },
      { name: 'Kieu', value: kieu, inline: true },
      { name: 'Gio', value: `**${hhmm}** (${tzLabel})`, inline: true },
      { name: 'Lan toi', value: `<t:${Math.floor(triggerAt / 1000)}:R>`, inline: true },
      { name: 'Ma', value: `\`${reminder.id}\``, inline: true }
    )
    .setFooter({ text: 'Tat bang /delremind ma' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
