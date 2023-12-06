// src/firebase/config.js
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyBl5pmzZiAqApUmQVtRW13fZWx2ugOoVNQ',
  authDomain: 'vinscan-3b689.firebaseapp.com',
  projectId: 'vinscan-3b689',
  storageBucket: 'vinscan-3b689.appspot.com',
  messagingSenderId: '798378700635',
  appId: '1:798378700635:web:1781bbefae452b3b5cb47e',
  measurementId: 'G-HWDTWENFMM',
};

const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseApp);

export { firebaseApp };
