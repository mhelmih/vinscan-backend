const {
  getDoc,
  getDocs,
  collection,
  doc,
  deleteDoc,
} = require('firebase/firestore');
const { db } = require('../firebase.js');

/**
 * @swagger
 * /api/v1/user:
 *   get:
 *     summary: Get all user data
 *     description: Retrieve all user data, including their records and assets
 *     tags: [User]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 email:
 *                   type: string
 *                   description: User email
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: User creation date
 *                 assets:
 *                   type: array
 *                   description: User assets
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Asset ID
 *                       category:
 *                         type: string
 *                         enum: [Cash, Bank, E-Wallet]
 *                         description: Asset category (Cash, Bank, or E-Wallet)
 *                       subCategory:
 *                         type: string
 *                         description: Asset sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *                       amount:
 *                         type: number
 *                         description: Asset amount
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Asset creation date
 *                 records:
 *                   type: array
 *                   description: User records
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Record ID
 *                       category:
 *                         type: string
 *                         enum: [Cash, Bank, E-Wallet]
 *                         description: Record category (Cash, Bank, or E-Wallet)
 *                       subCategory:
 *                         type: string
 *                         description: Record sub-category (e.g. BCA, BNI, OVO, DANA, etc.)
 *                       amount:
 *                         type: number
 *                         description: Record amount
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Record creation date
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const getUser = async (req, res) => {
  const userId = req.user.uid;

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
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
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
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

/**
 * @swagger
 * /api/v1/user:
 *   delete:
 *     summary: Delete user
 *     tags: [User]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
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

    res.status(200).send({ message: 'User and associated data deleted successfully' });
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
  getUser,
  deleteUser,
};
