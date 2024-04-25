// Import the functions you need from the SDKs you need
import "./css/styles.css";
import { PlayList } from "./js/views";

let musicList = [];

document.addEventListener("DOMContentLoaded", async () => {  
  const requestModule = await import(import.meta.env.DEV ? "./js/mock-request.js" : "./js/request.js")
  musicList = await requestModule.fetchCollectionData();
  
  const playList = new PlayList(musicList);

  playList.render("app", musicList);

  const searchInput = document.querySelector("#searchInput");
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

  const audioPlayerPlayButton = document.getElementById(
    "audioPlayerPlayButton"
  );
  const audioPlayer = document.getElementById("audioPlayer");
  audioPlayerPlayButton.addEventListener("click", async () => {
    const fileURL = await getFileURL("audios/acaso-nao-sabeis.mp3");
    audioPlayer.src = fileURL;
    audioPlayer.load();
    audioPlayer.play();
  });
});

// app.js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then((reg) => {
        console.log("Service worker registered!", reg);
      })
      .catch((err) => {
        console.log("Service worker registration failed:", err);
      });
  });
}
