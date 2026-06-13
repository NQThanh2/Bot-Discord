import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';

const CHOICES = {
  keo: { emoji: '✂️', label: 'Keo', beats: 'bao' },
  bua: { emoji: '🪨', label: 'Bua', beats: 'keo' },
  bao: { emoji: '📄', label: 'Bao', beats: 'bua' },
};

export const data = new SlashCommandBuilder()
  .setName('rps')
  .setDescription('Oan tu ti voi bot (keo - bua - bao)');

export async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    Object.entries(CHOICES).map(([key, c]) =>
      new ButtonBuilder()
        .setCustomId(`rps:${key}:${interaction.user.id}`)
        .setLabel(c.label)
        .setEmoji(c.emoji)
        .setStyle(ButtonStyle.Primary)
    )
  );

  await interaction.reply({
    content: '✊ **Oan tu ti!** Chon di nao:',
    components: [row],
  });
}

export async function handleButton(interaction) {
  const [, choice, ownerId] = interaction.customId.split(':');

  if (interaction.user.id !== ownerId) {
    return interaction.reply({
      content: '⛔ Day la van choi cua nguoi khac. Dung `/rps` de tu choi nhe!',
      ephemeral: true,
    });
  }

  const botChoice = Object.keys(CHOICES)[Math.floor(Math.random() * 3)];
  const player = CHOICES[choice];
  const bot = CHOICES[botChoice];

  let result;
  if (choice === botChoice) result = '🤝 **Hoa!**';
  else if (player.beats === botChoice) result = '🎉 **Ban thang!**';
  else result = '😢 **Ban thua!**';

  await interaction.update({
    content:
      `Ban: ${player.emoji} ${player.label}  vs  Bot: ${bot.emoji} ${bot.label}\n${result}`,
    components: [],
  });
}
