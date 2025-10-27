# Discord Voice Moderator Bot - FREE VERSION

A Discord bot that monitors **multiple voice channels simultaneously**, transcribes speech using **FREE local AI**, and automatically kicks users who violate community guidelines.

## 🌟 Key Features

- 🎤 **Multi-Channel Support**: Monitor multiple voice channels at the same time
- 💰 **100% FREE**: Uses local Whisper AI model (no API costs!)
- 🗣️ **Speech-to-Text**: Automatic transcription using Transformers.js
- 🚨 **Auto-Moderation**: Kicks users who use banned words/phrases
- 📝 **Logging**: Detailed moderation logs
- ⚡ **Concurrent Processing**: Handles multiple channels/users simultaneously
- 🔒 **Permission-based**: Admin-only controls

## 📋 Requirements

- Node.js 16.x or higher
- FFmpeg installed on system
- Discord Bot Token
- **NO API keys needed!** Everything runs locally

## 🚀 Installation

### 1. Install FFmpeg

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 2. Install Dependencies

```bash
cd discord-voice-moderator
npm install
```

### 3. Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Go to "Bot" section → "Add Bot"
4. Enable these Privileged Gateway Intents:
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
5. Copy the bot token

### 4. Configure Bot

Create a `.env` file:
```bash
cp .env.example .env
nano .env
```

Add your Discord bot token:
```env
DISCORD_TOKEN=your_discord_bot_token_here
AUTO_MONITOR=false
```

**AUTO_MONITOR options**:
- `false` = Manual control with `!monitor` command
- `true` = Auto-join when users enter voice channels

### 5. Customize Moderation Rules

Edit `bot.js` (lines 30-35):
```javascript
const BANNED_PHRASES = [
  'your banned',
  'words here',
  'inappropriate content',
];
```

### 6. Invite Bot to Server

Use this URL (replace `YOUR_CLIENT_ID`):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=19530752&scope=bot
```

Required permissions:
- Connect
- Speak
- Use Voice Activity
- Kick Members
- Send Messages
- Read Message History

## 🎮 Usage

### Start the Bot

```bash
npm start
```

First run will download the Whisper model (~100MB) - this happens once.

### Commands (Admin Only)

| Command | Description |
|---------|-------------|
| `!monitor` | Join and monitor your current voice channel |
| `!stop` | Stop monitoring your current voice channel |
| `!stopall` | Stop monitoring ALL voice channels |
| `!status` | Show which channels are being monitored |

### How It Works

1. Bot joins voice channel(s)
2. Listens to each user speaking
3. Converts speech to text locally (FREE!)
4. Checks text for banned phrases
5. Takes action if violation detected:
   - Kicks user from voice
   - Logs to #mod-logs channel
   - Sends DM warning to user

## 🔧 Multi-Channel Support

The bot can monitor **multiple voice channels simultaneously**:

```bash
# Admin in Channel 1
!monitor

# Admin in Channel 2  
!monitor

# Admin in Channel 3
!monitor

