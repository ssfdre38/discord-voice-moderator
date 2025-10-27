# Banned Words Configuration Guide

## 📋 Overview

The bot reads banned words and phrases from `banned_words.txt`. When these are detected in voice transcriptions, the moderation system triggers.

## 📁 File Location

```
discord-voice-moderator/
├── bot.js
├── banned_words.txt    ← Edit this file
└── ...
```

## ✏️ How to Edit

### Option 1: Text Editor

```bash
nano banned_words.txt
# or
code banned_words.txt
# or
notepad banned_words.txt
```

### Option 2: Direct Edit

Just open `banned_words.txt` in any text editor and add your phrases.

## 📝 Format Rules

### Basic Format
```
# Comments start with #
# One phrase per line

bad word
another bad phrase
multiple word phrase
```

### Rules
- ✅ One phrase per line
- ✅ Case insensitive (automatically converted to lowercase)
- ✅ Empty lines are ignored
- ✅ Lines starting with `#` are comments
- ✅ Phrases can contain spaces
- ✅ Special characters are allowed

### Examples

**Good:**
```
inappropriate word
offensive phrase
hate speech example
```

**Bad (will cause issues):**
```
word1, word2, word3    ❌ Don't use commas
"quoted phrase"        ❌ Don't use quotes
['bracketed']          ❌ Don't use brackets
```

## 🎯 Best Practices

### 1. Be Specific

**Bad:**
```
a
the
is
```
These common words will cause constant false positives!

**Good:**
```
kill yourself
extremely specific hateful phrase
detailed threat example
```

### 2. Multi-Word Phrases

Use specific phrases instead of single words:

**Less Effective:**
```
kill
die
hurt
```

**More Effective:**
```
kill yourself
die in a fire
gonna hurt you
gonna kill you
```

### 3. Common Substitutions

Consider common ways people try to bypass filters:

```
# Standard
bad word

# Common substitutions
b@d w0rd
b a d w o r d
baaad wooord
```

### 4. Context Matters

Some words are problematic in certain contexts:

```
# Might be okay in context
damn
hell
crap

# Almost never okay
[serious slurs]
[hate speech]
[detailed threats]
```

## 🔄 Reloading Changes

### Method 1: Restart Bot
```bash
# Stop bot (Ctrl+C)
npm start
```

### Method 2: Reload Command
```
!reload
```
Bot will reload `banned_words.txt` without restarting.

## 🧪 Testing

### Test Your Words

1. Edit `banned_words.txt`
2. Run `!reload` in Discord
3. Join voice and say a banned phrase
4. Check `#mod-logs` for alert

### Check What's Loaded

```
!status
```
Shows: "Banned phrases loaded: 45"

### Preview Banned Words

```
!listbanned
```
Shows first 10 banned phrases (admin only)

## 📊 Pre-Populated Examples

The default `banned_words.txt` includes:

- ✅ Common profanity (examples)
- ✅ Threats and harassment
- ✅ Sexual content examples
- ✅ Spam phrases
- ✅ Scam attempts
- ✅ Drug references

**Important**: These are EXAMPLES. Customize for your community!

## 🎯 Server-Specific Configuration

### Small Gaming Server

```txt
# Keep it light - friends talking
kill yourself
kys
serious threat here
obvious harassment
```

### Community Server

```txt
# Moderate - public community
[Add ~20-30 phrases]
# Focus on:
# - Slurs
# - Harassment
# - Serious threats
# - Sexual content
```

### Large Public Server

```txt
# Comprehensive - strict moderation
[Add 50+ phrases]
# Include:
# - All slurs
# - All harassment types
# - Hate speech
# - NSFW content
# - Scams
# - Spam
```

### Professional/Corporate

```txt
# Very strict
[Add 100+ phrases]
# Zero tolerance for:
# - Any profanity
# - Any NSFW content
# - Any harassment
# - Unprofessional language
```

## ⚠️ Warning: Sensitive Content

When adding slurs and hate speech to your banned words:

