# Ginza Public Chat Group Setup Guide

## Fixing Anonymity Issue

If members are showing as anonymous in the group:

### Step 1: Check Group Settings
1. Open the Ginza Public Chat group
2. Tap/click on group name → **Group Settings**
3. Go to **Privacy and Security**
4. **Disable "Hide Members"** if it's enabled
5. **Enable "Show Members"** if available

### Step 2: Check Member Privacy Settings
Members may need to adjust their own privacy:
1. Each member: **Settings** → **Privacy and Security** → **Groups**
2. Make sure "Who can add me to groups" is set appropriately
3. Check "Who can see my phone number" settings

### Step 3: Group Type
- If it's a **Supergroup**: Members should be visible by default
- If it's a **Basic Group**: Consider upgrading to Supergroup for better features

## Bot Configuration for Poker Group Chat

### Bot Role
- ✅ **Regular Member** (no admin needed)
- ✅ Bot only sends automated messages
- ✅ Bot does NOT read or respond to messages
- ✅ Bot does NOT interfere with member conversations

### What the Bot Does
1. **Day-Before Reminders**: Sends event reminders 1 day before at 10 AM EST
2. **Promo Messages**: Sends 2 hours before events
3. **Last-Minute Reminders**: Sends 10 minutes before events

### What the Bot Does NOT Do
- ❌ Does NOT read member messages
- ❌ Does NOT respond to commands (unless you configure it)
- ❌ Does NOT interfere with regular chat
- ❌ Does NOT require admin permissions

### Group Settings Recommendations

**For Best Experience:**
1. **Group Type**: Supergroup (recommended)
2. **Privacy**: Show members (not anonymous)
3. **Bot Permissions**: Regular member (no special permissions needed)
4. **Message Permissions**: Bot can send messages (default)

**To Upgrade to Supergroup:**
1. Group Settings → **Convert to Supergroup**
2. This gives better features and member visibility

## Testing the Setup

1. **Add the bot** to the group
2. **Send a test message** in the group (any member)
3. **Verify members are visible** (not anonymous)
4. **Run the chat ID script**: `npm run get-chat-id`
5. **Test the bot**: `npm run test:telegram`

## Troubleshooting

### Members Still Anonymous
- Check if group is set to "Hide Members"
- Verify it's a Supergroup, not a Basic Group
- Members may need to adjust individual privacy settings

### Bot Not Sending Messages
- Verify bot is in the group
- Check chat ID is correct (negative number)
- Ensure bot token is valid
- Make sure events exist in the system

### Bot Interfering with Chat
- The bot is configured to be passive
- It only sends scheduled messages
- It doesn't read or respond to chat
- If issues persist, check bot permissions






