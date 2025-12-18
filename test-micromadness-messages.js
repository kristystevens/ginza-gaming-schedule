const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('❌ Error: Bot token and chat ID must be set in .env file');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Load events
function loadEvents() {
  try {
    const jsonPath = path.join(__dirname, 'data', 'events.json');
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }
    return [];
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

// Format time for display
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm} EST`;
}

// Format time range
function formatTimeRange(startTime, endTime) {
  if (!endTime) {
    return formatTime(startTime);
  }
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Send day-before reminder
async function sendDayBeforeReminder(event) {
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  
  const message = `🎰 *${event.eventName}* is happening tomorrow!\n\n` +
    `📅 Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n` +
    `⏰ Time: ${timeRange}\n` +
    `💰 Stakes: ${event.stakes}\n` +
    `🎮 Game: ${event.gameType}\n` +
    (event.description ? `📝 ${event.description}\n\n` : '\n') +
    `🎯 Don't miss out! RSVP now to secure your spot:\n` +
    `${event.lumaEventUrl || 'Link coming soon!'}\n\n` +
    `See you at the tables! 🃏`;

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log('✅ Sent day-before reminder');
    return true;
  } catch (error) {
    console.error('❌ Error sending day-before reminder:', error.message);
    return false;
  }
}

// Send promo message (2 hours before)
async function sendPromoMessage(event) {
  const message = `🎰 *${event.eventName}* is starting in 2 hours!\n\n` +
    `⏰ Time: ${formatTime(event.startTime)}\n` +
    `💰 Stakes: ${event.stakes}\n` +
    `🎮 Game: ${event.gameType}\n` +
    (event.description ? `📝 ${event.description}\n\n` : '\n') +
    `🔗 Register here: ${event.lumaEventUrl || 'Link coming soon!'}`;

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log('✅ Sent promo message (2 hours before)');
    return true;
  } catch (error) {
    console.error('❌ Error sending promo message:', error.message);
    return false;
  }
}

// Send reminder message (10 minutes before)
async function sendReminderMessage(event) {
  const message = `🚨 *${event.eventName}* starts in 10 minutes!\n\n` +
    `🎮 Game link: ${event.gameLink || 'Link coming soon!'}\n` +
    `💬 Chat: ${event.telegramChatLink || 'Link coming soon!'}\n` +
    (event.streamingLink ? `📺 Join stream: ${event.streamingLink}` : '');

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log('✅ Sent reminder message (10 minutes before)');
    return true;
  } catch (error) {
    console.error('❌ Error sending reminder message:', error.message);
    return false;
  }
}

async function sendAllTestMessages() {
  console.log('🧪 Sending all test messages for Micromadness event...\n');
  
  const events = loadEvents();
  const micromadness = events.find(e => e.eventName.toLowerCase().includes('micromadness'));
  
  if (!micromadness) {
    console.error('❌ Micromadness event not found');
    console.log('Available events:');
    events.forEach(e => console.log(`  - ${e.eventName}`));
    process.exit(1);
  }
  
  console.log(`📅 Found event: ${micromadness.eventName}`);
  console.log(`   Date: ${micromadness.date}`);
  console.log(`   Time: ${formatTimeRange(micromadness.startTime, micromadness.endTime)}\n`);
  
  console.log('📤 Sending messages...\n');
  
  // Send with delays between messages
  console.log('1️⃣  Sending day-before reminder...');
  await sendDayBeforeReminder(micromadness);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  
  console.log('\n2️⃣  Sending promo message (2 hours before)...');
  await sendPromoMessage(micromadness);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
  
  console.log('\n3️⃣  Sending reminder message (10 minutes before)...');
  await sendReminderMessage(micromadness);
  
  console.log('\n✅ All test messages sent!');
  console.log('📱 Check your Telegram chat to see the messages.');
}

sendAllTestMessages().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});



