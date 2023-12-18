import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase.js';

export const createAsset = async (req, res) => {
  try {
    const user = auth.currentUser;
    const data = req.body;
    const createdAt = serverTimestamp();

    const assetRef = collection(db, 'users', user.uid, 'assets');
    const docRef = await addDoc(assetRef, {
      ...data,
      createdAt,
    });

    res.status(200).send(`Asset created successfully with ID: ${docRef.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAssets = async (req, res) => {
  try {
    const userId = req.params.userId;

    const assetRef = collection(db, 'users', userId, 'assets');
    const assetsSnapshot = await getDocs(assetRef);
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
    res.status(400).send(error.message);
  }
};

export const getAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assetId = req.params.assetId;

    const assetRef = doc(db, 'users', userId, 'assets', assetId);
    const assetDoc = await getDoc(assetRef);

    if (assetDoc.exists()) {
      res.status(200).json({
        id: assetDoc.id,
        ...assetDoc.data(),
        // Convert the createdAt field to a Date object
        createdAt: assetDoc.data().createdAt.toDate(),
      });
    } else {
      res.status(404).send('Asset not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const updateAsset = async (req, res) => {
  try {
    const userId = req.params.userId;
    const assetId = req.params.assetId;
    const data = req.body;

    const assetRef = doc(db, 'users', userId, 'assets', assetId);
    await updateDoc(assetRef, data);

    res.status(200).send('Asset updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

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
