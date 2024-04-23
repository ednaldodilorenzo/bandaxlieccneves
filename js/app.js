// Import the functions you need from the SDKs you need
import "../css/styles.css";
import fetchCollectionData from "./request";
import { PlayList } from "./views";

let musicList = [];

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
