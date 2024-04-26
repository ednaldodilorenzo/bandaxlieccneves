// Import the functions you need from the SDKs you need
import "./css/styles.css";
import { PlayList, AudioPlayer } from "./js/views";

document.addEventListener("DOMContentLoaded", async () => {
  const requestModule = await import(
    import.meta.env.DEV ? "./js/request.js" : "./js/request.js"
  );
  const musicList = await requestModule.fetchCollectionData();

  const playList = new PlayList();
  const audioPlayer = new AudioPlayer("audio-player");

  playList.render("app", musicList);
  playList.addEventListener("playlist-music-played", (e) => {
    audioPlayer.play(e.data);
  });

  audioPlayer.addEventListener("previous-clicked", () => {
    const previousMusic = playList.getPreviousMusic();
    previousMusic && audioPlayer.play(previousMusic);
  });

  audioPlayer.addEventListener("next-clicked", () => {
    const nextMusic = playList.getNextMusic();
    nextMusic && audioPlayer.play(nextMusic);
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
