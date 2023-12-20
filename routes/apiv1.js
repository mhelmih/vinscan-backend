const express = require('express');
const {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  updateAsset,
} = require('../controllers/assetsController');
const {
  login,
  register,
  resetPassword,
} = require('../controllers/authController');
const {
  createRecord,
  deleteRecord,
  getRecord,
  getRecords,
  getAnnualRecords,
  updateRecord,
} = require('../controllers/recordsController');
const {
  deleteUser,
  getUser,
} = require('../controllers/usersController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const routerV1 = express.Router();

routerV1.get('/', (req, res) => {
  res.send('Vinscan API v1');
});

routerV1.post('/login', login);
routerV1.post('/register', register);
routerV1.post('/reset-password', isAuthenticated, resetPassword);

routerV1.get('/user', isAuthenticated, getUser);
routerV1.delete('/user', isAuthenticated, deleteUser);

routerV1.post('/assets', isAuthenticated, createAsset);
routerV1.get('/assets', isAuthenticated, getAssets);
routerV1.get('/assets/:assetId', isAuthenticated, getAsset);
routerV1.put('/assets/:assetId', isAuthenticated, updateAsset);
routerV1.delete('/assets/:assetId', isAuthenticated, deleteAsset);

routerV1.post('/records', isAuthenticated, createRecord);
routerV1.get('/records', isAuthenticated, getRecords);
routerV1.get('/records/annual', isAuthenticated, getAnnualRecords);
routerV1.get('/records/:recordId', isAuthenticated, getRecord);
routerV1.put('/records/:recordId', isAuthenticated, updateRecord);
routerV1.delete('/records/:recordId', isAuthenticated, deleteRecord);

module.exports = routerV1;
