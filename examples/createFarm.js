const axios = require('axios');

async function createFarm() {
  try {
    const response = await axios.post('http://localhost:3000/farms/create', {
      name: "farm1230"
    });
    console.log('Farm created:', response.data);
  } catch (error) {
    console.error('Error creating farm:', error.response?.data || error.message);
  }
}

createFarm();