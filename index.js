import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBl5pmzZiAqApUmQVtRW13fZWx2ugOoVNQ',
  authDomain: 'vinscan-3b689.firebaseapp.com',
  projectId: 'vinscan-3b689',
  storageBucket: 'vinscan-3b689.appspot.com',
  messagingSenderId: '798378700635',
  appId: '1:798378700635:web:1781bbefae452b3b5cb47e',
  measurementId: 'G-HWDTWENFMM',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', async (req, res) => {
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
});

app.post('/register', async (req, res) => {
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
});

app.post('/logingoogle', async (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
