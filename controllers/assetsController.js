import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

/**
 * @swagger
 * /api/v1/{userId}/assets:
 *   post:
 *     summary: Create an asset in a user
 *     tags: [Assets]
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID from Firebase Authentication
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
 *                 description: Asset category (cash, bank, or e-wallet)
 *               subCategory:
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
 *       500:
 *         description: Internal server error
 */
export const createAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;
    if (!data.category || !data.subCategory || !data.amount) {
      res.status(400).send({
        message: 'category, sub-category, and amount are required',
      });
      return;
    }
    if (
      data.category !== 'cash' &&
      data.category !== 'bank' &&
      data.category !== 'e-wallet'
    ) {
      res.status(400).send({
        message: 'category must be cash, bank, or e-wallet',
      });
      return;
    }

    const createdAt = serverTimestamp();
    const assetRef = collection(db, 'users', userId, 'assets');
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
 * /api/v1/{userId}/assets:
 *   get:
 *     summary: Get all assets from a user
 *     tags: [Assets]
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID from Firebase Authentication
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
 *       404:
 *         description: Assets not found
 *       500:
 *         description: Internal server error
 */
export const getAssets = async (req, res) => {
  try {
    const userId = req.params.userId;

    const assetRef = collection(db, 'users', userId, 'assets');
    const assetsSnapshot = await getDocs(assetRef);

    if (assetsSnapshot.empty) {
      res.status(200).json([]);
      return;
    }
    if (!assetsSnapshot.docs) {
      res.status(404).send('Assets not found');
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
 * /api/v1/{userId}/assets/{assetId}:
 *   get:
 *     summary: Get an asset from a user
 *     tags: [Assets]
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID from Firebase Authentication
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
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
export const getAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assetId = req.params.assetId;

    const assetRef = doc(db, 'users', userId, 'assets', assetId);
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
 * /api/v1/{userId}/assets/{assetId}:
 *   put:
 *     summary: Update an asset from a user
 *     tags: [Assets]
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID from Firebase Authentication
 *     - name: assetId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: Asset ID from Firestore
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
export const updateAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assetId = req.params.assetId;
    const data = req.body;

    const assetRef = doc(db, 'users', userId, 'assets', assetId);
    await updateDoc(assetRef, data);
    if (!assetRef.exists()) {
      res.status(404).send({ message: 'Asset not found' });
      return;
    }

    res.status(200).send({ message: 'Asset updated successfully'});
  } catch (error) {
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/{userId}/assets/{assetId}:
 *   delete:
 *     summary: Delete an asset from a user
 *     tags: [Assets]
 *     parameters:
 *     - name: userId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: User ID from Firebase Authentication
 *     - name: assetId
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: Asset ID from Firestore
 *     responses:
 *       200:
 *         description: Asset updated successfully
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Internal server error
 */
export const deleteAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assetId = req.params.assetId;

    const assetRef = doc(db, 'users', userId, 'assets', assetId);
    await deleteDoc(assetRef);

    res.status(200).send('Asset deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
