const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('🧪 Testing Telegram Bot Configuration...\n');

// Check if environment variables are set
if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('❌ Error: TELEGRAM_CHAT_ID is not set in .env file');
  console.log('\n💡 To get your chat ID:');
  console.log('   1. Add your bot to the Ginza Public Chat group');
  console.log('   2. Use @RawDataBot in the group to get the chat ID');
  console.log('   3. Or check the group info in Telegram API');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log(`   Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
console.log(`   Chat ID: ${CHAT_ID}\n`);

// Initialize bot
const bot = new Telegraf(BOT_TOKEN);

// Test bot connection
async function testBot() {
  try {
    console.log('🔌 Testing bot connection...');
    const me = await bot.telegram.getMe();
    console.log(`✅ Bot connected successfully!`);
    console.log(`   Bot username: @${me.username}`);
    console.log(`   Bot name: ${me.first_name}\n`);

    // Test loading events
    console.log('📅 Testing event loading...');
    const jsonPath = path.join(__dirname, 'data', 'events.json');
    if (fs.existsSync(jsonPath)) {
      const events = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log(`✅ Found ${events.length} events in data/events.json`);
      if (events.length > 0) {
        console.log(`   Sample event: ${events[0].eventName}`);
      }
    } else {
      console.log('⚠️  Warning: events.json not found');
      console.log('   Visit http://localhost:3000/admin to create events first');
    }
    console.log('');

    // Test sending a message
    console.log('📤 Testing message sending...');
    const testMessage = `🧪 *Test Message from Ginza Gaming Bot*\n\n` +
      `This is a test to verify the bot is working correctly.\n\n` +
      `If you see this message, the bot is successfully connected to the chat! ✅`;

    await bot.telegram.sendMessage(CHAT_ID, testMessage, { parse_mode: 'Markdown' });
    console.log('✅ Test message sent successfully!');
    console.log(`   Check the Telegram chat to see the message.\n`);

    // Test day-before reminder format
    if (fs.existsSync(jsonPath)) {
      const events = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (events.length > 0) {
        const sampleEvent = events[0];
        console.log('📝 Sample day-before reminder message format:');
        console.log('─'.repeat(50));
        
        const formatTime = (time) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours, 10);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm} EST`;
        };
        
        const timeRange = sampleEvent.endTime 
          ? `${formatTime(sampleEvent.startTime)} - ${formatTime(sampleEvent.endTime)}`
          : formatTime(sampleEvent.startTime);
        
        const sampleReminder = `🎰 *${sampleEvent.eventName}* is happening tomorrow!\n\n` +
          `📅 Date: ${new Date(sampleEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n` +
          `⏰ Time: ${timeRange}\n` +
          `💰 Stakes: ${sampleEvent.stakes}\n` +
          `🎮 Game: ${sampleEvent.gameType}\n` +
          (sampleEvent.description ? `📝 ${sampleEvent.description}\n\n` : '\n') +
          `🎯 Don't miss out! RSVP now to secure your spot:\n` +
          `${sampleEvent.lumaEventUrl || 'Link coming soon!'}\n\n` +
          `See you at the tables! 🃏`;
        
        console.log(sampleReminder);
        console.log('─'.repeat(50));
      }
    }

    console.log('\n✅ All tests passed! The bot is ready to use.');
    console.log('\n💡 To start the bot, run: npm run bot');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Error code: ${error.response.error_code}`);
      console.error(`   Description: ${error.response.description}`);
      
      if (error.response.error_code === 403) {
        console.error('\n💡 Bot is not a member of the chat. Add the bot to the group first.');
      } else if (error.response.error_code === 400) {
        console.error('\n💡 Invalid chat ID. Make sure you have the correct chat ID.');
      }
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testBot().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});



