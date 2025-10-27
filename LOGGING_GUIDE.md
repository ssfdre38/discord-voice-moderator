# Logging & Moderation Setup Guide

## 📋 Setting Up Log Channels

The bot can send detailed logs to a Discord channel for moderators to review.

### Quick Setup

1. **Create a log channel** in your Discord server:
   - Name it one of: `mod-logs`, `moderation`, `mod-log`, `voice-logs`, or `logs`
   - The bot will automatically find it

2. **Test it works**:
   ```
   !testlog
   ```
   This sends a test message to your log channel

### Supported Channel Names

The bot automatically detects these channel names (in order of priority):
- `mod-logs` ⭐ **Recommended**
- `moderation`
- `mod-log`
- `voice-logs`
- `logs`

### Manual Channel Setup

If you want to use a different channel name:

1. Create your channel (e.g., `#bot-logs`)
2. Use the command:
   ```
   !setlogs #bot-logs
   ```
3. Rename the channel to one of the supported names above

## 📊 What Gets Logged

### Violation Logs (Always Sent)

When a user violates rules, moderators receive:

```
🚨 Voice Moderation Alert

👤 User: BadUser#1234 (123456789)
📍 Channel: Gaming Voice
⚠️ Violation: Used banned phrase: `bad word`
📝 Full Transcript: "user said bad word here"
🔨 Action Taken: User kicked from voice channel

Timestamp: 2025-10-27 8:30 PM
```

### Optional: All Transcripts

To log **every** voice message (not just violations):

1. Create a channel named `voice-logs` or `transcripts`
2. Edit your `.env` file:
   ```env
   LOG_ALL_TRANSCRIPTS=true
   ```
3. Restart the bot

**Warning**: This can be very spammy! Only enable for specific monitoring needs.

## 🛠️ Commands

| Command | Description | Example |
|---------|-------------|---------|
| `!testlog` | Send test message to log channel | `!testlog` |
| `!setlogs #channel` | Set which channel to use for logs | `!setlogs #mod-logs` |
| `!status` | Show monitoring status | `!status` |

## 📝 Log Message Format

### Violation Logs
- **Embedded Message** - Rich, colorful formatting
- **Red Color** - Indicates a violation
- **User Info** - Tag and ID for easy lookup
- **Channel** - Which voice channel it happened in
- **Violation** - What banned phrase was used
- **Full Transcript** - Complete message (up to 1000 chars)
- **Action** - What the bot did (kicked user)
- **Timestamp** - When it occurred

### Regular Transcript Logs (if enabled)
- **Embedded Message** - Rich formatting
- **Blue Color** - Regular transcript
- **User** - Who spoke
- **Channel** - Where they spoke
- **Message** - What they said
- **Timestamp** - When it occurred

## 🔒 Permissions

Make sure your log channel has proper permissions:

### Bot Needs:
- ✅ View Channel
- ✅ Send Messages
- ✅ Embed Links
- ✅ Read Message History

### Moderators Should Have:
- ✅ View Channel
- ✅ Read Message History
- ❌ Send Messages (optional - can be read-only)

### Regular Users Should Have:
- ❌ View Channel (hidden from normal users)

## 📊 Example Log Channel Setup

### Step-by-Step

1. **Create Channel**:
   ```
   Right-click server → Create Channel → Text Channel
   Name: mod-logs
   ```

2. **Set Permissions**:
   - **@everyone**: ❌ View Channel (disabled)
   - **Moderator Role**: ✅ View Channel, ✅ Read Message History
   - **Bot**: ✅ View Channel, ✅ Send Messages, ✅ Embed Links

3. **Test It**:
   ```
   !testlog
   ```
   You should see a green test message

4. **Start Monitoring**:
   ```
   Join voice channel
   !monitor
   ```

## 🎯 Best Practices

### 1. Separate Channels
Create different channels for different types of logs:
- `#mod-logs` - Violations only
- `#voice-logs` - All transcripts (if enabled)
- `#bot-logs` - Bot system messages

### 2. Regular Review
- Check logs daily
- Review false positives
- Update banned phrases as needed

### 3. Archive Old Logs
- Regularly archive old messages
- Keep logs for accountability
- Follow data retention policies

### 4. Moderator Training
- Train mods on interpreting logs
- Establish response procedures
- Document escalation process

## 🚨 Troubleshooting

### Bot not sending logs?

**Check 1**: Does log channel exist?
```
Create channel named: mod-logs
```

**Check 2**: Does bot have permissions?
```
Right-click channel → Edit Channel → Permissions
Check bot has: Send Messages, Embed Links
```

**Check 3**: Test the system
```
!testlog
```

### Logs are too spammy?

**Option 1**: Disable all-transcript logging
```env
LOG_ALL_TRANSCRIPTS=false
```

**Option 2**: Use separate channels
- `#mod-logs` - Violations only (always)
- `#voice-logs` - All transcripts (optional)

### Want logs in multiple servers?

The bot automatically detects log channels per server:
- Server A: Logs to #mod-logs in Server A
- Server B: Logs to #moderation in Server B
- Works independently for each server

## 📈 Advanced Configuration

### Custom Embed Colors

Edit `bot.js` to change colors:

```javascript
// Violation (red)
color: 0xff0000

// Regular transcript (blue)
color: 0x3498db

// Success (green)
color: 0x00ff00
```

### Add More Fields

Edit the embed in `handleViolation()` to add:
- User avatar
- Server name
- Moderator actions
- Previous violations

### Webhook Integration

For advanced setups, you can:
- Send logs to external services
- Integrate with mod dashboard
- Store in database
- Send alerts to Slack/Teams

## 🔔 Notification Options

### Discord Mentions

Add role mentions to violation logs:

```javascript
// In handleViolation function:
await logChannel.send({
  content: '<@&MODERATOR_ROLE_ID>',  // Ping moderators
  embeds: [/* embed here */]
});
```

### DM Notifications

Moderators can enable DMs for critical violations:
- Set up role-based DM alerts
- Configure severity thresholds
- Add emergency contacts

## 📚 Log Data Retention

### Privacy Considerations

Remember to:
- ✅ Delete logs after reasonable time (30-90 days)
- ✅ Follow data privacy laws (GDPR, CCPA)
- ✅ Don't store more than necessary
- ✅ Allow users to request deletion

### Auto-Cleanup (Optional)

You can set up auto-cleanup:
1. Discord auto-delete after X days
2. Bot command to purge old logs
3. Scheduled cleanup script

## 📞 Support

If logs aren't working:
1. Check channel exists and is named correctly
2. Verify bot permissions
3. Use `!testlog` to diagnose
4. Check console for error messages

---

**Remember**: Logs contain sensitive information. Protect them properly and follow your privacy policy!
