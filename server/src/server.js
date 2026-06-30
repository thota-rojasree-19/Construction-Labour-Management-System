const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
