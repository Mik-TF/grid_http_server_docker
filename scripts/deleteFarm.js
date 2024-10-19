const axios = require('axios');

async function deleteFarm() {
  try {
    // Assuming the farm ID is needed for deletion. Replace '1230' with the actual farm ID if different.
    const farmId = 5263;
    
    const response = await axios.post('http://localhost:3000/farms/delete', {
      id: farmId
    });
    
    console.log('Farm deleted:', response.data);
  } catch (error) {
    console.error('Error deleting farm:', error.response?.data || error.message);
  }
}

deleteFarm();