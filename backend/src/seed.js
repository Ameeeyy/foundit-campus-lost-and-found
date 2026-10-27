import dotenv from 'dotenv';
import User from './models/User.js';
import Listing from './models/Listing.js';
import { connectDB } from './config/db.js';

dotenv.config();

const sampleUsers = [
  { name: 'Campus Admin', email: 'admin@foundit.test', passwordHash: '$2a$10$Q5q3Ygobg7aK0YvQXwDGFeJb5vG5m8Nxd2rh1vE0z7x0w4o0L2mGi', role: 'admin', campusId: 'CAMP-100' },
  { name: 'Aisha Khan', email: 'aisha@foundit.test', passwordHash: '$2a$10$Q5q3Ygobg7aK0YvQXwDGFeJb5vG5m8Nxd2rh1vE0z7x0w4o0L2mGi', role: 'user', campusId: 'CS-201' },
  { name: 'Daniel Lee', email: 'daniel@foundit.test', passwordHash: '$2a$10$Q5q3Ygobg7aK0YvQXwDGFeJb5vG5m8Nxd2rh1vE0z7x0w4o0L2mGi', role: 'user', campusId: 'ME-412' },
  { name: 'Priya Nair', email: 'priya@foundit.test', passwordHash: '$2a$10$Q5q3Ygobg7aK0YvQXwDGFeJb5vG5m8Nxd2rh1vE0z7x0w4o0L2mGi', role: 'user', campusId: 'EE-105' },
  { name: 'Marcus Reed', email: 'marcus@foundit.test', passwordHash: '$2a$10$Q5q3Ygobg7aK0YvQXwDGFeJb5vG5m8Nxd2rh1vE0z7x0w4o0L2mGi', role: 'user', campusId: 'BUS-304' },
];

const listingSeeds = [
  {
    createdByIndex: 0,
    type: 'LOST',
    title: 'Black Water Bottle',
    description: 'Lost a black insulated water bottle near the engineering library.',
    category: 'Water bottles',
    location: 'Engineering Library',
    dateLostOrFound: '2025-02-12',
    details: 'Has a blue sticker and a silver cap.',
  },
  {
    createdByIndex: 1,
    type: 'FOUND',
    title: 'Black Water Bottle',
    description: 'Found a black insulated bottle in the study room near the library desk.',
    category: 'Water bottles',
    location: 'Engineering Library',
    dateLostOrFound: '2025-02-14',
    details: 'Currently kept at the front desk.',
  },
  {
    createdByIndex: 2,
    type: 'LOST',
    title: 'Blue USB-C Cable',
    description: 'Lost a blue USB-C cable after the lab class in the science block.',
    category: 'Electronics',
    location: 'Science Block',
    dateLostOrFound: '2025-02-17',
    details: 'Looks like a charging cable with a red sleeve.',
  },
  {
    createdByIndex: 3,
    type: 'FOUND',
    title: 'Student ID Card',
    description: 'Found a student ID card near the cafeteria entrance.',
    category: 'ID cards and documents',
    location: 'Cafeteria',
    dateLostOrFound: '2025-02-16',
    details: 'Name is partially readable and card is laminated.',
  },
  {
    createdByIndex: 4,
    type: 'LOST',
    title: 'Silver Keychain',
    description: 'Lost a silver keychain with a tiny campus medallion attached.',
    category: 'Keys',
    location: 'Student Center',
    dateLostOrFound: '2025-02-11',
    details: 'Small round metal tag with initials M.R.',
  },
  {
    createdByIndex: 0,
    type: 'FOUND',
    title: 'Red Backpack',
    description: 'Found a red backpack by the basketball court.',
    category: 'Bags and wallets',
    location: 'Basketball Court',
    dateLostOrFound: '2025-02-18',
    details: 'Contains a notebook and a pencil case.',
  },
  {
    createdByIndex: 1,
    type: 'LOST',
    title: 'Pink Notebook',
    description: 'Lost a pink spiral notebook containing exam notes.',
    category: 'Books and stationery',
    location: 'Main Hall',
    dateLostOrFound: '2025-02-19',
    details: 'Notebook has a sunflower drawing on the cover.',
  },
  {
    createdByIndex: 2,
    type: 'FOUND',
    title: 'Black Wallet',
    description: 'Found a black wallet with a student card inside.',
    category: 'Bags and wallets',
    location: 'Bus Stop',
    dateLostOrFound: '2025-02-20',
    details: 'Wallet has a zipper pocket and is slightly worn.',
  },
  {
    createdByIndex: 3,
    type: 'LOST',
    title: 'Grey Hoodie',
    description: 'Lost a grey hoodie from the auditorium after the club meeting.',
    category: 'Clothing and accessories',
    location: 'Auditorium',
    dateLostOrFound: '2025-02-15',
    details: 'Hood has a campus logo stitched on the left sleeve.',
  },
  {
    createdByIndex: 4,
    type: 'FOUND',
    title: 'Wireless Earbuds',
    description: 'Found a pair of wireless earbuds under a bench near the north gate.',
    category: 'Electronics',
    location: 'North Gate',
    dateLostOrFound: '2025-02-21',
    details: 'Case is white and the earbuds are black.',
  },
  {
    createdByIndex: 0,
    type: 'LOST',
    title: 'Mathematics Textbook',
    description: 'Lost a mathematics textbook from my locker in the engineering block.',
    category: 'Books and stationery',
    location: 'Engineering Block',
    dateLostOrFound: '2025-02-09',
    details: 'Book is hardcover and has a blue marker stripe.',
  },
  {
    createdByIndex: 1,
    type: 'FOUND',
    title: 'Campus Access Card',
    description: 'Found a campus access card outside the library entrance.',
    category: 'ID cards and documents',
    location: 'Library Entrance',
    dateLostOrFound: '2025-02-22',
    details: 'Card belongs to a student from the design faculty.',
  },
];

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Listing.deleteMany({});

    const users = await User.insertMany(sampleUsers);

    const records = listingSeeds.map((entry) => ({
      ...entry,
      createdBy: users[entry.createdByIndex]._id,
      dateLostOrFound: new Date(entry.dateLostOrFound),
    }));

    await Listing.insertMany(records);

    console.log(`Seed data created: ${users.length} users and ${records.length} listings`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
