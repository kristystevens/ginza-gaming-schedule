/**
 * Helper script to get Telegram Chat ID
 * 
 * Usage:
 * 1. Set TELEGRAM_BOT_TOKEN in .env file
 * 2. Add your bot to the group
 * 3. Send a message in the group
 * 4. Run: node get-chat-id.js
 */

require('dotenv').config();
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
  console.log('\n💡 Please add your bot token to .env file first');
  process.exit(1);
}

console.log('🔍 Fetching updates from Telegram API...\n');

const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (!response.ok) {
        console.error('❌ Error from Telegram API:');
        console.error(`   Code: ${response.error_code}`);
        console.error(`   Description: ${response.description}\n`);
        
        if (response.error_code === 401) {
          console.log('💡 Your bot token is invalid. Check it with @BotFather');
        } else if (response.error_code === 404) {
          console.log('💡 Make sure:');
          console.log('   1. Your bot token is correct (no extra spaces)');
          console.log('   2. The bot has been added to the group');
          console.log('   3. Someone has sent a message in the group after adding the bot');
        }
        process.exit(1);
      }

      if (!response.result || response.result.length === 0) {
        console.log('⚠️  No updates found.');
        console.log('\n💡 To get the chat ID:');
        console.log('   1. Make sure your bot is added to the Ginza Public Chat group');
        console.log('   2. Send any message in the group');
        console.log('   3. Wait a few seconds and run this script again');
        process.exit(0);
      }

      console.log('✅ Found updates! Extracting chat IDs...\n');
      
      const chatIds = new Set();
      
      response.result.forEach((update) => {
        if (update.message && update.message.chat) {
          const chat = update.message.chat;
          const chatId = chat.id;
          const chatTitle = chat.title || chat.first_name || 'Unknown';
          const chatType = chat.type;
          
          chatIds.add({
            id: chatId,
            title: chatTitle,
            type: chatType
          });
        }
      });

      if (chatIds.size === 0) {
        console.log('⚠️  No chat IDs found in updates');
        process.exit(0);
      }

      console.log('📱 Found Chat IDs:\n');
      chatIds.forEach((chat) => {
        console.log(`   ${chat.title || 'Chat'}`);
        console.log(`   Type: ${chat.type}`);
        console.log(`   Chat ID: ${chat.id}`);
        console.log('');
      });

      // Find group chats (negative IDs)
      const groups = Array.from(chatIds).filter(c => c.id < 0);
      if (groups.length > 0) {
        console.log('🎯 Group Chat IDs (use these for TELEGRAM_CHAT_ID):\n');
        groups.forEach((group) => {
          console.log(`   ${group.title}: ${group.id}`);
        });
        console.log('\n💡 Copy one of these chat IDs to your .env file as TELEGRAM_CHAT_ID');
      }

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('\nRaw response:', data);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ Network error:', error.message);
  process.exit(1);
});






