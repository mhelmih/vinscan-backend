import express from 'express';
import cors from 'cors';
import {
  login,
  register,
  resetPassword,
} from './controllers/authController.js';
import {
  getUsers,
  getUser,
  deleteUser,
} from './controllers/usersController.js';
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
app.post('/reset-password', resetPassword);

app.get('/users', getUsers);
app.get('/users/:userId', getUser);
app.delete('/users', deleteUser);

app.post('/:userId/assets', createAsset);
app.get('/:userId/assets', getAssets);
app.get('/:userId/assets/:assetId', getAsset);
app.put('/:userId/assets/:assetId', updateAsset);
app.delete('/:userId/assets/:assetId', deleteAsset);

app.post('/:userId/records', createRecord);
app.get('/:userId/records', getRecords);
app.get('/:userId/records/:recordId', getRecord);
app.put('/:userId/records/:recordId', updateRecord);
app.delete('/:userId/records/:recordId', deleteRecord);

app.listen(PORT, () => {
  console.log(`Server up and running on port http://localhost:${PORT}`);
});
