// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import fetch from 'cross-fetch';
globalThis.fetch = fetch;
import modelsRoute from './routes/models.js';

import geminiRoute from './routes/gemini.js';

dotenv.config();

const app = express();
app.use(cors());
app.use('/api/models', modelsRoute);

app.use(express.json());
app.use(morgan('dev'));

app.use('/api/gemini', geminiRoute);

const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('✅ Janani Backend is Running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
