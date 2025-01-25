const express = require('express');

const app = express();
const EBUSD_HOST = process.env.EBUSD_HOST || "192.168.0.92";
const EBUSD_PORT = process.env.EBUSD_PORT || 8889;

// Serve static files from the "public" directory
app.use(express.static('public'));

// Function to fetch data from the local API
const fetchData = async (req, res) => {
    try {
        const response = await fetch(`http://${EBUSD_HOST}:${EBUSD_PORT}/data`);
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(`Failed to fetch data: ${error.message}`);  // Log error
        res.status(500).json({ error: 'Internal Server Error' });  // Generic error message
    }
};

// Endpoint to fetch data from the local API
app.get('/api/data', fetchData);

const PORT = process.env.PORT || 3000;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});