# ⚖️ LEGAL NOTICE & DISCORD TERMS OF SERVICE

## 🚨 IMPORTANT: READ BEFORE USING THIS BOT

This bot records and processes voice communications. You **MUST** understand and comply with all applicable laws and terms of service before deployment.

---

## Discord Terms of Service Compliance

### Discord's Stance on Recording

According to **Discord's Terms of Service** and **Community Guidelines**:

1. **User Consent Required**: You must obtain consent from all participants before recording voice communications
2. **Privacy Policy Compliance**: You must have a clear privacy policy explaining data collection
3. **User Notification**: Users must be clearly informed when they are being recorded
4. **Data Protection**: Recorded data must be handled securely and deleted when no longer needed

### Discord Developer Terms

Per **Discord's Developer Terms of Service** and **Developer Policy**:

- Bots must not violate user privacy
- Bots must comply with data protection laws (GDPR, CCPA, etc.)
- Bots must have clear terms of service and privacy policies
- Users must be able to opt-out of data collection
- Recorded data must not be sold or shared with third parties

**Reference**: https://discord.com/terms
**Developer Policy**: https://discord.com/developers/docs/policies-and-agreements/developer-policy

---

## Legal Requirements by Jurisdiction

### United States
- **Federal Law**: One-party consent in most states (but check state laws)
- **California**: Two-party consent required (all parties must consent)
- **Other States**: 11 states require two-party consent
- **Wiretapping Laws**: Unauthorized recording may violate federal wiretapping laws

### European Union (GDPR)
- **Explicit Consent**: Must obtain explicit, informed consent
- **Data Processing**: Must have legal basis for processing voice data
- **Right to Access**: Users can request their data
- **Right to Erasure**: Users can request data deletion
- **Data Protection Officer**: May be required depending on scale

### United Kingdom (UK GDPR)
- Similar requirements to EU GDPR
- **ICO Compliance**: Must comply with Information Commissioner's Office regulations

### Canada (PIPEDA)
- **Consent Required**: Must obtain meaningful consent
- **Privacy Policy**: Must have clear privacy policy
- **Data Protection**: Must protect personal information

### Australia (Privacy Act)
- **Consent Required**: Must obtain consent for recording
- **APP Compliance**: Must comply with Australian Privacy Principles

---

## Required Disclosures

### Before Deploying This Bot, You MUST:

1. ✅ **Post a Clear Notice** in your server:
   ```
   ⚠️ VOICE MONITORING ACTIVE
   
   This server uses automated voice monitoring for moderation purposes.
   
   By joining voice channels, you consent to:
   • Audio recording and transcription
   • Automated content moderation
   • Logging of violations
   
   We DO NOT:
   • Store permanent audio recordings
   • Share data with third parties
   • Use data for commercial purposes
   
   Audio is processed locally and deleted immediately.
   Transcripts of violations may be retained for moderation.
   
   For questions, contact: [Your Contact]
   Privacy Policy: [Your Policy Link]
   ```

2. ✅ **Create a Privacy Policy** covering:
   - What data is collected (voice audio, transcripts)
   - How data is processed (local AI transcription)
   - How long data is retained (immediate deletion)
   - Who has access to data (moderators only)
   - User rights (opt-out, data requests)

3. ✅ **Implement Consent Mechanism**:
   - Require users to acknowledge monitoring before joining voice
   - Provide opt-out mechanisms
   - Allow users to request their data

4. ✅ **Bot Announcement** when joining voice:
   ```javascript
   // Add to bot.js in monitorVoiceChannel function:
   const textChannel = channel.guild.channels.cache.find(
     ch => ch.name === 'general' || ch.type === 'GUILD_TEXT'
   );
   if (textChannel) {
     textChannel.send(
       '⚠️ Voice monitoring is now active in ' + channel.name + 
       '. This channel is being monitored for moderation purposes.'
     );
   }
   ```

5. ✅ **Moderator Training**:
   - Train moderators on proper use
   - Establish clear policies for reviewing logs
   - Implement oversight and accountability

---

## Prohibited Uses

### ❌ DO NOT Use This Bot For:

- Recording without consent
- Surveillance of private conversations
- Collecting data for commercial purposes
- Sharing recordings with third parties
- Harassment or intimidation
- Violating Discord's Terms of Service
- Violating any local, state, or federal laws

---

## Liability & Disclaimer

### Developer Liability

The developers of this bot are **NOT** responsible for:
- Your use or misuse of this software
- Any legal violations by users
- Any damages resulting from use
- Compliance with local laws (your responsibility)

