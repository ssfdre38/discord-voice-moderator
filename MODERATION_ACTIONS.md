# Moderation Actions Guide

## 🛡️ Interactive Moderation System

When a violation is detected, the bot sends a message to your `#mod-logs` channel with **interactive buttons** for moderators to choose the appropriate action.

## 🎮 Available Actions

### 1. 🦵 Kick from Voice
- Removes user from voice channel immediately
- User can rejoin voice channels
- Good for minor violations

### 2. ⏰ Timeout (5 minutes)
- Puts user in timeout for 5 minutes
- User cannot send messages or join voice
- Automatically removes from voice channel
- Good for repeat offenders

### 3. 🔨 Ban User
- Permanently bans user from server
- Cannot rejoin unless unbanned
- Use for serious or repeated violations

### 4. ⚠️ Warn Only
- Sends a DM warning to the user
- No other action taken
- Good for first-time offenses or borderline cases

### 5. ✅ Ignore
- Takes no action
- Marks as false positive
- Good when AI mistranscribed or context makes it acceptable

## 📋 How It Works

### When Violation Occurs

1. **Alert Posted** to `#mod-logs`:
```
🚨 Voice Moderation Alert

👤 User: BadUser#1234 (123456789)
📍 Channel: Gaming Voice
⚠️ Violation: Used banned phrase: `bad word`
📝 Full Transcript: "user said bad word here"
⏳ Status: Awaiting moderator action...

[🦵 Kick] [⏰ Timeout] [🔨 Ban] [⚠️ Warn] [✅ Ignore]
```

2. **Moderator Clicks Button**:
   - Only users with "Moderate Members" permission can click
   - Action executes immediately
   - Message updates to show action taken

3. **Action Confirmation**:
```
🚨 Voice Moderation Alert

👤 User: BadUser#1234 (123456789)
📍 Channel: Gaming Voice
⚠️ Violation: Used banned phrase: `bad word`
📝 Full Transcript: "user said bad word here"
✅ Action Taken: 🦵 Kicked from voice channel
By: ModUser#5678
Time: Oct 27, 2025 8:45 PM

[Buttons removed]
```

## ⚙️ Configuration Modes

### Manual Mode (Default)

Moderators choose action for each violation:

```env
AUTO_ACTION=manual
```

**Pros**:
- ✅ Human oversight
- ✅ Context-aware decisions
- ✅ Can ignore false positives

**Cons**:
- ❌ Requires active moderation
- ❌ Delayed response

### Auto-Kick Mode

Automatically kicks users from voice:

```env
AUTO_ACTION=auto-kick
```

**Pros**:
- ✅ Immediate action
- ✅ No moderator needed
- ✅ Consistent enforcement

**Cons**:
- ❌ No context consideration
- ❌ False positives auto-actioned

### Auto-Timeout Mode

Automatically timeouts users for 5 minutes:

```env
AUTO_ACTION=auto-timeout
```

**Pros**:
- ✅ Stronger deterrent
- ✅ Prevents immediate retaliation
- ✅ Time-limited punishment

**Cons**:
- ❌ More severe than kick
- ❌ No human review

### Auto-Ban Mode

Automatically bans users:

```env
AUTO_ACTION=auto-ban
```

**⚠️ WARNING**: Very strict! Only use if:
- Zero-tolerance policy
- Violations are extremely serious
- False positives are impossible

### Auto-Warn Mode

Automatically sends warning DM:

```env
AUTO_ACTION=auto-warn
```

**Pros**:
- ✅ Least punitive
- ✅ Educates users
- ✅ Low false-positive impact

**Cons**:
- ❌ No immediate action
- ❌ May not deter repeat offenders

## 🎯 Recommended Setup

### Small Server (< 100 members)
```env
AUTO_ACTION=manual
```
Manual review with moderator buttons.

### Medium Server (100-1000 members)
```env
AUTO_ACTION=auto-kick
```
Auto-kick with manual review via logs.

### Large Server (1000+ members)
```env
AUTO_ACTION=auto-timeout
```
Auto-timeout for serious violations.

### Zero-Tolerance Server
```env
AUTO_ACTION=auto-ban
```
Only for servers with strict rules.

## 🔐 Required Permissions

