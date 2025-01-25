const express = require('express');

const app = express();
const EBUSD_HOST = "192.168.0.92";
const EBUSD_PORT = 8889;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to fetch data from the local API
app.get('/api/data', async (req, res) => {
    try {
        const response = await fetch(`http://${EBUSD_HOST}:${EBUSD_PORT}/data`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});