### User Responsibility

**YOU** are solely responsible for:
- Ensuring legal compliance in your jurisdiction
- Obtaining proper consent from users
- Creating and enforcing privacy policies
- Complying with Discord's Terms of Service
- Any legal consequences of deployment

---

## Recommended Best Practices

### 1. Transparency
- ✅ Be completely transparent about monitoring
- ✅ Make policies easily accessible
- ✅ Respond promptly to user concerns

### 2. Data Minimization
- ✅ Only collect necessary data
- ✅ Delete data as soon as possible
- ✅ Don't store more than needed for moderation

### 3. Security
- ✅ Protect logs and transcripts
- ✅ Limit moderator access
- ✅ Use secure servers
- ✅ Implement audit logs

### 4. User Rights
- ✅ Allow users to request their data
- ✅ Allow users to request deletion
- ✅ Provide opt-out mechanisms
- ✅ Honor data subject requests

### 5. Regular Review
- ✅ Review policies quarterly
- ✅ Update for legal changes
- ✅ Audit bot usage
- ✅ Remove inactive data

---

## Consent Template

Add this to your Discord server rules:

```markdown
## Voice Channel Monitoring Policy

**Effective Date**: [Date]

### What We Monitor
- Voice communications in monitored channels
- Speech is converted to text for moderation
- Audio is NOT permanently stored

### Why We Monitor
- To enforce community guidelines
- To prevent harassment and abuse
- To maintain a safe environment

### Your Rights
- You may request your data at any time
- You may request deletion of your data
- You may opt-out by not joining monitored channels
- You may contact us with concerns

### Data Handling
- Audio processed locally, deleted immediately
- Only violation transcripts are logged
- Logs accessible only to moderators
- Data never shared with third parties

### Consent
By joining voice channels marked as "monitored", you consent to this policy.

**Questions?** Contact: [Your Contact]
**Privacy Policy**: [Link]
```

---

## Discord Bot Verification Considerations

If you plan to verify your bot (required for 75+ servers):

- ✅ Must pass Discord's verification review
- ✅ Must have comprehensive privacy policy
- ✅ Must clearly explain data collection
- ✅ Must implement proper data protection
- ✅ May require additional legal review

**More Info**: https://discord.com/developers/docs/topics/oauth2#bot-authorization-flow

---

## Criminal Liability Warning

⚠️ **Serious Warning**: Unauthorized recording of communications can result in:

- **Criminal Charges**: Wiretapping, eavesdropping violations
- **Civil Lawsuits**: Privacy violations, emotional distress
- **Discord Ban**: Permanent removal from platform
- **Financial Penalties**: Fines and damages

**DO NOT** deploy this bot without proper legal review if:
- You're in a two-party consent jurisdiction
- You're unsure about local laws
- You cannot obtain proper consent
- You don't have a privacy policy

---

## Getting Legal Help

### When to Consult a Lawyer

Consult with an attorney if:
- Your server has 100+ members
- You operate in multiple jurisdictions
- You're unsure about legal requirements
- You monetize your server
- You handle sensitive topics

### Resources

- **EFF (Electronic Frontier Foundation)**: https://www.eff.org/
- **Discord Legal**: https://discord.com/terms
- **GDPR Info**: https://gdpr.eu/
- **State Recording Laws**: https://www.justia.com/50-state-surveys/recording-phone-calls-and-conversations/

---

## Final Warning

### ⚠️ CRITICALLY IMPORTANT ⚠️

**This software is provided "AS IS" for educational purposes.**

By using this bot, you acknowledge that:

1. ✅ You have read and understood this legal notice
2. ✅ You accept full responsibility for compliance
3. ✅ You will obtain proper consent before recording
4. ✅ You will comply with all applicable laws
5. ✅ You will not hold developers liable
6. ✅ You understand the legal risks

**IF YOU CANNOT AGREE TO ALL OF THE ABOVE, DO NOT USE THIS BOT.**

---

## Acknowledgment

I hereby acknowledge that I have read, understood, and agree to comply with all requirements outlined in this legal notice. I understand that I am solely responsible for ensuring legal compliance and that the developers of this software bear no liability for my use of this bot.

**This is serious.** Voice recording without consent can result in criminal charges. When in doubt, consult an attorney.

---

**Last Updated**: 2025-10-27
**Version**: 1.0

For questions or concerns about this legal notice, please consult with a qualified attorney in your jurisdiction.
