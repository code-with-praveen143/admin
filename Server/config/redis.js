const { createClient } = require('redis');

const client = createClient({
    password: '0U73PsOSp215YlCaOys2Msdnoeg08Z3C',
    socket: {
        host: 'redis-14193.c277.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 14193
    }
});

// Log an error if the client encounters one
client.on('error', (err) => console.error('Redis Client Error:', err));

// Log a successful connection
client.on('connect', () => {
    console.log('Connected to Redis successfully.');
});

// Log when the client disconnects
client.on('end', () => {
    console.log('Disconnected from Redis.');
});

// Connect to the Redis client
(async () => {
    try {
        await client.connect();
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
})();

module.exports = client;
