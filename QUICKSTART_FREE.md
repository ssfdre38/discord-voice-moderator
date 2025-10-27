# Quick Start Guide - FREE Multi-Channel Version

## 🚀 Super Fast Setup

### 1. Install FFmpeg
```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

### 2. Configure Bot
```bash
cp .env.example .env
nano .env
```

Add your Discord bot token:
```env
DISCORD_TOKEN=your_bot_token_here
AUTO_MONITOR=false
```

### 3. Start Bot
```bash
npm start
```

**First run**: Downloads AI model (~100MB) - happens once
**After that**: Starts instantly!

## 🎮 Commands

| Command | What It Does |
|---------|--------------|
| `!monitor` | Start monitoring your voice channel |
| `!stop` | Stop monitoring your voice channel |
| `!stopall` | Stop monitoring ALL channels |
| `!status` | Show what's being monitored |

## 🔥 Multi-Channel Example

```
Admin joins "Gaming" voice → !monitor
Admin joins "Music" voice → !monitor  
Admin joins "Study" voice → !monitor

!status
> Monitoring 3 channel(s):
> • Gaming (5 users)
> • Music (3 users)
> • Study (2 users)
```

## ⚙️ Key Features

✅ **FREE** - No API costs, runs locally
✅ **Multi-Channel** - Monitor multiple channels simultaneously
✅ **Fast** - Uses lightweight Whisper model
✅ **Automatic** - Auto-kicks violators
✅ **Logging** - Posts to #mod-logs

## 📝 Customize Banned Words

Edit `bot.js` (line 30):
```javascript
const BANNED_PHRASES = [
  'add your',
  'banned words',
  'here'
];
```

## 🤖 How It Works

1. Bot joins voice channel(s) 
2. Records when users speak
3. Converts speech → text (locally, FREE!)
4. Checks for banned words
5. Kicks violators + logs incident

## ⚠️ Important

⚠️ **LEGAL NOTICE**: Read [LEGAL_NOTICE.md](LEGAL_NOTICE.md) before deployment!

- **First run takes 1-2 minutes** (downloads AI model)
- **After that it's instant**
- **All processing is local** (no cloud costs)
- **Can monitor 3-5 channels** comfortably
- **Always inform users** they're being recorded
- **You MUST comply with Discord TOS and local laws**
- **You MUST obtain consent from users**

## 🎯 Test It

1. Start bot: `npm start`
2. Join voice channel
3. Type: `!monitor`
4. Say a banned phrase
5. Bot kicks you + logs it

## 💡 Tips

- Use `AUTO_MONITOR=true` to auto-join all channels
- Use `AUTO_MONITOR=false` for manual control
- Check `!status` to see active monitoring
- Use `!stopall` to reset everything

## 🆘 Troubleshooting

**Bot doesn't hear me**:
- Check bot permissions (Connect, Speak)
- Make sure you're speaking (not muted)

**Model takes forever to load**:
- First run only! Downloads 100MB
- Cached after that

**Bot crashes with multiple channels**:
- Check RAM (needs 2-4GB)
- Try monitoring fewer channels

---

**No API keys. No subscriptions. 100% FREE forever.** 🎉
