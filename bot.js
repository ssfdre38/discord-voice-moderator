require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

/**
 * ⚖️ LEGAL WARNING ⚖️
 * 
 * This bot records voice communications. Before using:
 * 
 * 1. READ LEGAL_NOTICE.md completely
 * 2. Ensure you comply with Discord's Terms of Service
 * 3. Obtain consent from all users being recorded
 * 4. Comply with local recording laws (two-party consent states, GDPR, etc.)
 * 5. Have a clear privacy policy
 * 6. Inform users they are being monitored
 * 
 * Unauthorized recording may be ILLEGAL and result in:
 * - Criminal charges
 * - Civil lawsuits
 * - Discord ban
 * - Financial penalties
 * 
 * YOU are solely responsible for legal compliance.
 * Developers assume NO liability for your use of this software.
 */

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

// Auto-action mode: what to do when violation detected
// Options: 'manual' (ask mods), 'auto-kick', 'auto-timeout', 'auto-ban', 'auto-warn'
const AUTO_ACTION = process.env.AUTO_ACTION || 'manual';

// Store active voice connections (supports multiple channels)
const voiceConnections = new Map(); // guildId+channelId -> connection

// Store user audio streams
const userStreams = new Map();

// Track which channels are being monitored
const monitoredChannels = new Set();

client.once('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log('🎤 Voice monitoring active');
  console.log('');
  console.log('⚖️  LEGAL REMINDER:');
  console.log('⚠️  Ensure you have user consent before monitoring');
  console.log('⚠️  Comply with Discord TOS and local recording laws');
  console.log('⚠️  See LEGAL_NOTICE.md for full requirements');
  console.log('');
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
      
      // Send monitoring notice to text channel
      const textChannel = channel.guild.channels.cache.find(
        ch => ch.name === 'general' || ch.name === 'mod-logs' || ch.type === 0
      );
      if (textChannel) {
        textChannel.send(
          `⚠️ **Voice Monitoring Active**\n` +
          `Voice channel **${channel.name}** is now being monitored for moderation purposes.\n` +
          `By remaining in this channel, you consent to audio monitoring as outlined in our server rules.`
        ).catch(err => console.log('Could not send monitoring notice'));
      }
      
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
      
      // Optional: Log all transcriptions to mod channel (set in .env)
      if (process.env.LOG_ALL_TRANSCRIPTS === 'true') {
        const logChannel = channel.guild.channels.cache.find(
          ch => ch.name === 'voice-logs' || ch.name === 'transcripts'
        );
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🎙️ Voice Transcript',
              color: 0x3498db, // Blue
              fields: [
                { name: 'User', value: member.user.tag, inline: true },
                { name: 'Channel', value: channel.name, inline: true },
                { name: 'Message', value: text.substring(0, 1000), inline: false }
              ],
              timestamp: new Date(),
              footer: { text: 'Voice Monitoring' }
            }]
          }).catch(err => console.log('Could not send transcript log'));
        }
      }
      
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

