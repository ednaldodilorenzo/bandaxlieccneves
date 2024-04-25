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

class EventEmitter {
  #callbacks = {};

  static Event = class {
    type = "";
    target = "";
    data = "";
  };

  addEventListener(eventType, callback) {
    if (typeof callback !== "function") return;
    if (this.#callbacks[eventType] === undefined) {
      this.#callbacks[eventType] = [];
    }

    this.#callbacks[eventType].push(callback);
  }

  dispatchEvent(eventType, data) {
    if (this.#callbacks[eventType] === undefined) return;

    const event = new EventEmitter.Event();
    event.type = eventType;
    event.target = this;
    event.data = data;

    this.#callbacks[eventType].forEach((callback) => {
      callback(event);
    });
  }
}

export class Music extends EventEmitter {
  constructor(title, source, theme, tone, cipher, id) {
    super();
    this.title = title;
    this.source = source;
    this.theme = theme;
    this.tone = tone;
    this.cipher = cipher;
    this.id = id;
    this.rootElement = document.createElement("li");
  }

  setPlaying() {
    this.rootElement.style.backgroundColor = "#ddb0b0";
  }

  setNotPlaying() {
    this.rootElement.style.backgroundColor = "white";
  }

  render() {
    this.rootElement.id = this.id;
    this.rootElement.innerHTML = `
            <h3 class="music-list_item__title">${this.title}</h3>
            <div class="music-list_item__details">
              <h5 class="music-list_item__details__tone">Tom: ${this.tone}</h5>
              <h5 class="music-list_item__details__theme">${this.theme}</h5>
            </div>
            <button class="musicPlayButton">Play</button>
            <div class="music-list_item__cipher">
              <a class="music-list_item__cipher__link" href="cifras/${this.cipher}".html>Ver Cifra</a>
            </div>
        `;

    const musicPlayButton = this.rootElement.getElementsByTagName("button")[0];
    musicPlayButton.addEventListener("click", () => {
      this.dispatchEvent("music-played", this);
    });

    const viewCipherButton = this.rootElement.querySelector(
      ".music-list_item__cipher__link"
    );
    viewCipherButton.addEventListener("click", (e) => {
      e.preventDefault();
      let cipherElement = this.rootElement.querySelector(".modal");
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
          cipherContent.style.marginBottom = "100px";
          cipherContent.innerHTML = html;
          modalContent.appendChild(cipherContent);
          cipherElement.style.display = "block";
          this.rootElement.appendChild(cipherElement);
        })
        .catch((error) => {
          console.error("There was a problem with the fetch operation:", error);
        });
    });

    return this.rootElement;
  }
}

export class PlayList extends EventEmitter {
  constructor() {
    super();
    this.musics = [];
    this.currentIndex = -1;
    this.currentPlaying = "";
    this.playlistElement = document.createElement("ul");
    this.playlistElement.className = "playlist";
  }

  render(elementId, musics) {
    this.musics = musics;
    this.currentIndex = musics ? 0 : -1;
    const rootElement = document.getElementById(elementId);
    for (const music of musics) {
      music.addEventListener("music-played", (e) => {
        this.dispatchEvent("playlist-music-played", e.target);
      });
      this.playlistElement.appendChild(music.render());
    }

    rootElement.appendChild(this.playlistElement);
  }

  filterMusics(searchString) {
    const musics = this.playlistElement.querySelectorAll("li");
    for (const music of musics) {
      const musicName =
        music.querySelector(".music-list_item__title").innerText +
        " " +
        music.querySelector(".music-list_item__details__theme").innerText;
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

  getNextMusic() {
    this.musics[this.currentIndex].setNotPlaying();
    this.currentIndex =
      this.currentIndex + 1 > this.musics.length ? 0 : (this.currentIndex += 1);
    this.musics[this.currentIndex].setPlaying();
    return this.musics[this.currentIndex];
  }

  getPreviousMusic() {
    this.musics[this.currentIndex].setNotPlaying();
    this.currentIndex =
      this.currentIndex === 0
        ? this.musics.length - 1
        : (this.currentIndex -= 1);
    this.musics[this.currentIndex].setPlaying();
    return this.musics[this.currentIndex];
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

export class AudioPlayer extends EventEmitter {
  constructor(rootElementId) {
    super();
    this.playing = false;
    this.paused = false;
    this.currentMusic = undefined;
    this.rootElement = document.getElementById(rootElementId);
    const playPauseButton = this.rootElement.querySelector(
      "#audioPlayerPlayPauseButton"
    );
    playPauseButton.addEventListener("click", () => {
      if (this.playing) {
        this.pause();
      } else {
        this.play(this.currentMusic);
      }
    });
    const closeButton = this.rootElement.querySelector(
      "#audioPlayerCloseButton"
    );
    closeButton.addEventListener("click", () => {
      this.pause();
      this.rootElement.style.display = "none";
    });
    const previousButton = this.rootElement.querySelector(
      "#audioPlayerPreviousButton"
    );
    previousButton.addEventListener("click", () => {
      this.dispatchEvent("previous-clicked");
    });

    const nextButton = this.rootElement.querySelector("#audioPlayerNextButton");
    nextButton.addEventListener("click", () => {
      this.dispatchEvent("next-clicked");
    });

    const progressBar = document.getElementById("progress-bar");
    const progress = document.getElementById("progress");
    const progressHandle = document.getElementById("progress-handle");
    const audio = this.rootElement.querySelector("audio");
    audio.addEventListener("timeupdate", () => {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percentage + "%";
      progressHandle.style.left = `calc(${percentage}% - 5px)`;
    });

    audio.addEventListener("ended", () => {
      this.dispatchEvent("next-clicked");
    });

    progressBar.addEventListener("click", (e) => {
      const barWidth = progressBar.clientWidth;
      const clickPosition = e.offsetX;
      const time = (clickPosition / barWidth) * audio.duration;
      audio.currentTime = time;
    });
  }

  play(music) {
    if (this.currentMusic) {
      this.currentMusic.setNotPlaying();
    }
    this.currentMusic = music;
    this.currentMusic.setPlaying();
    this.playing = true;
    const audio = this.rootElement.querySelector("audio");
    if (this.paused) {
      audio.play();
      return;
    }
    this.paused = false;
    this.rootElement.style.display = "block";
    audio.src = music.source;
    const playPauseButton = this.rootElement.querySelector(
      "#audioPlayerPlayPauseButton"
    );
    playPauseButton.getElementsByTagName("img")[0].src =
      "images/pause-regular-24.png";
    const playingMusicTitle = this.rootElement.querySelector(
      "#playing-music__title"
    );
    playingMusicTitle.innerText = music.title;
    audio.play();
  }

  pause() {
    const audio = this.rootElement.querySelector("audio");
    this.playing = false;
    audio.pause();
    const playPauseButton = this.rootElement.querySelector(
      "#audioPlayerPlayPauseButton"
    );
    playPauseButton.getElementsByTagName("img")[0].src =
      "images/play-regular-24.png";
  }
}
