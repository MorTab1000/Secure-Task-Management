import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const USERNAME = 'test';
const PASSWORD = 'test';

async function main() {
  try {
    // Step 1 — Login
    const loginRes = await axios.post(`${BASE_URL}/login`, {
      username: USERNAME,
      password: PASSWORD
    });

    const token = loginRes.data.token;
    console.log('Login successful. Token:', token);

    // Step 2 — Create 50 notes
    for (let i = 51; i <= 100; i++) {
      const noteData = {
        title: `Test Note ${i}`,
        content: `This is the content of test note number ${i}.`
      };

      await axios.post(`${BASE_URL}/notes`, noteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log(`Created note ${i}`);
    }

    console.log('All 50 notes created successfully!');
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

main();
