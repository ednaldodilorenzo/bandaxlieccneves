const buttons = document.querySelectorAll(".cifra a");

const changeTextSize = (e) => {
  const buttonText = e.target.innerText;
  const cipherContent = e.target.parentElement.querySelector("pre");
  var style = window
    .getComputedStyle(cipherContent, null)
    .getPropertyValue("font-size");
  var currentSize = parseFloat(style);
  cipherContent.style.fontSize = buttonText.startsWith("+")
    ? currentSize + 1 + "px"
    : currentSize - 1 + "px";
};

class Music {
  constructor(title, source, theme, tone) {
    this.title = title;
    this.source = source;
    this.theme = theme;
    this.tone = tone;
  }

  render() {
    const rootElement = document.createElement("li");
    rootElement.innerHTML = `
        <h4>${this.title}</h4>
        <div style="display: flex; justify-content: space-between;">
          <h5>Tom: ${this.tone}</h5>
          <h5>Tema: ${this.theme}</h5>          
        </div>
        <audio preload="metadata" controls>
          <source src="static/${this.source}.mp3" type="audio/mp3" />
          Seu navegador não suporta o elemento de áudio.
        </audio>
        <div class="cifra">
          <a id="toggleLyric" href="cifras/${this.source}.html".html>Ver Cifra</a>
        </div>
    `;

    const viewCipherButton = rootElement.querySelector("#toggleLyric");
    viewCipherButton.addEventListener("click", (e) => {
      e.preventDefault();
      let cipherElement = rootElement.querySelector(".modal");
      if (cipherElement) {
        cipherElement.style.display =
          cipherElement.style.display === "block" ? "none" : "block";
        return;
      }
      cipherElement = document.createElement("div");
      cipherElement.className = "modal";
      cipherElement.innerHTML = `
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2 style="margin: 5px;">${this.title}</h2>
          <button class="button-68" id="increaseSize">+A</button>
          <button class="button-68" id="decreaseSize">-A</button>
        </div>  
      `;
      const closeButton = cipherElement.querySelector(".close");
      closeButton.addEventListener("click", () => {
        cipherElement.style.display = "none";
      });

      const increaseSizeButton = cipherElement.querySelector("#increaseSize");
      increaseSizeButton.addEventListener("click", changeTextSize);
      const decreaseSizeButton = cipherElement.querySelector("#decreaseSize");
      decreaseSizeButton.addEventListener("click", changeTextSize);

      fetch(viewCipherButton.href)
        .then((response) => {
          // Check if the request was successful
          if (response.ok) {
            return response.text(); // Return the response text (HTML content)
          }
          throw new Error("Network response was not ok.");
        })
        .then((html) => {
          // Set the innerHTML of the target element
          const modalContent = cipherElement.querySelector(".modal-content");
          const cipherContent = document.createElement("pre");
          cipherContent.style.padding = "5px";
          cipherContent.innerHTML = html;
          modalContent.appendChild(cipherContent);
          cipherElement.style.display = "block";
          rootElement.appendChild(cipherElement);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    });

    return rootElement;
  }
}

const music_list = [
  new Music("Restaura a Família", "restaura_familia", "Tema", "E"),
  new Music("Acaso não sabeis", "acaso-nao-sabeis", "Jantar Mariano", "C"),
  new Music("Te agradeço", "eu-te-agradeco", "Levada", "E"),
  new Music("Por isso eu te louvo", "por-isso-eu-te-louvo", "Levada", "E"),
  new Music(
    "Caminhar, sorrir e cantar - 22/04/2024",
    "caminhar-sorrrir-cantar",
    "Levada",
    "A"
  ),
  new Music(
    "Hoje é tempo de louvar a Deus - 22/04/2024",
    "hoje-e-tempo-de-louvar-a-deus",
    "Levada",
    "E"
  ),
  new Music("Bom e Agradável - 22/04/2024", "bom-e-agradavel", "Levada", "E"),
  new Music("Te encontrar - 22/04/2024", "te-encontrar", "Levada", "G"),
  new Music(
    "Eu quero ser de Deus - 22/04/2024",
    "eu-quero-ser-de-deus",
    "Levada",
    "A"
  ),
  new Music("Obra Nova - 22/04/2024", "obra-nova", "Levada", "D"),
  new Music("O amor - 22/04/2024", "o-amor", "Levada", "C"),
];

document.addEventListener("DOMContentLoaded", () => {
  const playlist = document.querySelector(".playlist");

  for (const music of music_list) {
    playlist.appendChild(music.render());
  }

  const musics = document.querySelectorAll(".playlist li");

  const filterMusics = (searchString) => {
    for (let music of musics) {
      const musicName = music.querySelector("h4").innerText;
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
    const inputText = e.target.value;
    filterMusics(inputText);
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
