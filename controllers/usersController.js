const {
  getDoc,
  getDocs,
  collection,
  doc,
  deleteDoc,
} = require('firebase/firestore');
const { db } = require('../firebase.js');

const getUsers = async (req, res) => {
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const users = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const user = {
        id: userDoc.id,
        ...userData,
        // Convert the createdAt field to a Date object
        createdAt: userData.createdAt.toDate(),
      };

      // Include nested collections
      user.records = await getNestedCollection(userDoc.ref, 'records');
      user.assets = await getNestedCollection(userDoc.ref, 'assets');

      users.push(user);
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const getUser = async (req, res) => {
  const userId = req.user.uid;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const user = {
        id: userDoc.id,
        ...userData,
        // Convert the createdAt field to a Date object
        createdAt: userData.createdAt.toDate(),
      };

      // Include nested collections
      user.records = await getNestedCollection(userDoc.ref, 'records');
      user.assets = await getNestedCollection(userDoc.ref, 'assets');

      res.status(200).json(user);
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// Helper function to get a nested collection
const getNestedCollection = async (parentDocRef, collectionName) => {
  const collectionRef = collection(parentDocRef, collectionName);
  const collectionSnapshot = await getDocs(collectionRef);
  const documents = [];

  collectionSnapshot.forEach((doc) => {
    documents.push({
      id: doc.id,
      ...doc.data(),
      // Convert the createdAt field to a Date object
      createdAt: doc.data().createdAt.toDate(),
    });
  });

  return documents;
};

const deleteUser = async (req, res) => {
  try {
    const user = req.user;
    const userDocRef = doc(db, 'users', user.uid);

    // Delete nested collections first
    await deleteNestedCollection(userDocRef, 'records');
    await deleteNestedCollection(userDocRef, 'assets');

    // Then, delete the user
    await user.delete();
    await deleteDoc(userDocRef);

    res.send({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

// Helper function to delete a nested collection
const deleteNestedCollection = async (parentDocRef, collectionName) => {
  const collectionRef = collection(parentDocRef, collectionName);
  const snapshot = await getDocs(collectionRef);

  const deletePromises = [];
  snapshot.forEach((doc) => {
    deletePromises.push(deleteDoc(doc.ref));
  });

  await Promise.all(deletePromises);
};

module.exports = {
  getUsers,
  getUser,
  deleteUser,
};
