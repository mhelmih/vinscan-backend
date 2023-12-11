import firebase from '../firebase.js';
import Records from '../models/recordsModel.js';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

const db = getFirestore(firebase);

export const createRecord = async (req, res) => {
  try {
    const data = req.body;
    const createdAt = serverTimestamp();
    await addDoc(collection(db, 'records'), { ...data, createdAt });
    res.status(200).send('record created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getRecords = async (req, res) => {
  try {
    const records = await getDocs(collection(db, 'records'));
    const recordArray = [];

    if (records.empty) {
      res.status(400).send('No records found');
    } else {
      records.forEach((doc) => {
        const record = new Records(
          doc.id,
          doc.data().category,
          doc.data().subCategory,
          doc.data().amount,
          doc.data().createdAt.toDate(),
        );
        recordArray.push(record);
      });

      res.status(200).send(recordArray);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const getRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const record = doc(db, 'records', id);
    const data = await getDoc(record);
    if (data.exists()) {
      res.status(200).send(data.data());
    } else {
      res.status(404).send('record not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const updateRecord = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const record = doc(db, 'records', id);
    await updateDoc(record, data);
    res.status(200).send('record updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const id = req.params.id;
    await deleteDoc(doc(db, 'records', id));
    res.status(200).send('record deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
