import express from 'express';
import dotenv from 'dotenv';
import connectDb from './utils/db.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();

app.use(express.json());

connectDb();

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

app.use("/api/v1", userRoutes);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});