const { signInWithEmailAndPassword } = require('firebase/auth');
const { createUserWithEmailAndPassword } = require('firebase/auth');
const { sendPasswordResetEmail } = require('firebase/auth');
const { doc } = require('firebase/firestore');
const { serverTimestamp } = require('firebase/firestore');
const { setDoc } = require('firebase/firestore');
const { auth, db } = require('../firebase.js');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    const token = await user.getIdToken();
    res.send({ token, uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(401).send({ message: 'Invalid username or password' });
  }
};

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Register the user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Use the user's UID as the Firestore document ID
    const userDocRef = doc(db, 'users', user.uid);

    // Set the data for the user document
    await setDoc(userDocRef, {
      email: user.email,
      createdAt: serverTimestamp(),
    });

    res.send({
      message: 'User registered successfully',
      uid: user.uid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await sendPasswordResetEmail(auth, email);
    res.send({ message: 'Password reset email sent' });
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
