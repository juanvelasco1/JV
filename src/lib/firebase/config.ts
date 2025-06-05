import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDegfywRceLzoMo5S3fRxPS-nnPeqUKwfM",
  authDomain: "invest-c28e1.firebaseapp.com",
  projectId: "invest-c28e1",
  storageBucket: "invest-c28e1.appspot.com", // Corrected common typo from firebasestorage.app to appspot.com
  messagingSenderId: "396942500221",
  appId: "1:396942500221:web:9cfff02b92776f9dceac14",
  measurementId: "G-FQMN5MXDN3"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
