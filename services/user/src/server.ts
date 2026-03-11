import express from 'express';
import dotenv from 'dotenv';
import connectDb from './utils/db.js';
dotenv.config();
const app = express();
connectDb();
const port=process.env.PORT;
app.listen(port, () => {
    console.log(`Server is runnin on port ${port}`);
});
