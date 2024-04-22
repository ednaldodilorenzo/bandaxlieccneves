// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import Music from "./music.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

async function fetchCollectionData() {
  const querySnapshot = await getDocs(collection(db, "musics"));
  let documents = [];
  querySnapshot.forEach((doc) => {
    documents.push(
      new Music(
        doc.data().title,
        doc.data().source,
        doc.data().category,
        doc.data().tone,
        doc.data().cipher
      )
    );
  });
  return documents;
}

let music_list = [];

//const music_list = [
//  new Music("Restaura a Família", "restaura_familia", "Tema", "E"),
//  new Music("Acaso não sabeis", "acaso-nao-sabeis", "Jantar Mariano", "C"),
//  new Music("Te agradeço", "eu-te-agradeco", "Levada", "E"),
//  new Music("Por isso eu te louvo", "por-isso-eu-te-louvo", "Levada", "E"),
//  new Music(
//    "Caminhar, sorrir e cantar - 22/04/2024",
//    "caminhar-sorrrir-cantar",
//    "Levada",
//    "A"
//  ),
//  new Music(
//    "Hoje é tempo de louvar a Deus - 22/04/2024",
//    "hoje-e-tempo-de-louvar-a-deus",
//    "Levada",
//    "E"
//  ),
// new Music("Bom e Agradável - 22/04/2024", "bom-e-agradavel", "Levada", "E"),
//  new Music("Te encontrar - 22/04/2024", "te-encontrar", "Levada", "G"),
//  new Music(
//    "Eu quero ser de Deus - 22/04/2024",
//    "eu-quero-ser-de-deus",
//    "Levada",
//    "A"
//  ),
//  new Music("Obra Nova - 22/04/2024", "obra-nova", "Levada", "C"),
//  new Music("O amor - 22/04/2024", "o-amor", "Levada", "D"),
//];

document.addEventListener("DOMContentLoaded", async () => {
  const playlist = document.querySelector(".playlist");
  music_list = await fetchCollectionData();

  for (const music of music_list) {
    playlist.appendChild(music.render());
  }

  const musics = document.querySelectorAll(".playlist li");

  const filterMusics = (searchString) => {
    for (let music of musics) {
      const musicName =
        music.querySelector("h4").innerText +
        " " +
        music.querySelector(".music-theme").innerText;
      if (musicName.toLowerCase().includes(searchString.toLowerCase())) {
        music.style.display = "block";
      } else {
        music.style.display = "none";
      }
    }
  };

  const searchInput = document.querySelector("#searchInput");
  searchInput.focus();
  searchInput.addEventListener("input", (e) => {
    filterMusics(e.target.value);
  });

  document.getElementById("clearButton").addEventListener("click", function () {
    searchInput.value = "";
    searchInput.focus();
    filterMusics("");
  });

  document.addEventListener(
    "play",
    function (e) {
      // Get all audio elements on the page
      var allAudios = document.getElementsByTagName("audio");
      // Pause other audios
      for (var i = 0; i < allAudios.length; i++) {
        if (allAudios[i] !== e.target) {
          allAudios[i].pause();
        }
      }
    },
    true
  );
});

// app.js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/js/service-worker.js")
      .then((reg) => {
        console.log("Service worker registered!", reg);
      })
      .catch((err) => {
        console.log("Service worker registration failed:", err);
      });
  });
}
