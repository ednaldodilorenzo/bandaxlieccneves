// Import the functions you need from the SDKs you need
import "./css/styles.css";
import { PlayList, AudioPlayer } from "./js/views";

let musicList = [];

document.addEventListener("DOMContentLoaded", async () => {  
  const requestModule = await import(import.meta.env.DEV ? "./js/request.js" : "./js/request.js")
  musicList = await requestModule.fetchCollectionData();
  
  const playList = new PlayList(musicList);
  const audioPlayer = new AudioPlayer("audio-player");

  playList.render("app", musicList);
  playList.addEventListener("playlist-music-played", (e) => {
    audioPlayer.play(e.data);
  });

  audioPlayer.addEventListener("previous-clicked", () => {
    audioPlayer.play(playList.getPreviousMusic());
  });

  audioPlayer.addEventListener("next-clicked", () => {
    audioPlayer.play(playList.getNextMusic());
  });

  const searchInput = document.querySelector("#searchInput");
  searchInput.addEventListener("input", (e) => {
    playList.filterMusics(e.target.value);
  });

  document.getElementById("clearButton").addEventListener("click", function () {
    searchInput.value = "";
    searchInput.focus();
    playList.filterMusics("");
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
