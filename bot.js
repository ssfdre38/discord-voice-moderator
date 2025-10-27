require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const {
  joinVoiceChannel,
  EndBehaviorType,
  VoiceConnectionStatus,
  getVoiceConnection
} = require('@discordjs/voice');
const prism = require('prism-media');
const { createWriteStream } = require('fs');
const { pipeline } = require('stream');
const { AutomaticSpeechRecognitionPipeline, pipeline: transformersPipeline } = require('@xenova/transformers');

// Initialize local Whisper model (FREE - runs locally)
let whisperModel = null;

async function initializeWhisper() {
  console.log('🤖 Loading Whisper model (this may take a minute on first run)...');
  whisperModel = await transformersPipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
  console.log('✅ Whisper model loaded!');
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// Banned words/phrases - configure these
const BANNED_PHRASES = [
  'bad word 1',
  'bad word 2',
  'inappropriate phrase',
  // Add your moderation rules here
];

// Store active voice connections (supports multiple channels)
const voiceConnections = new Map(); // guildId+channelId -> connection

// Store user audio streams
const userStreams = new Map();

// Track which channels are being monitored
const monitoredChannels = new Set();

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log('🎤 Voice monitoring active');
  await initializeWhisper();
});

// Monitor voice state updates
client.on('voiceStateUpdate', async (oldState, newState) => {
  const member = newState.member;
  
  // User joined a voice channel
  if (!oldState.channelId && newState.channelId) {
    console.log(`👤 ${member.user.tag} joined voice channel: ${newState.channel.name}`);
    
    // Auto-join enabled channels (optional - can be configured)
    const autoMonitor = process.env.AUTO_MONITOR === 'true';
    if (autoMonitor) {
      await monitorVoiceChannel(newState.channel);
    }
  }
  
  // User left a voice channel
  if (oldState.channelId && !newState.channelId) {
    console.log(`👋 ${member.user.tag} left voice channel`);
    
    // Check if channel is now empty
    if (oldState.channel && oldState.channel.members.size === 1) {
      const connectionKey = `${oldState.guild.id}-${oldState.channelId}`;
      const connection = voiceConnections.get(connectionKey);
      if (connection) {
        connection.destroy();
        voiceConnections.delete(connectionKey);
        monitoredChannels.delete(oldState.channelId);
        console.log('🔇 Left empty voice channel');
      }
    }
  }
});

// Monitor voice channel (supports multiple simultaneous channels)
async function monitorVoiceChannel(channel) {
  const connectionKey = `${channel.guild.id}-${channel.id}`;
  
  // Check if already monitoring this specific channel
  if (voiceConnections.has(connectionKey)) {
    console.log(`⚠️ Already monitoring ${channel.name}`);
    return;
  }
  
  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true
    });
    
    voiceConnections.set(connectionKey, connection);
    monitoredChannels.add(channel.id);
    
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(`🔊 Connected to voice channel: ${channel.name} (${channel.guild.name})`);
      
      // Start listening to users
      connection.receiver.speaking.on('start', (userId) => {
        listenToUser(connection, userId, channel);
      });
    });
    
    connection.on(VoiceConnectionStatus.Disconnected, () => {
      connection.destroy();
      voiceConnections.delete(connectionKey);
      monitoredChannels.delete(channel.id);
    });
    
  } catch (error) {
    console.error('❌ Error joining voice channel:', error);
  }
}

// Listen to individual user
function listenToUser(connection, userId, channel) {
  const member = channel.guild.members.cache.get(userId);
  if (!member || member.user.bot) return;
  
  console.log(`🎙️ ${member.user.tag} started speaking`);
  
  const audioStream = connection.receiver.subscribe(userId, {
    end: {
      behavior: EndBehaviorType.AfterSilence,
      duration: 1000
    }
  });
  
  const filename = `./audio/${userId}-${Date.now()}.pcm`;
  const outputStream = createWriteStream(filename);
  
  const decoder = new prism.opus.Decoder({
    rate: 48000,
    channels: 2,
    frameSize: 960
  });
  
  pipeline(audioStream, decoder, outputStream, async (error) => {
    if (error) {
      console.error('❌ Pipeline error:', error);
      return;
    }
    
    console.log(`💾 Audio saved: ${filename}`);
    
    // Convert audio to text and check for violations
    await processAudio(filename, member, channel);
  });
}

