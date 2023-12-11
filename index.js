import express from 'express';
import cors from 'cors';
import {
  login,
  register,
  loginWithGoogle,
} from './controllers/authController.js';
import {
  createAsset,
  getAssets,
  getAsset,
  updateAsset,
  deleteAsset,
} from './controllers/assetsController.js';
import {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} from './controllers/recordsController.js';

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

app.post('/assets', createAsset);
app.get('/assets', getAssets);
app.get('/assets/:id', getAsset);
app.put('/assets/:id', updateAsset);
app.delete('/assets/:id', deleteAsset);

app.post('/records', createRecord);
app.get('/records', getRecords);
app.get('/records/:id', getRecord);
app.put('/records/:id', updateRecord);
app.delete('/records/:id', deleteRecord);

app.listen(PORT, () => {
  console.log(`Server up and running on port http://localhost:${PORT}`);
});
