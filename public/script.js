async function fetchData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        // Display data
        const container = document.getElementById('data-container');
        container.textContent = JSON.stringify(data, null, 2); // Display the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('data-container').textContent = 'Error fetching data';
    }
}

// Update every 5 seconds
setInterval(fetchData, 5000);
fetchData(); // Initial fetch on page load