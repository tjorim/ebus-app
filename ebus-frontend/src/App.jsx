import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [ebusData, setEbusData] = useState(null);

  useEffect(() => {
    // Fetch ebusd data
    axios.get('http://localhost:8000/data')
      .then(response => setEbusData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div style={{ margin: '2rem' }}>
      <h1>eBUSD Interface</h1>
      <section>
        <h2>Data</h2>
        {ebusData ? (
          <pre>{JSON.stringify(ebusData, null, 2)}</pre>
        ) : (
          <p>Loading data...</p>
        )}
      </section>
    </div>
  );
}

export default App;
