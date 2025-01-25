// Fetch eBUS data from the server endpoint
async function fetchData() {
    const container = document.getElementById('data-container');
    container.textContent = 'Loading data...';    // Indicate loading state

    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // Check if the response was OK
        const data = await response.json();

        // Display data in a readable format
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        container.textContent = 'Error fetching data: ' + error.message; // Provide detailed error message
    }
}

function displayData(data) {
    const container = document.getElementById('data-container');
    
    // Clear previous content
    container.innerHTML = '';

    // Create a formatted string from the data object
    const formattedData = Object.entries(data)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
    container.innerHTML = `<pre>${formattedData}</pre>`;
}

setInterval(fetchData, 5000); // Update data every 5 seconds
fetchData(); // Initial fetch when page loads