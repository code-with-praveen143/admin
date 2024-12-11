// server/scripts/test-connection.js

const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        
        let uri = process.env.MONGODB_URI;
        if (!uri.includes('mongodb.net/')) {
            uri = uri.replace('mongodb.net/', 'mongodb.net/adminBoard?');
        }

        await mongoose.connect(uri);
        console.log('MongoDB connection successful!');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        await mongoose.connection.close();
        console.log('\nConnection closed successfully');
    } catch (error) {
        console.error('Connection error:', error.message);
    } finally {
        process.exit(0);
    }
}

testConnection();