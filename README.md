# Ginza Gaming Poker Schedule

A web application for managing and displaying poker event schedules for Ginza Gaming, a crypto-backed invite-only poker community.

## Features

- 📅 **Schedule View**: Daily and weekly views of poker events
- 🎮 **Event Actions**: Quick links to watch streams, join games, open Telegram chats, and register on Luma
- 👨‍💼 **Admin Panel**: Full CRUD operations for managing events
- 🤖 **Telegram Bot**: Automated promo and reminder messages
- 🎨 **Dark Theme**: Premium poker/crypto-themed UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Bot**: Telegraf + node-cron

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the schedule.

### 3. Access Admin Panel

Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) to manage events.

### 4. Set Up Telegram Bot (Optional)

1. Create a `.env` file in the root directory:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
PROMO_OFFSET_MINUTES=120
REMINDER_OFFSET_MINUTES=10
```

2. Get your bot token from [@BotFather](https://t.me/botfather) on Telegram
3. Get your chat ID:
   - For the Ginza Public Chat: The chat ID for [Ginza Public Chat](https://t.me/+tUSssIotf7QzZGRh) needs to be obtained
   - You can use [@userinfobot](https://t.me/userinfobot) or check Telegram API
   - Or add your bot to the group and use [@RawDataBot](https://t.me/RawDataBot) to get the chat ID

4. Run the bot:

```bash
node telegram-bot.js
```

The bot will:
- Send day-before reminder messages (1 day before each event at 10 AM EST) - encourages RSVP
- Send promo messages 2 hours before each event (configurable)
- Send reminder messages 10 minutes before each event (configurable)

## Project Structure

```
ginza-gaming-schedule/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main schedule view
│   │   ├── admin/
│   │   │   └── page.tsx       # Admin panel
│   │   └── api/
│   │       └── events/        # API routes for events
│   └── lib/
│       └── events.ts          # Event data and utilities
├── telegram-bot.js            # Telegram bot script
└── data/
    └── events.json            # Events exported for bot (auto-generated)
```

## Event Data Structure

Each event contains:

- `id`: Unique identifier
- `eventName`: Name of the event
- `date`: Date in YYYY-MM-DD format
- `startTime`: Time in HH:MM format
- `stakes`: Stakes description (e.g., "NLH 1/2")
- `gameType`: Type of game (e.g., "No Limit Hold'em")
- `description`: Optional description
- `streamingLink`: Optional streaming URL
- `gameLink`: Optional game/table URL
- `telegramChatLink`: Optional Telegram chat URL
- `lumaEventUrl`: Optional Luma event registration URL

## Building for Production

```bash
npm run build
npm start
```

## Notes

- Events are currently stored in-memory. For production, integrate with a database.
- The Telegram bot reads from `data/events.json`, which is auto-generated when events are accessed via the API.
- Make sure to sync events before running the bot by visiting `/api/events/export` or accessing the admin panel.
