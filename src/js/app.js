// Import the functions you need from the SDKs you need
import "../css/app.css";
import PlayList from "./model/playlist.js";
import AudioPlayer from "./model/audio-player.js";
import Music from "./model/music.js";

const setMusicData = (title) => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: "Banda ECC Neves",
      album: "XLI ECC Neves",
      artwork: [],
    });
  }
};

if (window.Notification) {
  if (Notification.permission !== "denied") {
    Notification.requestPermission((permission) => {
      if (permission === "granted") {
        console.log("Permission granted");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const playList = new PlayList();
  const audioPlayer = new AudioPlayer("audio-player");
  const switchPreviousTrack = () => {
    const previousMusic = playList.getPreviousMusic();
    if (previousMusic) {
      setMusicData(previousMusic.title);
      audioPlayer.play(previousMusic);
    }
  };

  const switchNextTrack = () => {
    const nextMusic = playList.getNextMusic();
    if (nextMusic) {
      setMusicData(nextMusic.title);
      audioPlayer.play(nextMusic);
    }
  };

  const musicList = await Music.fetchMusics();
  playList.render("app", musicList);
  playList.addEventListener("playlist-music-played", (e) => {
    setMusicData(e.data.title);
    audioPlayer.play(e.data);
  });

  audioPlayer.addEventListener("previous-clicked", switchPreviousTrack);

  audioPlayer.addEventListener("next-clicked", switchNextTrack);

  if ("mediaSession" in navigator) {
    // Previous Track
    navigator.mediaSession.setActionHandler(
      "previoustrack",
      audioPlayer.previousTrack
    );

    // Next Track
    navigator.mediaSession.setActionHandler("nexttrack", audioPlayer.nextTrack);

    navigator.mediaSession.setActionHandler("pause", audioPlayer.pause);
    // Add other handlers as needed, e.g., play, pause, stop, seekbackward, seekforward
  }

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
      .register("/sw.js")
      .then((reg) => {
        console.log("Service worker registered!", reg);
      })
      .catch((err) => {
        console.log("Service worker registration failed:", err);
      });
  });
}
