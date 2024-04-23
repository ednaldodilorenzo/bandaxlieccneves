// Import the functions you need from the SDKs you need
import "../css/styles.css";
import fetchCollectionData from "./request";
import { PlayList } from "./views";

let musicList = [];

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
  musicList = await fetchCollectionData();
  const playList = new PlayList(musicList);

  playList.render("app", musicList);

  const searchInput = document.querySelector("#searchInput");
  searchInput.focus();
  searchInput.addEventListener("input", (e) => {
    playList.filterMusics(e.target.value);
  });

  document.getElementById("clearButton").addEventListener("click", function () {
    searchInput.value = "";
    searchInput.focus();
    playList.filterMusics("");
  });

  document.addEventListener(
    "play",
    function (e) {
      const playedId = e.target.closest("li");
      playList.playId(playedId.id);
    },
    true
  );

  document.addEventListener(
    "ended",
    function (e) {
      playList.playNext();
    },
    true
  );
});

// app.js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => {
        console.log("Service worker registered!", reg);
      })
      .catch((err) => {
        console.log("Service worker registration failed:", err);
      });
  });
}
