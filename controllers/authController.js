// src/controllers/authController.js
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseApp } from '../firebase/config';

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
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    res.send({ message: 'User registered successfully', uid: user.uid });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Registration failed' });
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
    res.status(401).send({ error: 'Google login failed' });
  }
};

export { login, register, loginWithGoogle };
