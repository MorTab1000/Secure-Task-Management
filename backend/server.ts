import dotenv from 'dotenv';
dotenv.config();
import app from './expressApp';
import connectDB from './config/db';

const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
