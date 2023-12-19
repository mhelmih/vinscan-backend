const { signInWithEmailAndPassword } = require('firebase/auth');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { sendPasswordResetEmail } = require('firebase/auth');
const { doc } = require('firebase/firestore');
const { serverTimestamp } = require('firebase/firestore');
const { setDoc } = require('firebase/firestore');
const { auth, db } = require('../firebase.js');

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Firebase access token
 *                 uid:
 *                   type: string
 *                   description: Firebase account UID
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ message: 'email and password are required' });
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    if (!userCredential) {
      res.status(401).send({ message: 'Invalid username or password' });
      return;
    }

    const user = userCredential.user;
    const token = await user.getIdToken();
    res.send({ token, uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Login to the application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: User email
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *               token:
 *                 type: string
 *                 description: Firebase access token
 *               uid:
 *                 type: string
 *                 description: Firebase account UID
 *               message:
 *                 type: string
 *                 description: User registered successfully
 *       400:
 *         description: Email and password are required
 *       401:
 *         description: Account already exists or invalid password
 *       500:
 *         description: Internal server error
 */
const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ message: 'email and password are required' });
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (!userCredential) {
      res.status(401).send({ message: 'Account already exists or invalid password' });
      return;
    }

    const user = userCredential.user;
    // Use the user's UID as the Firestore document ID
    const userDocRef = doc(db, 'users', user.uid);

    // Set the data for the user document
    await setDoc(userDocRef, {
      email: user.email,
      createdAt: serverTimestamp(),
    });

    const token = await user.getIdToken();

    res.status(201).send({
      message: 'User registered successfully',
      uid: user.uid,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

/**
 * @swagger
 * /api/v1/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     security:
 *     - bearerAuth: []
 *     responses:
 *       201:
 *         description: Password reset email sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const resetPassword = async (req, res) => {
  const email = req.user.email;

  try {
    await sendPasswordResetEmail(auth, email);
    res.status(201).send({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

module.exports = {
  login,
  register,
  resetPassword,
};