# Check status
!status
# Output: Monitoring 3 channel(s)
```

Each channel is processed independently with its own connection.

## 📊 Example Scenarios

### Scenario 1: Monitor Multiple Channels
```
User A joins "Gaming Chat" → Admin types !monitor
User B joins "Music Chat" → Admin types !monitor
Bot now monitors both channels simultaneously
```

### Scenario 2: Automatic Violation Handling
```
User says banned phrase in "Gaming Chat"
→ Bot transcribes: "user said bad word"
→ Bot detects violation
→ User kicked from voice
→ Log sent to #mod-logs
```

### Scenario 3: Stop Specific Channel
```
Admin in "Gaming Chat" types !stop
→ Bot leaves "Gaming Chat"
→ Bot continues monitoring "Music Chat"
```

## ⚙️ Configuration

### Adjust Silence Detection

In `bot.js` → `listenToUser()`:
```javascript
end: {
  behavior: EndBehaviorType.AfterSilence,
  duration: 1000  // milliseconds (1 second)
}
```

### Audio Quality Settings

In `bot.js` → `listenToUser()`:
```javascript
const decoder = new prism.opus.Decoder({
  rate: 48000,     // Sample rate
  channels: 2,     // Stereo
  frameSize: 960   // Frame size
});
```

### Change Whisper Model

In `bot.js` → `initializeWhisper()`:
```javascript
// Options (from fastest/least accurate to slowest/most accurate):
// 'Xenova/whisper-tiny.en'      ← Default (fast, good for real-time)
// 'Xenova/whisper-base.en'      ← Better accuracy
// 'Xenova/whisper-small.en'     ← Best accuracy (slower)
```

## 🛠️ Troubleshooting

### Bot doesn't hear audio
- Ensure bot has "Connect" and "Speak" permissions
- Check voice channel isn't at user limit
- Verify `selfDeaf: false` in code

### Model loading is slow
- First run downloads model (~100MB)
- Model is cached locally after first download
- Subsequent runs are fast

### FFmpeg errors
```bash
# Check FFmpeg is installed
ffmpeg -version

# Ensure it's in PATH
which ffmpeg  # Linux/Mac
where ffmpeg  # Windows
```

### Bot crashes on multiple channels
- Check system resources (CPU/RAM)
- Consider using faster Whisper model
- Increase silence detection duration

## 💡 Performance Tips

1. **Model Selection**: Use `whisper-tiny.en` for real-time (default)
2. **Silence Duration**: Increase to reduce processing load
3. **Channel Limit**: Monitor 3-5 channels max per bot instance
4. **Hardware**: 4GB RAM minimum, 8GB recommended

## 🔒 Legal & Privacy

⚠️ **Important Warnings**:

1. **Recording Laws**: Voice recording may be illegal without consent in your jurisdiction
2. **User Notice**: Always inform users they are being recorded
3. **Data Privacy**: Comply with GDPR, CCPA, and local privacy laws
4. **Discord TOS**: Ensure compliance with Discord's Terms of Service
5. **Consent**: Consider requiring user consent before monitoring

**Recommended**: Add a message when bot joins:
```
"⚠️ This voice channel is being monitored for moderation purposes. 
By staying in this channel, you consent to audio monitoring."
```

## 📈 Cost Comparison

| Solution | Cost | Speed |
|----------|------|-------|
| **This Bot (Local Whisper)** | $0 | Fast |
| OpenAI Whisper API | ~$0.006/min | Very Fast |
| Google Speech-to-Text | ~$0.006/min | Very Fast |
| Azure Speech | ~$0.001/min | Fast |

**This bot costs $0** and runs entirely on your hardware!

## 🚀 Advanced Features

### Add Database Logging
```bash
npm install better-sqlite3
```

### Add Web Dashboard
```bash
npm install express ejs
```

### Use Better Model Accuracy
Change to `whisper-small.en` for better transcription (slower)

## 📚 Resources

- Discord.js Docs: https://discord.js.org
- Transformers.js: https://huggingface.co/docs/transformers.js
- FFmpeg: https://ffmpeg.org/documentation.html

## 🤝 Support

Having issues? Check:
1. Bot has proper permissions
2. FFmpeg is installed and in PATH
3. Enough disk space for audio files
4. Node.js version 16+

## 📄 License

MIT License - Use at your own risk

## ⚖️ Disclaimer

This bot is for **educational purposes only**. You are responsible for:
- Legal compliance with recording laws
- User privacy and consent
- Appropriate use of moderation
- Following Discord's Terms of Service

**Use responsibly, ethically, and legally.**

---

## 🎯 Quick Start Summary

1. Install FFmpeg
2. `npm install`
3. Create `.env` with Discord token
4. `npm start`
5. Join voice channel
6. Type `!monitor`
7. Bot monitors and moderates automatically!

**No API costs. No subscriptions. 100% FREE. Multiple channels supported.** ✨
