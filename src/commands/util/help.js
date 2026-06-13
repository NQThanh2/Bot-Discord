import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Xem danh sach lenh cua bot');

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🤖 Danh sach lenh')
    .setDescription('Bot nhac nho & mini game')
    .addFields(
      {
        name: '⏰ Nhac nho',
        value:
          '`/remind thoi_gian noi_dung` - Dat nhac (vd: `10m`, `2h`, `1d`)\n' +
          '`/reminders` - Xem cac nhac nho cua ban\n' +
          '`/delremind ma` - Xoa 1 nhac nho',
      },
      {
        name: '🎮 Mini game',
        value:
          '`/coinflip` - Tung dong xu\n' +
          '`/dice` - Tung xuc xac\n' +
          '`/rps` - Oan tu ti (keo bua bao)\n' +
          '`/guess` - Doan so 1-100\n' +
          '`/8ball` - Hoi qua cau pha le',
      },
      {
        name: '🛠️ Khac',
        value: '`/ping` - Kiem tra do tre\n`/help` - Bang nay',
      }
    )
    .setFooter({ text: 'Chuc ban vui ve!' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