// Process audio with speech-to-text (FREE local model)
async function processAudio(audioFile, member, channel) {
  try {
    // Convert PCM to WAV for Whisper
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);
    
    const wavFile = audioFile.replace('.pcm', '.wav');
    
    // Convert PCM to WAV (16kHz mono for Whisper)
    await execPromise(
      `ffmpeg -f s16le -ar 48000 -ac 2 -i ${audioFile} -ar 16000 -ac 1 ${wavFile}`
    );
    
    // Transcribe with local Whisper model (NO API COSTS!)
    if (!whisperModel) {
      console.log('⚠️ Whisper model not loaded yet');
      return;
    }
    
    const result = await whisperModel(wavFile);
    const text = result.text.toLowerCase().trim();
    
    if (text.length > 0) {
      console.log(`📝 [${channel.name}] ${member.user.tag}: "${text}"`);
      
      // Check for violations
      const violation = checkForViolations(text);
      
      if (violation) {
        console.log(`⚠️ VIOLATION in ${channel.name}: ${member.user.tag} - "${violation}"`);
        await handleViolation(member, channel, text, violation);
      }
    }
    
    // Cleanup files
    require('fs').unlinkSync(audioFile);
    require('fs').unlinkSync(wavFile);
    
  } catch (error) {
    console.error('❌ Error processing audio:', error);
    // Cleanup on error
    try {
      require('fs').unlinkSync(audioFile);
      const wavFile = audioFile.replace('.pcm', '.wav');
      if (require('fs').existsSync(wavFile)) {
        require('fs').unlinkSync(wavFile);
      }
    } catch (e) {}
  }
}

// Check if text contains banned content
function checkForViolations(text) {
  for (const phrase of BANNED_PHRASES) {
    if (text.includes(phrase.toLowerCase())) {
      return phrase;
    }
  }
  return null;
}

// Handle violation - kick user
async function handleViolation(member, channel, text, violation) {
  try {
    // Send warning message
    const logChannel = member.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || ch.name === 'moderation'
    );
    
    if (logChannel) {
      await logChannel.send({
        content: `🚨 **Voice Moderation Alert**\n` +
                `**User:** ${member.user.tag} (${member.id})\n` +
                `**Channel:** ${channel.name}\n` +
                `**Violation:** Used banned phrase: "${violation}"\n` +
                `**Transcript:** "${text}"\n` +
                `**Action:** User has been kicked from voice`
      });
    }
    
    // Kick from voice channel
    if (member.voice.channel) {
      await member.voice.disconnect('Violated voice chat rules');
      console.log(`✅ Kicked ${member.user.tag} from voice channel`);
    }
    
    // Optionally: send DM to user
    try {
      await member.send(
        `⚠️ You have been removed from the voice channel in **${member.guild.name}** ` +
        `for violating community guidelines. Please review the server rules.`
      );
    } catch (e) {
      console.log('Could not DM user');
    }
    
  } catch (error) {
    console.error('❌ Error handling violation:', error);
  }
}

// Command handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // !monitor - Join voice channel
  if (command === 'monitor') {
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel!');
    }
    
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need administrator permissions!');
    }
    
    await monitorVoiceChannel(message.member.voice.channel);
    message.reply(`✅ Now monitoring voice channel: **${message.member.voice.channel.name}**`);
  }
  
  // !stop - Leave voice channel
  if (command === 'stop') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need administrator permissions!');
    }
    
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel to stop monitoring it!');
    }
    
    const connectionKey = `${message.guild.id}-${message.member.voice.channel.id}`;
    const connection = voiceConnections.get(connectionKey);
    
    if (connection) {
      connection.destroy();
      voiceConnections.delete(connectionKey);
      monitoredChannels.delete(message.member.voice.channel.id);
      message.reply(`✅ Stopped monitoring: **${message.member.voice.channel.name}**`);
    } else {
      message.reply('❌ Not currently monitoring this voice channel!');
    }
  }
  
  // !stopall - Leave all voice channels
  if (command === 'stopall') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need administrator permissions!');
    }
    
    const count = voiceConnections.size;
    
    if (count === 0) {
      return message.reply('❌ Not monitoring any voice channels!');
    }
    
    for (const [key, connection] of voiceConnections) {
      connection.destroy();
    }
    
    voiceConnections.clear();
    monitoredChannels.clear();
    message.reply(`✅ Stopped monitoring ${count} voice channel(s)!`);
  }
  
  // !status - Show monitoring status
  if (command === 'status') {
    if (voiceConnections.size === 0) {
      return message.reply('📊 **Status**: Not monitoring any voice channels');
    }
    
    const channels = [];
    for (const channelId of monitoredChannels) {
      const channel = message.guild.channels.cache.get(channelId);
      if (channel) {
        channels.push(`• ${channel.name} (${channel.members.size - 1} users)`);
      }
    }
    
    message.reply(`📊 **Monitoring ${voiceConnections.size} channel(s)**:\n${channels.join('\n')}`);
  }
});

// Create audio directory
const fs = require('fs');
if (!fs.existsSync('./audio')) {
  fs.mkdirSync('./audio');
}

// Login
client.login(process.env.DISCORD_TOKEN);
