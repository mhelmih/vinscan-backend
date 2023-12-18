import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    res.send({ token: 'token', uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(401).send({ error: 'Invalid username or password' });
  }
};

export const register = async (req, res) => {
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

export const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await sendPasswordResetEmail(auth, email);
    res.send({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
