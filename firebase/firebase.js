import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtXFoeNSSX1fdwA3mtDesKXQvtwVnQzkw",
  authDomain: "m-etrica-to-do-app.firebaseapp.com",
  projectId: "m-etrica-to-do-app",
  storageBucket: "m-etrica-to-do-app.firebasestorage.app",
  messagingSenderId: "1033874938458",
  appId: "1:1033874938458:web:bb7cc056c7957236615663",
  measurementId: "G-LGEXBVNQWC",
};

const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
