/**
 * Quick test to verify bot token is valid
 */

require('dotenv').config();
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ Error: TELEGRAM_BOT_TOKEN not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing bot token...\n');
console.log(`Token preview: ${BOT_TOKEN.substring(0, 10)}...${BOT_TOKEN.substring(BOT_TOKEN.length - 5)}\n`);

const url = `https://api.telegram.org/bot${BOT_TOKEN}/getMe`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (!response.ok) {
        console.error('❌ Bot token is invalid:');
        console.error(`   Code: ${response.error_code}`);
        console.error(`   Description: ${response.description}\n`);
        
        if (response.error_code === 401) {
          console.log('💡 Your bot token is incorrect. Please:');
          console.log('   1. Go to @BotFather on Telegram');
          console.log('   2. Send /token or /mybots');
          console.log('   3. Copy the correct token');
          console.log('   4. Update it in your .env file\n');
        }
        process.exit(1);
      }

      console.log('✅ Bot token is valid!\n');
      console.log(`Bot Username: @${response.result.username}`);
      console.log(`Bot Name: ${response.result.first_name}`);
      console.log(`Bot ID: ${response.result.id}\n`);
      
      console.log('✅ Next steps:');
      console.log('   1. Add this bot to the Telegram group: https://t.me/+tUSssIotf7QzZGRh');
      console.log('   2. Send a message in the group (any message)');
      console.log('   3. Wait 5-10 seconds');
      console.log('   4. Run: npm run get-chat-id\n');

    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      process.exit(1);
    }
  });

}).on('error', (error) => {
  console.error('❌ Network error:', error.message);
  process.exit(1);
});





