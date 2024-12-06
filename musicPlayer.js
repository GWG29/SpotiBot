const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, StreamType, AudioPlayerPausedState } = require('@discordjs/voice');
const { getStreamUrl } = require('./utils');
const player = createAudioPlayer();
let connection;
let queue = [];
let playing = false;
let buffer = [];

const playNextInQueue = async () => {
  if (queue.length === 0) {
    playing = false;
    return;
  }

  const { query, channel, voiceChannel } = queue.shift();
  await playMusic(query, channel, voiceChannel);
};

const playMusic = async (query, channel, voiceChannel) => {
  try {
    const streamUrl = await getStreamUrl(query);

    const resource = createAudioResource(streamUrl, {
      inputType: StreamType.Arbitrary,
    });

    if (!connection || !connection.channel || connection.channel.id !== voiceChannel.id) {
      if (connection) connection.destroy();
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('Conexão de voz pronta!');
        player.play(resource);
      });

      connection.subscribe(player);
    } else {
      player.play(resource);
    }

    player.on(AudioPlayerStatus.Playing, () => {
      console.log('Reproduzindo o áudio do YouTube.');
      channel.send(`Reproduzindo: ${query}`);
      playing = true;
    });

    player.on(AudioPlayerStatus.Idle, () => {
      console.log('Reprodução de áudio finalizada.');
      playing = false;
      playNextInQueue();
    });

    bufferNextTracks();
  } catch (error) {
    console.error(`Erro ao buscar e tocar a música: ${error.message}`);
    channel.send('Houve um erro ao obter a música.');
    playing = false;
  }
};

const bufferNextTracks = () => {
  while (buffer.length < 2 && queue.length > 0) {
    const { query } = queue[buffer.length];
    getStreamUrl(query)
      .then(streamUrl => buffer.push(streamUrl))
      .catch(error => console.error(`Erro ao pré-carregar a música: ${error.message}`));
  }
};

const addToQueue = (query, channel, voiceChannel) => {
  queue.push({ query, channel, voiceChannel });
};

const skipCurrentTrack = () => {
  playing = false;
  if (player) {
    player.stop();
  }
  playNextInQueue();
};

const pauseCurrentTrack = () => {
  if (player) {
    player.pause();
  }
};

const isPlaying = () => playing;

module.exports = {
  addToQueue,
  skipCurrentTrack,
  playNextInQueue,
  isPlaying,
  pauseCurrentTrack,
};
