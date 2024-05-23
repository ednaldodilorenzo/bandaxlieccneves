import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";
import { ref, getStorage, getDownloadURL } from "firebase/storage";
import Music from "../model/music";

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
const storage = getStorage(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(
    /*settings*/ { tabManager: persistentSingleTabManager() }
  ),
});

export async function fetchCollectionData() {
  const querySnapshot = await getDocs(collection(db, "musics"));
  let documents = [];
  querySnapshot.forEach((doc) => {
    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(doc.data().rehearsalDate.toDate());    
    documents.push(
      new Music(
        doc.data().title,
        doc.data().source,
        doc.data().category,
        doc.data().tone,
        doc.data().cipher,
        doc.id,
        formattedDate
      )
    );
  });
  return documents;
}

export async function getFileURL(audioPath) {
  const storageRef = ref(storage, audioPath);
  return await getDownloadURL(storageRef);
}
