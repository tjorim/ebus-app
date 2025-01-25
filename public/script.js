async function fetchData() {
    const container = document.getElementById('data-container');
    
    // Indicate loading state
    container.textContent = 'Loading data...';

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
    
    // Assume `data` is an array of objects for example
    if (Array.isArray(data) && data.length > 0) {
        const list = document.createElement('ul'); // Create a list to display data
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = JSON.stringify(item, null, 2); // Format item as JSON
            list.appendChild(listItem);
        });
        container.appendChild(list); // Append the list to the container
    } else {
        container.textContent = 'No data available.'; // Handle empty data
    }
}

// Update every 5 seconds
setInterval(fetchData, 5000);
fetchData(); // Initial fetch on page load