1. ✅ Be thorough - cover variants
2. ✅ Keep file secure (don't share publicly)
3. ✅ Test carefully
4. ✅ Document why each phrase is banned

## 🔒 Security

### File Permissions

```bash
# On Linux/Mac
chmod 600 banned_words.txt  # Only bot can read
```

### Git Considerations

The file IS tracked in git by default since it contains examples.

To make it private (after cloning):
```bash
# Create your own version
cp banned_words.txt banned_words_custom.txt

# Edit .gitignore to exclude it
echo "banned_words_custom.txt" >> .gitignore

# Update bot.js to use custom file
# Change: 'banned_words.txt'
# To: 'banned_words_custom.txt'
```

## 💡 Advanced Tips

### Multiple Languages

```txt
# English
bad word

# Spanish
palabra mala

# French
mot mauvais
```

### Regex Patterns (Future Feature)

Currently uses exact matching. Future versions may support:
```txt
# Would match: kill, killing, killed
kill.*

# Would match variations with numbers
b@d.*w0rd
```

## 📈 Monitoring Effectiveness

### Check Logs Regularly

1. Review `#mod-logs` channel
2. Look for false positives
3. Look for missed violations
4. Adjust phrases accordingly

### False Positive Rate

If you see many false positives:
- Remove overly common words
- Make phrases more specific
- Add context requirements

### False Negative Rate

If violations are missed:
- Add specific phrases you're seeing
- Consider common misspellings
- Add l33t speak variants

## 🛠️ Troubleshooting

### Bot Not Detecting Words

**Check 1**: Is word in file?
```bash
cat banned_words.txt | grep "word"
```

**Check 2**: Did you reload?
```
!reload
```

**Check 3**: Check case sensitivity
```
# File should contain lowercase
bad word    ✅
Bad Word    ❌ (but will still work - converted automatically)
```

### Too Many False Positives

**Solution**: Be more specific
```
# Before (too broad)
ass

# After (more specific)
you're an ass
piece of ass
```

### Not Catching Variants

**Solution**: Add all variants
```
bad word
badword
bad-word
b a d w o r d
b@d w0rd
```

## 📋 Example Configurations

### Example 1: Friendly Server

```txt
# Very lenient - friends only
kill yourself
kys
serious death threat
dox threat
```

### Example 2: Public Community

```txt
# Balanced moderation
# Slurs
[actual slurs for your community]

# Threats
kill yourself
kys
gonna kill you
gonna hurt you
find where you live

# Sexual harassment
send nudes
dick pic
inappropriate request

# Scams
free nitro
free robux
click this link
```

### Example 3: Professional Server

```txt
# Strict professional environment
# Any profanity
damn
hell
crap
ass
[etc]

# Any NSFW
[comprehensive list]

# Any harassment
[comprehensive list]

# Spam
join my server
check out
subscribe to my
```

## 🔄 Regular Maintenance

### Weekly
- Review logs for patterns
- Add new phrases if needed
- Remove phrases causing false positives

### Monthly
- Complete audit of banned words
- Compare with other servers
- Update based on community feedback

### After Incidents
- Add specific phrases that caused issues
- Test new additions
- Document why they were added

## 📞 Commands Reference

| Command | Description |
|---------|-------------|
| `!reload` | Reload banned_words.txt |
| `!status` | Show how many phrases loaded |
| `!listbanned` | Preview first 10 phrases (admin) |

## 🎓 Pro Tips

1. **Start Small**: Begin with 10-20 most critical phrases
2. **Grow Organically**: Add phrases as you encounter issues
3. **Test Everything**: Always test new phrases before deploying
4. **Document**: Add comments explaining why phrases are banned
5. **Community Input**: Ask moderators for suggestions
6. **Regular Reviews**: Audit quarterly

## 📚 Additional Resources

- [Discord Moderation Guide](https://discord.com/moderation)
- [Content Moderation Best Practices](https://www.eff.org/issues/content-moderation)
- Community-maintained banned word lists (use with caution)

---

**Remember**: Effective moderation combines good technology with good judgment. The banned words list is a tool, not a replacement for human moderation.
