import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config({ path: '../.env' });

// Load models
import User from '../models/User.js';
import Bin from '../models/Bin.js';
import Complaint from '../models/Complaint.js';
import Area from '../models/Area.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Bin.deleteMany();
    await Complaint.deleteMany();
    await Area.deleteMany();

    // --- Create Cities and Areas ---
    const areasToCreate = [
      { city: 'Pune', name: 'Kothrud' }, { city: 'Pune', name: 'Aundh' }, { city: 'Pune', name: 'Viman Nagar' }, { city: 'Pune', name: 'Deccan Gymkhana' }, { city: 'Pune', name: 'Hinjewadi' },
      { city: 'Mumbai', name: 'Andheri' }, { city: 'Mumbai', name: 'Bandra' }, { city: 'Mumbai', name: 'Dadar' }, { city: 'Mumbai', name: 'Juhu' }, { city: 'Mumbai', name: 'Colaba' },
      { city: 'Nagpur', name: 'Dharampeth' }, { city: 'Nagpur', name: 'Sitabuldi' }, { city: 'Nagpur', name: 'Ramdaspeth' }, { city: 'Nagpur', name: 'Civil Lines' }, { city: 'Nagpur', name: 'Manish Nagar' },
      { city: 'Nashik', name: 'Gangapur Road' }, { city: 'Nashik', name: 'College Road' }, { city: 'Nashik', name: 'Indira Nagar' }, { city: 'Nashik', name: 'Panchavati' }, { city: 'Nashik', name: 'Nashik Road' },
      { city: 'Kolhapur', name: 'Shahupuri' }, { city: 'Kolhapur', name: 'Laxmipuri' }, { city: 'Kolhapur', name: 'Rajarampuri' }, { city: 'Kolhapur', name: 'Tarabai Park' }, { city: 'Kolhapur', name: 'Shivaji Peth' }
    ];
    await Area.insertMany(areasToCreate);
    console.log('Cities and Areas Imported!');

    // --- Create Users ---
    const salt = await bcrypt.genSalt(10);
    const usersToCreate = [
      // Citizens
      { name: 'Anjali (Pune Citizen)', email: 'citizen.pune@test.com', password: await bcrypt.hash('password123', salt), role: 'Citizen', city: 'Pune', area: 'Kothrud', addressLine: '123 Kothrud Lane' },
      { name: 'Rohan (Kolhapur Citizen)', email: 'citizen.kop@test.com', password: await bcrypt.hash('password123', salt), role: 'Citizen', city: 'Kolhapur', area: 'Shahupuri', addressLine: '456 Shahupuri Road' },
      
      // === EDITED: Added More Workers ===
      // Pune Workers
      { name: 'Suresh (Pune Worker)', email: 'worker.pune.kothrud@test.com', workerId: 'WKR-PUNE-01', password: await bcrypt.hash('password123', salt), role: 'Worker', city: 'Pune', area: 'Kothrud' },
      { name: 'Deepak (Pune Worker)', email: 'worker.pune.aundh@test.com', workerId: 'WKR-PUNE-02', password: await bcrypt.hash('password123', salt), role: 'Worker', city: 'Pune', area: 'Aundh' },
      // Mumbai Workers
      { name: 'Amit (Mumbai Worker)', email: 'worker.mumbai.andheri@test.com', workerId: 'WKR-MUM-01', password: await bcrypt.hash('password123', salt), role: 'Worker', city: 'Mumbai', area: 'Andheri' },
      // Kolhapur Workers
      { name: 'Mahesh (Kolhapur Worker)', email: 'worker.kop.shahupuri@test.com', workerId: 'WKR-KOP-01', password: await bcrypt.hash('password123', salt), role: 'Worker', city: 'Kolhapur', area: 'Shahupuri' },
      { name: 'Vikas (Kolhapur Worker)', email: 'worker.kop.rajarampuri@test.com', workerId: 'WKR-KOP-02', password: await bcrypt.hash('password123', salt), role: 'Worker', city: 'Kolhapur', area: 'Rajarampuri' },
      
      // Officers
      { name: 'Priya Singh (Pune Officer)', email: 'officer.pune@test.com', password: await bcrypt.hash('password123', salt), role: 'Officer', city: 'Pune' },
      { name: 'Vikram Rathod (Mumbai Officer)', email: 'officer.mumbai@test.com', password: await bcrypt.hash('password123', salt), role: 'Officer', city: 'Mumbai' },
    ];
    await User.insertMany(usersToCreate);
    console.log('Users Imported!');

    // --- Create Bins ---
    const binsToCreate = [
        { binId: 'PUNE-KTD-01', location: { type: 'Point', coordinates: [73.8076, 18.5074] }, city: 'Pune', area: 'Kothrud', status: 'Half-Full' },
        { binId: 'PUNE-AND-01', location: { type: 'Point', coordinates: [73.8085, 18.5615] }, city: 'Pune', area: 'Aundh', status: 'Full' },
        { binId: 'MUM-AND-01', location: { type: 'Point', coordinates: [72.8681, 19.1197] }, city: 'Mumbai', area: 'Andheri', status: 'Full' },
        { binId: 'MUM-BND-01', location: { type: 'Point', coordinates: [72.8411, 19.0544] }, city: 'Mumbai', area: 'Bandra', status: 'Empty' },
        { binId: 'KOP-SHP-01', location: { type: 'Point', coordinates: [74.2433, 16.7048] }, city: 'Kolhapur', area: 'Shahupuri', status: 'Overflow' },
    ];
    await Bin.insertMany(binsToCreate);
    console.log('Bins Imported!');

    console.log('Data Import Complete!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Bin.deleteMany();
    await Complaint.deleteMany();
    await Area.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error}`);
    process.exit(1);
  }
};

const run = async () => {
    await connectDB();
    if (process.argv[2] === '--delete') {
        await destroyData();
    } else {
        await importData();
    }
};

run();