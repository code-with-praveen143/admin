// server/scripts/create-super-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Modified MongoDB connection with explicit database name and better error handling
async function connectDB() {
    try {
        // Add database name to URI if not present
        let uri = process.env.MONGODB_URI;
        if (!uri.includes('mongodb.net/')) {
            uri = uri.replace('mongodb.net/', 'mongodb.net/adminBoard?');
        }

        console.log('Attempting to connect to MongoDB...');
        
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

async function createSuperAdmin() {
    try {
        // Connect to database
        await connectDB();

        console.log('Checking for existing SuperAdmin...');
        const existingSuperAdmin = await User.findOne({ role: 'SuperAdmin' });
        
        if (existingSuperAdmin) {
            console.log('SuperAdmin already exists!');
            await mongoose.connection.close();
            return;
        }

        console.log('Creating new SuperAdmin...');
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12);
        
        const superAdmin = new User({
            username: process.env.SUPER_ADMIN_USERNAME,
            email: process.env.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: 'SuperAdmin',
            isVerified: true,
            isSuperAdmin: true
        });

        await superAdmin.save();
        
        console.log('\nSuperAdmin created successfully!');
        console.log('----------------------------------------');
        console.log('Username:', superAdmin.username);
        console.log('Email:', superAdmin.email);
        console.log('----------------------------------------');
        
    } catch (error) {
        console.error('Error creating SuperAdmin:', error.message);
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', Object.keys(error.errors).map(key => ({
                field: key,
                message: error.errors[key].message
            })));
        }
    } finally {
        try {
            await mongoose.connection.close();
            console.log('Database connection closed');
        } catch (err) {
            console.error('Error closing database connection:', err.message);
        }
        process.exit(0);
    }
}

// Run the script with better error handling
createSuperAdmin().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});