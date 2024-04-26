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
            <div class="music-list_item__cipher">
              <a class="music-list_item__cipher__link" href="cifras/${this.cipher}".html>Ver Cifra</a>
              <button class="button-68 music-list_item__play"><img src="images/play-regular-24.png"/></button>
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
    this.filteredMusics = [];
    this.currentIndex = -1;
    this.currentPlaying = "";
    this.playlistElement = document.createElement("ul");
    this.playlistElement.className = "playlist";
  }

  render(elementId, musics) {
    this.musics = this.filteredMusics = musics;
    this.currentIndex = musics ? 0 : -1;
    const rootElement = document.getElementById(elementId);
    for (const music of musics) {
      music.addEventListener("music-played", (e) => {
        const musicPlayed = this.musics.findIndex(
          (music) => music.id === e.target.id
        );
        this.currentIndex = musicPlayed;
        this.dispatchEvent("playlist-music-played", e.target);
      });
      this.playlistElement.appendChild(music.render());
    }

    rootElement.appendChild(this.playlistElement);
  }

  filterMusics(searchString) {
    const musics = this.playlistElement.querySelectorAll("li");
    for (const music of musics) {
      music.style.display = "none";
    }
    this.filteredMusics = this.musics.filter((m) =>
      m.title.toLowerCase().includes(searchString.toLowerCase())
    );
    this.currentIndex = 0;
    for (const music of this.filteredMusics) {
      const musicElement = document.getElementById(music.id);
      musicElement.style.display = "block";
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
    if (this.filteredMusics.length === 0) {
      return;
    }
    this.filteredMusics[this.currentIndex].setNotPlaying();
    this.currentIndex =
      this.currentIndex + 1 >= this.filteredMusics.length
        ? 0
        : (this.currentIndex += 1);
    this.filteredMusics[this.currentIndex].setPlaying();
    return this.filteredMusics[this.currentIndex];
  }

  getPreviousMusic() {
    if (this.filteredMusics.length === 0) {
      return;
    }
    this.filteredMusics &&
      this.filteredMusics[this.currentIndex].setNotPlaying();
    this.currentIndex =
      this.currentIndex === 0
        ? this.filteredMusics.length - 1
        : (this.currentIndex -= 1);
    this.filteredMusics[this.currentIndex].setPlaying();
    return this.filteredMusics[this.currentIndex];
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
        console.log("Entrou no if playin");
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
      this.rootElement.style.visibility = "hidden";
      this.rootElement.style.opacity = "0";
      this.rootElement.style.transform = "translateY(100%)";
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
    const audio = this.rootElement.querySelector("audio");
    if (this.paused && this.currentMusic && this.currentMusic.id === music.id) {
      audio.play();
      this.tooglePlayPauseIcon(false);
      this.paused = false;
      this.playing = true;
      return;
    }
    this.currentMusic && this.currentMusic.setNotPlaying();
    this.currentMusic = music;
    this.currentMusic.setPlaying();
    this.playing = true;
    this.paused = false;
    this.rootElement.style.visibility = "visible";
    this.rootElement.style.opacity = "1";
    this.rootElement.style.transform = "translateY(0)";
    audio.src = music.source;
    this.tooglePlayPauseIcon(false);
    const playingMusicTitle = this.rootElement.querySelector(
      "#playing-music__title"
    );
    playingMusicTitle.innerText = music.title;
    audio.play();
  }

  pause() {
    const audio = this.rootElement.querySelector("audio");
    this.playing = false;
    this.paused = true;
    audio.pause();
    this.tooglePlayPauseIcon(true);
  }

  tooglePlayPauseIcon(play) {
    const playPauseButton = this.rootElement.querySelector(
      "#audioPlayerPlayPauseButton"
    );
    if (play) {
      playPauseButton.classList.remove("pause-button");
      playPauseButton.classList.add("play-button");
    } else {
      playPauseButton.classList.remove("play-button");
      playPauseButton.classList.add("pause-button");
    }
  }
}
