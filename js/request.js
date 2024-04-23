import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Music } from "./views";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgVnukLHkrVP6mP8oicrEZ2Sy_DxAROiE",
  authDomain: "bandaxlieccneves.firebaseapp.com",
  projectId: "bandaxlieccneves",
  storageBucket: "bandaxlieccneves.appspot.com",
  messagingSenderId: "641609237349",
  appId: "1:641609237349:web:cb8ae5453eedbc0bb2978c",
  measurementId: "G-65M4ZWV789",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function fetchCollectionData() {
  const querySnapshot = await getDocs(collection(db, "musics"));
  let documents = [];
  querySnapshot.forEach((doc) => {
    console.log(doc.id);
    documents.push(
      new Music(
        doc.data().title,
        doc.data().source,
        doc.data().category,
        doc.data().tone,
        doc.data().cipher,
        doc.id
      )
    );
  });
  return documents;
}