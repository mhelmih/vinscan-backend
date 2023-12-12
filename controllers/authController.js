import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '../firebase.js';
import { db } from '../firebase.js';

const auth = getAuth(firebaseApp);

const login = async (req, res) => {
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

const loginWithGoogle = async (req, res) => {
  try {
    const provider = new GoogleAuthProvider();
    const credential = signInWithPopup(auth, provider);
    const userCredential = await credential;
    const user = userCredential.user;
    res.send({ token: 'token', uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(401).send(error.message);
  }
};

export { login, register, loginWithGoogle };
