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

export class Music {
  constructor(title, source, theme, tone, cipher, id) {
    this.title = title;
    this.source = source;
    this.theme = theme;
    this.tone = tone;
    this.cipher = cipher;
    this.id = id;
  }

  render() {
    const rootElement = document.createElement("li");
    rootElement.id = this.id;
    rootElement.innerHTML = `
            <h3 class="music-title">${this.title}</h3>
            <div style="display: flex; justify-content: space-between;">
              <h5>Tom: ${this.tone}</h5>
              <h5 class="music-theme">${this.theme}</h5>          
            </div>
            <audio preload="metadata" controls>
              <source src="${this.source}" type="audio/mp3" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
            <div class="cifra">
              <a id="toggleLyric" href="cifras/${this.cipher}".html>Ver Cifra</a>
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

export class PlayList {
  constructor() {
    this.currentPlaying = "";
    this.playlistElement = document.createElement("ul");
    this.playlistElement.className = "playlist";
  }

  render(elementId, musics) {
    const rootElement = document.getElementById(elementId);
    for (const music of musics) {
      this.playlistElement.appendChild(music.render());
    }

    rootElement.appendChild(this.playlistElement);
  }

  filterMusics(searchString) {
    const musics = this.playlistElement.querySelectorAll("li");
    for (const music of musics) {
      const musicName =
        music.querySelector(".music-title").innerText +
        " " +
        music.querySelector(".music-theme").innerText;
      if (musicName.toLowerCase().includes(searchString.toLowerCase())) {
        music.style.display = "block";
      } else {
        music.style.display = "none";
      }
    }
  }

  playId(id) {
    if (this.currentPlaying && this.currentPlaying !== id) {
      const music = document.getElementById(this.currentPlaying);
      const musicAudio = music.querySelector("audio");
      musicAudio.pause();
    }
    this.currentPlaying = id;
  }

  playNext() {
    const music = document.getElementById(this.currentPlaying);
    const musicAudio = music.querySelector("audio");
    musicAudio.pause();

    const visibleMusics = document.querySelectorAll(
      '.playlist li:not([style*="display:none"]):not([style*="display: none"])'
    );

    for (let i = 0; i < visibleMusics.length; i++) {
      if (visibleMusics[i].id === this.currentPlaying) {
        if (i === visibleMusics.length - 1) {
          const audio = visibleMusics[0].querySelector("audio");
          audio.play();
          return;
        } else {
          const audio = visibleMusics[i + 1].querySelector("audio");
          audio.play();
          return;
        }
      }
    }
  }
}
