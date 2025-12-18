# Telegram Bot Setup Guide

## Step 1: Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Get the Chat ID for Ginza Public Chat

The chat link is: https://t.me/+tUSssIotf7QzZGRh

### Method 1: Using Helper Script (Easiest) ⭐
1. Make sure you have `TELEGRAM_BOT_TOKEN` set in your `.env` file
2. Add your bot to the Ginza Public Chat group
3. Send any message in the group (so the bot can see it)
4. Run the helper script:
   ```bash
   npm run get-chat-id
   ```
5. The script will show you all chat IDs - look for the Ginza Public Chat one (it will be a negative number)

### Method 2: Using @userinfobot (Personal Chat)
1. Start a personal chat with [@userinfobot](https://t.me/userinfobot)
2. Forward any message from the Ginza Public Chat group to @userinfobot
3. The bot will show you the chat ID in the forwarded message info

### Method 3: Using Telegram API (Manual)
1. **First, add your bot to the Ginza Public Chat group** (this is required!)
2. **Send a message in the group** (any message - the bot needs to see activity)
3. **Wait a few seconds** for Telegram to process
4. Visit in your browser: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Replace `<YOUR_BOT_TOKEN>` with your actual bot token (no angle brackets, no spaces)
   - Example: `https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates`
5. Look for the `"chat":{"id":-1001234567890}` in the JSON response
   - The chat ID will be a **negative number** for groups (like `-1001234567890`)
   - Look in the `"message"` → `"chat"` → `"id"` field

**Troubleshooting 404 Error:**
- ❌ **404 Not Found** usually means:
  - The bot token is incorrect or has extra spaces
  - The URL format is wrong (make sure there's no `<` or `>` in the URL)
  - The bot hasn't been added to the group yet
  - No messages have been sent in the group after adding the bot
- ✅ **Solution**: 
  - Use Method 1 (helper script) - it's the easiest!
  - Or double-check your bot token from @BotFather
  - Make sure the bot is actually in the Ginza Public Chat group
  - Send a test message in the group after adding the bot
  - Try Method 2 (@RawDataBot) instead

## Step 2.5: Configure Group Settings for Automated Updates

To ensure the bot works properly and doesn't interfere with regular chat:

### Group Privacy Settings
1. **Go to Group Settings** → **Privacy and Security**
2. **Disable "Hide Members"** if enabled (this might cause the anonymity issue)
3. **Allow bots to send messages** (usually enabled by default)

### Bot Permissions
1. The bot **does NOT need admin rights** - it can be a regular member
2. The bot will **only send automated messages** - it won't read or respond to regular chat
3. Members can chat normally - the bot won't interfere

### Fixing Anonymity Issue
If members appear anonymous:
1. **Group Settings** → **Privacy and Security**
2. Turn OFF "Hide Members" or "Anonymous Mode"
3. Make sure "Show Members" is enabled
4. Members may need to check their own privacy settings

### Bot Behavior
- ✅ Bot sends automated event reminders (day before, 2 hours before, 10 minutes before)
- ✅ Bot does NOT read or respond to messages
- ✅ Bot does NOT interfere with member conversations
- ✅ Members can chat freely without bot interference

## Step 2.5: Configure Group for Poker Chat + Automated Updates

**Important**: The bot is designed to work seamlessly with regular group chat. See [GROUP_SETUP.md](./GROUP_SETUP.md) for detailed instructions.

### Quick Setup:
1. **Bot Role**: Regular member (no admin needed)
2. **Bot Behavior**: Only sends automated messages, doesn't read chat
3. **Member Privacy**: Disable "Hide Members" in group settings to fix anonymity
4. **Group Type**: Supergroup recommended for better features

The bot will:
- ✅ Send automated event reminders
- ✅ NOT interfere with member conversations
- ✅ NOT read or respond to messages
- ✅ Allow normal poker group chat to continue

## Step 3: Create .env File

1. Copy `env.template` to `.env`:
   ```bash
   cp env.template .env
   ```

2. Edit `.env` and fill in your values:
   ```env
   TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
   TELEGRAM_CHAT_ID=your_actual_chat_id_here
   PROMO_OFFSET_MINUTES=120
   REMINDER_OFFSET_MINUTES=10
   ```

## Step 4: Test the Bot

Run the test script:
```bash
npm run test:telegram
```

This will:
- ✅ Verify your bot token is valid
- ✅ Test connection to Telegram
- ✅ Send a test message to the chat
- ✅ Show a sample day-before reminder message format

## Step 5: Start the Bot

Once testing passes, start the bot:
```bash
npm run bot
```

The bot will:
- 📅 Send day-before reminders (1 day before at 10 AM EST)
- ⏰ Send promo messages (2 hours before)
- 🚨 Send reminder messages (10 minutes before)

## Troubleshooting

### Error: "Bot is not a member of the chat"
- Make sure you've added your bot to the Ginza Public Chat group
- The bot needs to be a member to send messages

### Error: "Invalid chat ID"
- Double-check the chat ID (should be a negative number for groups)
- Make sure you're using the chat ID, not the invite link

### Error: "events.json not found"
- Visit http://localhost:3000/admin to create events
- The bot reads events from `data/events.json` which is auto-generated

