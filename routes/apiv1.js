import express from 'express';
import {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  updateAsset,
} from '../controllers/assetsController.js';
import {
  login,
  register,
  resetPassword,
} from '../controllers/authController.js';
import {
  createRecord,
  deleteRecord,
  getRecord,
  getRecords,
  updateRecord,
} from '../controllers/recordsController.js';
import {
  deleteUser,
  getUser,
  getUsers,
} from '../controllers/usersController.js';

const routerV1 = express.Router();

routerV1.get('/', (req, res) => {
  res.send('Vinscan API v1');
});

routerV1.post('/login', login);
routerV1.post('/register', register);
routerV1.post('/reset-password', resetPassword);

routerV1.get('/users', getUsers);
routerV1.get('/users/:userId', getUser);
routerV1.delete('/users', deleteUser);

routerV1.post('/:userId/assets', createAsset);
routerV1.get('/:userId/assets', getAssets);
routerV1.get('/:userId/assets/:assetId', getAsset);
routerV1.put('/:userId/assets/:assetId', updateAsset);
routerV1.delete('/:userId/assets/:assetId', deleteAsset);

routerV1.post('/:userId/records', createRecord);
routerV1.get('/:userId/records', getRecords);
routerV1.get('/:userId/records/:recordId', getRecord);
routerV1.put('/:userId/records/:recordId', updateRecord);
routerV1.delete('/:userId/records/:recordId', deleteRecord);

export default routerV1;
