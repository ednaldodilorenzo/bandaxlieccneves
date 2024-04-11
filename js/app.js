const musics = document.querySelectorAll(".playlist li");
console.log(musics);

const buttons = document.querySelectorAll(".cifra a");
for (let button of buttons) {
  button.addEventListener("click", (e) => {
    const buttonParent = e.target.closest(".cifra").closest("li");
    const musicLyric = buttonParent.querySelector(".music-lyric");
    musicLyric.style.display =
      musicLyric.style.display === "block" ? "none" : "block";
  });
}

const searchInput = document.querySelector("#searchInput");
searchInput.addEventListener("input", (e) => {
  const inputText = e.target.value;
  for (let music of musics) {
    const musicName = music.querySelector("h4").innerText;
    if (musicName.toLowerCase().includes(inputText.toLowerCase())) {
      music.style.display = "block";
    } else {
      music.style.display = "none";
    }
  }
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
