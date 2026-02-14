const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Event = require('./src/models/Event');

const initialEvents = [
  {
    title: "Wonderful Gathering",
    date: new Date("2025-06-29"),
    time: "06:00 PM",
    location: "7th main road,12th cross street,pudhu nallur,Kundrathur,ch-600069.",
    description: "Join us for a wonderful time of fellowship and worship.",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=250&fit=crop&auto=format"
  },
  {
    title: "Building Bonds",
    date: new Date("2025-06-29"),
    time: "06:00 PM",
    location: "7th main road,12th cross street,pudhu nallur,Kundrathur,ch-600069.",
    description: "Strengthening our community through faith and friendship.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&auto=format"
  },
  {
    title: "Thankfulness",
    date: new Date("2025-07-12"),
    time: "12:00 PM",
    location: "7th main road,12th cross street,pudhu nallur,Kundrathur,ch-600069.",
    description: "A special service dedicated to gratitude and thanksgiving.",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=250&fit=crop&auto=format"
  }
];

async function seedEvents() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mani12kandan654_db_user:ChrTsxh9Iqxie0v6@cluster3.0usidkf.mongodb.net/church_donations';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events.');

    // Insert initial events
    await Event.insertMany(initialEvents);
    console.log('Successfully seeded initial events!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();