### For Bot

The bot needs these permissions to execute actions:

- ✅ **Kick Members** - For kick action
- ✅ **Ban Members** - For ban action
- ✅ **Moderate Members** - For timeout action
- ✅ **Move Members** - For voice kick

### For Moderators

Moderators need this permission to use buttons:

- ✅ **Moderate Members** - To click action buttons

## 📊 Action Examples

### Example 1: First Offense

**Violation**: User says mild inappropriate word
**Recommended Action**: ⚠️ Warn Only
**Result**: User gets DM warning, stays in voice

### Example 2: Repeat Offender

**Violation**: User already warned twice
**Recommended Action**: ⏰ Timeout
**Result**: 5-minute timeout + voice kick

### Example 3: Serious Violation

**Violation**: User uses hate speech
**Recommended Action**: 🔨 Ban
**Result**: Permanent ban from server

### Example 4: False Positive

**Violation**: AI mistranscribed "duck" as bad word
**Recommended Action**: ✅ Ignore
**Result**: No action, marked as false positive

### Example 5: Context Matters

**Violation**: User quotes someone else's violation
**Recommended Action**: ✅ Ignore or ⚠️ Warn
**Result**: Depends on context

## 🚨 Emergency Actions

### Immediate Manual Override

If you need to act before clicking buttons:

```bash
# Kick from voice
Right-click user → Disconnect

# Timeout
Right-click user → Timeout → 5 minutes

# Ban
Right-click user → Ban
```

Then click ✅ Ignore on the bot message.

## 📈 Best Practices

### 1. Document Your Policies

Create clear guidelines:
- What violations get warns
- What violations get kicks
- What violations get bans
- How many warns before escalation

### 2. Train Moderators

Ensure moderators know:
- How to use the buttons
- When to escalate
- How to handle false positives
- Server policies

### 3. Review Regularly

- Check logs weekly
- Look for patterns
- Update banned phrases
- Adjust auto-action mode if needed

### 4. Communicate

- Tell users rules clearly
- Post warning in server rules
- Explain consequences
- Be consistent

## 🔄 Action Log History

All actions are logged with:
- ✅ User who violated
- ✅ What they said
- ✅ Action taken
- ✅ Moderator who acted
- ✅ Timestamp

This creates accountability trail.

## 💡 Tips

### Avoid Over-Moderation
- Don't ban for first offense
- Consider context
- Use warnings first

### Be Consistent
- Same violation = same action
- Document exceptions
- Apply rules fairly

### False Positives
- Always review transcripts
- AI can mishear
- Use Ignore button

### Escalation Path
1. First offense: Warn
2. Second offense: Kick
3. Third offense: Timeout
4. Fourth offense: Ban

## 🆘 Troubleshooting

### Buttons Not Working?

**Check 1**: Do you have Moderate Members permission?
```
Right-click yourself → Check role permissions
```

**Check 2**: Is bot online?
```
Check bot is online in member list
```

**Check 3**: Are buttons old?
```
Buttons expire after inactivity - they're one-time use
```

### Action Failed?

**Check 1**: Does bot have permissions?
```
Server Settings → Roles → Bot Role
Ensure: Kick Members, Ban Members, Moderate Members
```

**Check 2**: Is bot role high enough?
```
Bot role must be above target user's highest role
```

**Check 3**: Is user still in server?
```
User may have already left
```

## 📱 Mobile Support

All buttons work on:
- ✅ Desktop Discord
- ✅ Mobile Discord (iOS/Android)
- ✅ Web Discord

Moderators can act from anywhere!

## 🎓 Advanced Configuration

### Custom Timeout Duration

Edit `bot.js`:
```javascript
// Change from 5 minutes to 10 minutes
await member.timeout(10 * 60 * 1000, 'Voice chat violation');
```

### Add More Actions

You can add more buttons like:
- Mute
- Role removal
- Different timeout durations
- Server-specific actions

### Role-Based Actions

Different actions for different roles:
```javascript
if (member.roles.cache.has('TRUSTED_ROLE_ID')) {
  // More lenient
} else {
  // Stricter
}
```

---

**Remember**: Moderation should be fair, consistent, and documented. Use these tools responsibly!
