// Add this to your frontend temporarily
const testBackend = async () => {
  try {
    const response = await fetch('https://e-siksha-3tzs.onrender.com/api/health');
    const data = await response.json();
    console.log('Backend health:', data);
    return data;
  } catch (error) {
    console.error('Cannot connect to backend:', error);
    return null;
  }
};

// Call it on app load
testBackend();``