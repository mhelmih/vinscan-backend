// src/routes/index.js
import express from 'express';
import cors from 'cors';
import {
  login,
  register,
  loginWithGoogle,
} from './controllers/authController.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', login);
app.post('/register', register);
app.post('/logingoogle', loginWithGoogle);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
