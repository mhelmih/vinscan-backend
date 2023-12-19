const { db } = require('../firebase');
const {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} = require('firebase/firestore');

/**
 * @swagger
 * /api/v1/assets:
 *   post:
 *     summary: Create an asset in a user
 *     tags: [Assets]
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [cash, bank, e-wallet]
 *                 description: Asset category (Cash, Bank, or E-Wallet)
 *               subcategory:
 *                 type: string
 *                 description: Asset sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *               amount:
 *                 type: number
 *                 description: Asset amount
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const createAsset = async (req, res) => {
  try {
    const user = req.user;
    const data = req.body;
    if (!data.category || !data.subcategory || !data.amount) {
      res.status(400).send({
        message: 'category, subcategory, and amount are required',
      });
      return;
    }
    if (
      data.category !== 'Cash' &&
      data.category !== 'Bank' &&
      data.category !== 'E-Wallet'
    ) {
      res.status(400).send({
        message: 'category must be Cash, Bank, or E-Wallet',
      });
      return;
    }

    const createdAt = serverTimestamp();
    const assetRef = collection(db, 'users', user.uid, 'assets');
    const docRef = await addDoc(assetRef, {
      ...data,
      createdAt,
    });

    res.status(201).send({
      message: `Asset created successfully with ID: ${docRef.id}`,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get all assets from a user
 *     tags: [Assets]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Asset ID
 *                   category:
 *                     type: string
 *                     enum: [cash, bank, e-wallet]
 *                     description: Asset category (cash, bank, or e-wallet)
 *                   subCategory:
 *                     type: string
 *                     description: Asset sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *                   amount:
 *                     type: number
 *                     description: Asset amount
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Asset creation date
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const getAssets = async (req, res) => {
  try {
    const user = req.user;
    const assetRef = collection(db, 'users', user.uid, 'assets');
    const assetsSnapshot = await getDocs(assetRef);

    if (assetsSnapshot.empty) {
      res.status(200).json([]);
      return;
    }

    const assets = [];
    assetsSnapshot.forEach((doc) => {
      assets.push({
        id: doc.id,
        ...doc.data(),
        // Convert the createdAt field to a Date object
        createdAt: doc.data().createdAt.toDate(),
      });
    });
    res.status(200).json(assets);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/assets/{assetId}:
 *   get:
 *     summary: Get an asset from a user
 *     tags: [Assets]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: assetId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: Asset ID from Firestore
 *     responses:
 *       200:
 *         description: Asset retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Asset ID
 *                 category:
 *                   type: string
 *                   enum: [cash, bank, e-wallet]
 *                   description: Asset category (cash, bank, or e-wallet)
 *                 subCategory:
 *                   type: string
 *                   description: Asset sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *                 amount:
 *                   type: number
 *                   description: Asset amount
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Asset creation date
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
const getAsset = async (req, res) => {
  try {
    const user = req.user;
    const assetId = req.params.assetId;

    const assetRef = doc(db, 'users', user.uid, 'assets', assetId);
    const assetDoc = await getDoc(assetRef);

    if (!assetDoc.exists()) {
      res.status(404).send({ message: 'Asset not found' });
      return;
    }

    res.status(200).json({
      id: assetDoc.id,
      ...assetDoc.data(),
      // Convert the createdAt field to a Date object
      createdAt: assetDoc.data().createdAt.toDate(),
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/assets/{assetId}:
 *   put:
 *     summary: Update an asset from a user
 *     tags: [Assets]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: assetId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: Asset ID from Firestore
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [cash, bank, e-wallet]
 *                 description: Asset category (Cash, Bank, or E-Wallet)
 *               subcategory:
 *                 type: string
 *                 description: Asset sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *               amount:
 *                 type: number
 *                 description: Asset amount
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
const updateAsset = async (req, res) => {
  try {
    const user = req.user;
    const assetId = req.params.assetId;
    const data = req.body;

    if (!data.category || !data.subcategory || !data.amount) {
      res.status(400).send({
        message: 'category, subcategory, and amount are required',
      });
      return;
    }
    if (
      data.category !== 'Cash' &&
      data.category !== 'Bank' &&
      data.category !== 'E-Wallet'
    ) {
      res.status(400).send({
        message: 'category must be Cash, Bank, or E-Wallet',
      });
      return;
    }
    if (data.amount < 0) {
      res.status(400).send({
        message: 'amount must be greater than or equal to 0',
      });
      return;
    }

    const assetRef = doc(db, 'users', user.uid, 'assets', assetId);
    if (!assetRef.exists()) {
      res.status(404).send({ message: 'Asset not found' });
      return;
    }
    
    await updateDoc(assetRef, data);
    res.status(200).send({ message: 'Asset updated successfully'});
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/assets/{assetId}:
 *   delete:
 *     summary: Delete an asset from a user
 *     tags: [Assets]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - name: assetId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: Asset ID from Firestore
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
const deleteAsset = async (req, res) => {
  try {
    const user = req.user;
    const assetId = req.params.assetId;

    const assetRef = doc(db, 'users', user.uid, 'assets', assetId);
    await deleteDoc(assetRef);

    res.status(200).send('Asset deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  updateAsset,
};
