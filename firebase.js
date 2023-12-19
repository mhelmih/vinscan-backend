const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');

dotenv.config();

const secretClient = new SecretManagerServiceClient();

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

const initializeFirebaseAdmin = async () => {
  const secretName = 'projects/vinscan-408603/secrets/vinscan-firebase-service-account-key/versions/latest';
  const [version] = await secretClient.accessSecretVersion({ name: secretName });
  // Parse the secret and set it up for Firebase Admin
  const credential = JSON.parse(version.payload.data.toString('utf8'));
  const adminApp = admin.initializeApp({
    credential: admin.credential.cert(credential),
  });

  return adminApp;
}

module.exports = { auth, db, initializeFirebaseAdmin };
