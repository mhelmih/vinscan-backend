const { db } = require('../firebase.js');
const { collection } = require('firebase/firestore');
const { addDoc } = require('firebase/firestore');
const { serverTimestamp } = require('firebase/firestore');
const { getDocs } = require('firebase/firestore');
const { doc } = require('firebase/firestore');
const { getDoc } = require('firebase/firestore');
const { updateDoc } = require('firebase/firestore');
const { deleteDoc } = require('firebase/firestore');

const createRecord = async (req, res) => {
  try {
    const userId = req.params.userId;
    const data = req.body;
    const createdAt = serverTimestamp();

    const recordRef = collection(db, 'users', userId, 'records');
    const docRef = await addDoc(recordRef, {
      ...data,
      createdAt,
    });

    res.status(200).send(`Record created successfully with ID: ${docRef.id}`);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getRecords = async (req, res) => {
  try {
    const userId = req.params.userId;

    const recordRef = collection(db, 'users', userId, 'records');
    const recordsSnapshot = await getDocs(recordRef);
    const records = [];

    recordsSnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
        // Convert the createdAt field to a Date object
        createdAt: doc.data().createdAt.toDate(),
      });
    });

    res.status(200).json(records);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getRecord = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recordId = req.params.recordId;

    const recordRef = doc(db, 'users', userId, 'records', recordId);
    const recordDoc = await getDoc(recordRef);

    if (recordDoc.exists()) {
      res.status(200).json({
        id: recordDoc.id,
        ...recordDoc.data(),
        // Convert the createdAt field to a Date object
        createdAt: recordDoc.data().createdAt.toDate(),
      });
    } else {
      res.status(404).send('Record not found');
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateRecord = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recordId = req.params.recordId;
    const data = req.body;

    const recordRef = doc(db, 'users', userId, 'records', recordId);
    await updateDoc(recordRef, data);

    res.status(200).send('record updated successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteRecord = async (req, res) => {
  try {
    const userId = req.params.userId;
    const recordId = req.params.recordId;

    const recordRef = doc(db, 'users', userId, 'records', recordId);
    await deleteDoc(recordRef);

    res.status(200).send('record deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};
