const buttons = document.querySelectorAll(".cifra a");
class Music {
  constructor(title, source) {
    this.title = title;
    this.source = source;    
  }

  render() {
    const rootElement = document.createElement("li");
    rootElement.innerHTML = `
        <h4>${this.title}</h4>
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
          <h2>${this.title}</h2>
        </div>  
      `
      const closeButton = cipherElement.querySelector(".close");
      closeButton.addEventListener("click", () => {
        cipherElement.style.display = "none";
      });

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
  new Music(
    "Restaura a Família (E) - Tema",
    "restaura_familia",
  ),
  new Music(
    "Acaso não sabeis (C) (Jantar Mariano)",
    "acaso-nao-sabeis",
  ),
  new Music(
    "Te agradeço (E) (Levada)",
    "eu-te-agradeco",
  ),
  new Music(
    "Por isso eu te louvo (E) (Levada)",
    "por-isso-eu-te-louvo",
  ),
  new Music(
    "Caminhar, sorrir e cantar (A) (Levada) - 22/04/2024",
    "caminhar-sorrrir-cantar",
  ),
  new Music(
    "Hoje é tempo de louvar a Deus (E) (Levada) - 22/04/2024",
    "hoje-e-tempo-de-louvar-a-deus",
  ),
  new Music(
    "Bom e Agradável (E) (Levada) - 22/04/2024",
    "bom-e-agradavel",
  ),
  new Music(
    "Te encontrar (G) (Levada) - 22/04/2024",
    "te-encontrar",
  ),
  new Music(
    "Eu quero ser de Deus (A) (Levada) - 22/04/2024",
    "eu-quero-ser-de-deus",
  ),
  new Music(
    "Obra Nova (D) (Levada) - 22/04/2024",
    "obra-nova",
  ),
  new Music(
    "O amor (C) (Levada) - 22/04/2024",
    "o-amor",
  ),
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