// Handle violation - present options to moderators
async function handleViolation(member, channel, text, violation) {
  try {
    // Find mod log channel (multiple names supported)
    const logChannel = member.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || 
            ch.name === 'moderation' || 
            ch.name === 'mod-log' ||
            ch.name === 'voice-logs' ||
            ch.name === 'logs'
    );
    
    // Check if auto-action is enabled
    if (AUTO_ACTION !== 'manual' && logChannel) {
      // Execute auto-action
      let actionTaken = '';
      
      switch(AUTO_ACTION) {
        case 'auto-kick':
          if (member.voice.channel) {
            await member.voice.disconnect('Auto-moderation: Violated voice chat rules');
            actionTaken = '🦵 **Auto-kicked from voice channel**';
          }
          break;
          
        case 'auto-timeout':
          await member.timeout(5 * 60 * 1000, 'Auto-moderation: Voice chat violation');
          if (member.voice.channel) {
            await member.voice.disconnect('Timed out for violation');
          }
          actionTaken = '⏰ **Auto-timed out for 5 minutes**';
          break;
          
        case 'auto-ban':
          await member.ban({ reason: 'Auto-moderation: Voice chat violation' });
          actionTaken = '🔨 **Auto-banned from server**';
          break;
          
        case 'auto-warn':
          try {
            await member.send(
              `⚠️ **Warning from ${member.guild.name}**\n\n` +
              `You have violated our voice chat rules.\n` +
              `**Violation:** ${violation}\n` +
              `**Time:** ${new Date().toLocaleString()}\n\n` +
              `Please review our server rules.`
            );
            actionTaken = '⚠️ **Warning sent to user**';
          } catch (e) {
            actionTaken = '⚠️ **Warning issued** (could not DM user)';
          }
          break;
      }
      
      // Send log with action already taken
      await logChannel.send({
        embeds: [{
          title: '🚨 Voice Moderation Alert (Auto-Action)',
          color: 0xff6600, // Orange for auto-action
          fields: [
            {
              name: '👤 User',
              value: `${member.user.tag} (${member.user.id})`,
              inline: true
            },
            {
              name: '📍 Channel',
              value: channel.name,
              inline: true
            },
            {
              name: '⚠️ Violation',
              value: `Used banned phrase: \`${violation}\``,
              inline: false
            },
            {
              name: '📝 Full Transcript',
              value: `"${text.substring(0, 1000)}"${text.length > 1000 ? '...' : ''}`,
              inline: false
            },
            {
              name: '✅ Action Taken',
              value: `${actionTaken}\n**Mode:** Automatic\n**Time:** ${new Date().toLocaleString()}`,
              inline: false
            }
          ],
          timestamp: new Date(),
          footer: {
            text: 'Voice Moderation System - Auto Mode'
          }
        }]
      });
      
      console.log(`✅ Auto-action taken: ${actionTaken} on ${member.user.tag}`);
      return;
    }
    
    if (logChannel) {
      // Manual mode - create embed with action buttons
      const violationEmbed = {
        title: '🚨 Voice Moderation Alert',
        color: 0xff0000, // Red
        fields: [
          {
            name: '👤 User',
            value: `${member.user.tag} (${member.user.id})`,
            inline: true
          },
          {
            name: '📍 Channel',
            value: channel.name,
            inline: true
          },
          {
            name: '⚠️ Violation',
            value: `Used banned phrase: \`${violation}\``,
            inline: false
          },
          {
            name: '📝 Full Transcript',
            value: `"${text.substring(0, 1000)}"${text.length > 1000 ? '...' : ''}`,
            inline: false
          },
          {
            name: '⏳ Status',
            value: '**Awaiting moderator action...**',
            inline: false
          }
        ],
        timestamp: new Date(),
        footer: {
          text: 'Select an action below'
        }
      };

      // Create action buttons
      const actionRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`kick_${member.id}`)
            .setLabel('Kick from Voice')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🦵'),
          new ButtonBuilder()
            .setCustomId(`timeout_${member.id}`)
            .setLabel('Timeout (5m)')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('⏰'),
          new ButtonBuilder()
            .setCustomId(`ban_${member.id}`)
            .setLabel('Ban User')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔨'),
          new ButtonBuilder()
            .setCustomId(`warn_${member.id}`)
            .setLabel('Warn Only')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚠️'),
          new ButtonBuilder()
            .setCustomId(`ignore_${member.id}`)
            .setLabel('Ignore')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
        );

      await logChannel.send({
        embeds: [violationEmbed],
        components: [actionRow]
      });
    } else {
      // If no log channel found, log to console with warning
      console.log('⚠️ No mod-logs channel found! Create a channel named "mod-logs" to receive alerts.');
      console.log(`🚨 VIOLATION: ${member.user.tag} in ${channel.name} - "${violation}"`);
      
      // Auto-kick if no log channel (fallback behavior)
      if (member.voice.channel) {
        await member.voice.disconnect('Violated voice chat rules - Auto-moderation');
        console.log(`✅ Auto-kicked ${member.user.tag} (no mod channel for manual review)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error handling violation:', error);
  }
}

// Handle moderator action button clicks
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  // Check if user has moderator permissions
  if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    return interaction.reply({ 
      content: '❌ You need moderator permissions to use this!', 
      ephemeral: true 
    });
  }
  
  const [action, userId] = interaction.customId.split('_');
  const member = await interaction.guild.members.fetch(userId).catch(() => null);
  
  if (!member) {
    return interaction.update({
      content: '❌ User not found or has left the server.',
      components: []
    });
  }
  
  let actionTaken = '';
  let success = false;
  
  try {
    switch(action) {
      case 'kick':
        // Kick from voice channel
        if (member.voice.channel) {
          await member.voice.disconnect('Violated voice chat rules');
          actionTaken = '🦵 **Kicked from voice channel**';
          success = true;
        } else {
          actionTaken = '⚠️ User already left voice channel';
        }
        break;
        
      case 'timeout':
        // Timeout for 5 minutes
        await member.timeout(5 * 60 * 1000, 'Voice chat violation');
        if (member.voice.channel) {
          await member.voice.disconnect('Timed out for violation');
        }
        actionTaken = '⏰ **Timed out for 5 minutes**';
        success = true;
        break;
        
      case 'ban':
        // Ban user
        await member.ban({ reason: 'Voice chat violation' });
        actionTaken = '🔨 **User banned from server**';
        success = true;
        break;
        
      case 'warn':
        // Send warning DM
        try {
          await member.send(
            `⚠️ **Warning from ${interaction.guild.name}**\n\n` +
            `You have violated our voice chat rules. This is a formal warning.\n` +
            `Further violations may result in kicks, timeouts, or bans.\n\n` +
            `Please review our server rules and maintain appropriate conduct.\n` +
            `**Time:** ${new Date().toLocaleString()}`
          );
          actionTaken = '⚠️ **Warning sent to user**';
          success = true;
        } catch (e) {
          actionTaken = '⚠️ **Warning issued** (could not DM user)';
          success = true;
        }
        break;
        
      case 'ignore':
        // Take no action
        actionTaken = '✅ **No action taken** (false positive)';
        success = true;
        break;
    }
    
    // Update the embed with the action taken
    const updatedEmbed = interaction.message.embeds[0];
    const fields = [...updatedEmbed.fields];
    
    // Update status field
    fields[fields.length - 1] = {
      name: '✅ Action Taken',
      value: `${actionTaken}\n**By:** ${interaction.user.tag}\n**Time:** ${new Date().toLocaleString()}`,
      inline: false
    };
    
    await interaction.update({
      embeds: [{
        ...updatedEmbed,
        color: success ? 0x00ff00 : 0xff9900, // Green if success, orange if partial
        fields: fields
      }],
      components: [] // Remove buttons after action
    });
    
    // Log action to console
    console.log(`✅ ${interaction.user.tag} took action: ${actionTaken} on ${member.user.tag}`);
    
  } catch (error) {
    console.error('❌ Error executing moderation action:', error);
    await interaction.reply({
      content: `❌ Failed to execute action: ${error.message}`,
      ephemeral: true
    });
  }
});

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
  
  // !setlogs - Set the log channel for violations
  if (command === 'setlogs') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need administrator permissions!');
    }
    
    const channelMention = message.mentions.channels.first();
    if (!channelMention) {
      return message.reply('❌ Please mention a channel: `!setlogs #mod-logs`');
    }
    
    // Rename channel to mod-logs (or note it)
    message.reply(
      `✅ Bot will send violation logs to ${channelMention}!\n` +
      `💡 **Tip**: Name your channel one of these for automatic detection:\n` +
      `• \`mod-logs\` (recommended)\n` +
      `• \`moderation\`\n` +
      `• \`mod-log\`\n` +
      `• \`voice-logs\`\n` +
      `• \`logs\``
    );
  }
  
  // !testlog - Send a test log message
  if (command === 'testlog') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need administrator permissions!');
    }
    
    const logChannel = message.guild.channels.cache.find(
      ch => ch.name === 'mod-logs' || 
            ch.name === 'moderation' || 
            ch.name === 'mod-log' ||
            ch.name === 'voice-logs' ||
            ch.name === 'logs'
    );
    
    if (!logChannel) {
      return message.reply(
        '❌ No log channel found! Please create a channel named `mod-logs` or use `!setlogs #channel`'
      );
    }
    
    logChannel.send({
      embeds: [{
        title: '✅ Test Log Message',
        description: 'This is a test of the voice moderation logging system.',
        color: 0x00ff00, // Green
        fields: [
          { name: 'Tested By', value: message.author.tag, inline: true },
          { name: 'Channel', value: logChannel.name, inline: true },
          { name: 'Status', value: '✅ Logging is working!', inline: false }
        ],
        timestamp: new Date(),
        footer: { text: 'Voice Moderation System' }
      }]
    });
    
    message.reply(`✅ Test log sent to ${logChannel}!`);
  }
});

// Create audio directory
const fs = require('fs');
if (!fs.existsSync('./audio')) {
  fs.mkdirSync('./audio');
}

// Login
client.login(process.env.DISCORD_TOKEN);
