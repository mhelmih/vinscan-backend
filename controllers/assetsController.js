import firebase from '../firebase.js';
import Assets from '../models/assetsModel.js';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const db = getFirestore(firebase);

export const createAsset = async (req, res) => {
  try {
    const data = req.body;
    await addDoc(collection(db, 'assets'), data);
    res.status(200).send('asset created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAssets = async (req, res) => {
  try {
    const assets = await getDocs(collection(db, 'assets'));
    const assetArray = [];

    if (assets.empty) {
      res.status(400).send('No assets found');
    } else {
      assets.forEach((doc) => {
        const asset = new Assets(
          doc.id,
          doc.data().category,
          doc.data().subCategory,
          doc.data().amount,
          doc.data().createdAt,
        );
        assetArray.push(asset);
      });

      res.status(200).send(assetArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getAsset = async (req, res) => {
  try {
    const id = req.params.id;
    const asset = doc(db, 'assets', id);
    const data = await getDoc(asset);
    if (data.exists()) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send('asset not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const updateAsset = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const asset = doc(db, 'assets', id);
    await updateDoc(asset, data);
    res.status(200).send('asset updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const deleteAsset = async (req, res) => {
  try {
    const id = req.params.id;
    await deleteDoc(doc(db, 'assets', id));
    res.status(200).send('asset deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
