require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { addToQueue, playNextInQueue, isPlaying, skipCurrentTrack, pauseCurrentTrack } = require('./musicPlayer');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.once('ready', () => {
  console.log('Bot está online!');
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!play')) {
    const query = message.content.slice(6).trim();

    if (!message.member.voice.channel) {
      return message.channel.send('Você precisa estar em um canal de voz para tocar música!');
    }

    addToQueue(query, message.channel, message.member.voice.channel);

    if (!isPlaying()) {
      await playNextInQueue();
    }
  }

  if (message.content === '!skip') {
    if (isPlaying()) {
      skipCurrentTrack();
    } else {
      message.channel.send('Não há nenhuma música tocando no momento.');
    }
  }

  if (message.content === '!pause') {
    if (isPlaying()) {
      pauseCurrentTrack();
    } else {
      message.channel.send('Não há nenhuma música tocando para pausar.');
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
