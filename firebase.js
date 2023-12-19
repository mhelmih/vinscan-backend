const admin = require('firebase-admin');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

dotenv.config();

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('ascii'));

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = { auth, db, adminApp };
