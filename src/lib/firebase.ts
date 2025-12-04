// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvfwEsbkdxnHE4wcW9ADURcVRLoq6HMHY",
  authDomain: "wh-tasklist.firebaseapp.com",
  databaseURL: "https://wh-tasklist-default-rtdb.firebaseio.com",
  projectId: "wh-tasklist",
  storageBucket: "wh-tasklist.firebasestorage.app",
  messagingSenderId: "442168147650",
  appId: "1:442168147650:web:7bab03c637db11347b455b",
  measurementId: "G-CZ861714FR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { analytics, app, auth, db };
