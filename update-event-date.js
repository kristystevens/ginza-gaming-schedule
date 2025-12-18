/**
 * Script to update event date
 */

const https = require('https');
const http = require('http');

const eventId = '1764646105251';

// Calculate Monday of current week (week starts on Sunday)
const today = new Date();
const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
// Get Sunday of this week
const sunday = new Date(today);
sunday.setDate(today.getDate() - dayOfWeek);
sunday.setHours(0, 0, 0, 0);
// Monday is the day after Sunday
const monday = new Date(sunday);
monday.setDate(sunday.getDate() + 1);
const newDate = monday.toISOString().split('T')[0]; // Monday

console.log(`Calculated Monday: ${newDate} (${monday.toLocaleDateString('en-US', { weekday: 'long' })})`);

const updateData = JSON.stringify({
  id: eventId,
  date: newDate
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': updateData.length
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Event updated successfully!');
        console.log(`   Event: ${response.eventName}`);
        console.log(`   New Date: ${response.date} (${new Date(response.date).toLocaleDateString('en-US', { weekday: 'long' })})`);
      } else {
        console.error('❌ Error:', response);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
  console.log('\n💡 Make sure the Next.js server is running on port 3000');
});

req.write(updateData);
req.end();

