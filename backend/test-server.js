// Minimal test server
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'Server is running'
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`✅ Test: http://localhost:${PORT}/api/health`);
});
