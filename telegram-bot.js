const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const PROMO_OFFSET_MINUTES = parseInt(process.env.PROMO_OFFSET_MINUTES || '120', 10); // 2 hours default
const REMINDER_OFFSET_MINUTES = parseInt(process.env.REMINDER_OFFSET_MINUTES || '10', 10); // 10 minutes default

if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN environment variable is required');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('Error: TELEGRAM_CHAT_ID environment variable is required');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Configure bot to only send messages, not read them
// This ensures the bot doesn't interfere with regular group chat
bot.use((ctx, next) => {
  // Only process commands if needed, otherwise ignore
  // The bot is passive and only sends scheduled messages
  return next();
});

// Load events from the events.ts file (simplified version for Node.js)
// In production, you'd want to share the data source with the Next.js app
function loadEvents() {
  try {
    // Try to read from a JSON file if it exists
    const jsonPath = path.join(__dirname, 'data', 'events.json');
    if (fs.existsSync(jsonPath)) {
      const data = fs.readFileSync(jsonPath, 'utf8');
      return JSON.parse(data);
    }
    
    // Fallback: return empty array (events should be synced from the web app)
    console.warn('Warning: events.json not found. Please sync events from the web app.');
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

// Format time range for display
function formatTimeRange(startTime, endTime) {
  if (!endTime) {
    return formatTime(startTime);
  }
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

// Calculate when to send promo message (PROMO_OFFSET_MINUTES before event)
function getPromoScheduleTime(event) {
  const eventDate = new Date(`${event.date}T${event.startTime}`);
  const promoTime = new Date(eventDate.getTime() - PROMO_OFFSET_MINUTES * 60 * 1000);
  return promoTime;
}

// Calculate when to send reminder message (REMINDER_OFFSET_MINUTES before event)
function getReminderScheduleTime(event) {
  const eventDate = new Date(`${event.date}T${event.startTime}`);
  const reminderTime = new Date(eventDate.getTime() - REMINDER_OFFSET_MINUTES * 60 * 1000);
  return reminderTime;
}

// Calculate when to send day-before reminder (1 day before event at 10 AM EST)
function getDayBeforeScheduleTime(event) {
  const eventDate = new Date(`${event.date}T${event.startTime}`);
  const dayBefore = new Date(eventDate);
  dayBefore.setDate(eventDate.getDate() - 1);
  dayBefore.setHours(10, 0, 0, 0); // 10 AM EST
  return dayBefore;
}

// Send promo message
async function sendPromoMessage(event) {
  const message = `🎰 *${event.eventName}* is starting in ${PROMO_OFFSET_MINUTES} minutes!\n\n` +
    `⏰ Time: ${formatTime(event.startTime)}\n` +
    `💰 Stakes: ${event.stakes}\n` +
    `🎮 Game: ${event.gameType}\n` +
    (event.description ? `📝 ${event.description}\n\n` : '\n') +
    `🔗 Register here: ${event.lumaEventUrl || 'Link coming soon!'}`;

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`✅ Sent promo message for ${event.eventName}`);
  } catch (error) {
    console.error(`❌ Error sending promo message for ${event.eventName}:`, error.message);
  }
}

// Send reminder message
async function sendReminderMessage(event) {
  const message = `🚨 *${event.eventName}* starts in ${REMINDER_OFFSET_MINUTES} minutes!\n\n` +
    `🎮 Game link: ${event.gameLink || 'Link coming soon!'}\n` +
    `💬 Chat: ${event.telegramChatLink || 'Link coming soon!'}\n` +
    (event.streamingLink ? `📺 Watch stream: ${event.streamingLink}` : '');

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`✅ Sent reminder message for ${event.eventName}`);
  } catch (error) {
    console.error(`❌ Error sending reminder message for ${event.eventName}:`, error.message);
  }
}

// Send day-before reminder message
async function sendDayBeforeReminder(event) {
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  
  const message = `🎰 *${event.eventName}* is happening tomorrow!\n\n` +
    `📅 Date: ${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n` +
    `⏰ Time: ${timeRange} EST\n` +
    `💰 Stakes: ${event.stakes}\n` +
    `🎮 Game: ${event.gameType}\n` +
    (event.description ? `📝 ${event.description}\n\n` : '\n') +
    `🎯 Don't miss out! RSVP now to secure your spot:\n` +
    `${event.lumaEventUrl || 'Link coming soon!'}\n\n` +
    `See you at the tables! 🃏`;

  try {
    await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: 'Markdown' });
    console.log(`✅ Sent day-before reminder for ${event.eventName}`);
  } catch (error) {
    console.error(`❌ Error sending day-before reminder for ${event.eventName}:`, error.message);
  }
}

// Schedule messages for an event
function scheduleEventMessages(event) {
  const promoTime = getPromoScheduleTime(event);
  const reminderTime = getReminderScheduleTime(event);
  const dayBeforeTime = getDayBeforeScheduleTime(event);
  const now = new Date();

  // Schedule day-before reminder (1 day before at 10 AM)
  if (dayBeforeTime > now) {
    const dayBeforeDelay = dayBeforeTime.getTime() - now.getTime();
    setTimeout(() => {
      sendDayBeforeReminder(event);
    }, dayBeforeDelay);
    console.log(`📅 Scheduled day-before reminder for ${event.eventName} at ${dayBeforeTime.toLocaleString()}`);
  }

  // Only schedule if the time hasn't passed
  if (promoTime > now) {
    const promoDelay = promoTime.getTime() - now.getTime();
    setTimeout(() => {
      sendPromoMessage(event);
    }, promoDelay);
    console.log(`📅 Scheduled promo for ${event.eventName} at ${promoTime.toLocaleString()}`);
  }

  if (reminderTime > now) {
    const reminderDelay = reminderTime.getTime() - now.getTime();
    setTimeout(() => {
      sendReminderMessage(event);
    }, reminderDelay);
    console.log(`📅 Scheduled reminder for ${event.eventName} at ${reminderTime.toLocaleString()}`);
  }
}

// Check for upcoming events and schedule messages
function checkAndScheduleEvents() {
  const events = loadEvents();
  const now = new Date();
  
  // Filter events that are in the future
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(`${event.date}T${event.startTime}`);
    return eventDate > now;
  });

  console.log(`📊 Found ${upcomingEvents.length} upcoming events`);
  
  upcomingEvents.forEach(event => {
    scheduleEventMessages(event);
  });
}

// Run check every minute
cron.schedule('* * * * *', () => {
  checkAndScheduleEvents();
});

// Initial check
console.log('🤖 Telegram bot started');
console.log(`📱 Chat ID: ${CHAT_ID}`);
console.log(`📅 Day-before reminders: 1 day before at 10 AM EST`);
console.log(`⏰ Promo offset: ${PROMO_OFFSET_MINUTES} minutes`);
console.log(`⏰ Reminder offset: ${REMINDER_OFFSET_MINUTES} minutes`);
checkAndScheduleEvents();

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  process.exit(0);
});


