import express from 'express';
import dotenv from 'dotenv';
import { sql } from './utils/db.js';

dotenv.config();

const app = express();

app.use(express.json());

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        blogcontent TEXT NOT NULL,
        image VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
   await sql`
  CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    comment VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    blogid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

await sql`
  CREATE TABLE IF NOT EXISTS savedblogs (
    id SERIAL PRIMARY KEY,
    
    userid VARCHAR(255) NOT NULL,
    
    blogid VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

    console.log("Database initialized");
  } catch (error) {
    console.log("Error initDB",error);
  }
}

initDB().then(()=>{
    const port = process.env.PORT || 5001;

    app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
}); 

