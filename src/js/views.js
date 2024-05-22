import {
  downloadMP3WithProgress,
  saveMP3ToDB,
  getMP3FromDB,
  deleteRecord,
} from "./db.js";

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
  downloaded = false;
  #_source = "";

  constructor(title, source, theme, tone, cipher, id) {
    super();
    this.title = title;
    this.#_source = source;
    this.theme = theme;
    this.tone = tone;
    this.cipher = cipher;
    this.id = id;
    this.rootElement = document.createElement("li");
  }

  /**
   * @param {Boolean} value
   */
  set isPlaying(value) {
    if (value) {
      this.rootElement.style.backgroundColor = "#ddb0b0";
      this.rootElement.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      this.rootElement.style.backgroundColor = "white";
    }
  }

  get source() {
    return new Promise((resolve, reject) => {
      if (!this.downloaded) {
        resolve(this.#_source);
      }

      return getMP3FromDB(this.id)
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          return resolve(url);
        })
        .catch((error) => {
          return error;
        });
    });
  }

  set source(value) {
    this.#_source = value;
  }

  play() {
    this.dispatchEvent("music-played", this);
  }

  download(event) {
    const downloadButton = event.target;
    downloadButton.style.display = "none";

    const progressRing =
      this.rootElement.getElementsByClassName("progress-ring")[0];
    progressRing.style.display = "block";

    const progressCircle = this.rootElement.querySelector(".progress");

    downloadMP3WithProgress(this.#_source, (loaded, total) => {
      const percentComplete = Math.round((loaded / total) * 100);
      const totalProgress = 251.2; // The circumference of the circle
      const dashOffset =
        totalProgress - (totalProgress * percentComplete) / 100;
      progressCircle.style.strokeDashoffset = dashOffset;
    }).then((response) => {
      response.blob().then((blob) => {
        saveMP3ToDB(blob, this.id)
          .then(() => {
            progressRing.style.display = "none";
            const checkIcon = this.rootElement.getElementsByClassName(
              "music-list_item__cipher__check"
            )[0];
            checkIcon.style.display = "block";
            this.downloaded = true;
          })
          .catch(() => {
            progressRing.style.display = "none";
            downloadButton.style.display = "block";
          });
      });
    });
  }

  deleteFile() {
    const downloadButton = this.rootElement.querySelector(
      ".music-list_item__cipher__download"
    );
    deleteRecord(this.id)
      .then(() => {
        downloadButton.style.display = "block";
        this.downloaded = false;
        const checkIcon = this.rootElement.getElementsByClassName(
          "music-list_item__cipher__check"
        )[0];
        checkIcon.style.display = "none";
      })
      .catch((error) => {
        console.error("Failed to delete record:", error);
      });
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
              <a class="music-list_item__cipher__link" href="cifras/${
                this.cipher
              }">Ver Cifra</a>
              <div style="display: flex; align-items: center;">                
                <a href="javascript:void(0)" class="music-list_item__cipher__download" ${
                  this.downloaded ? 'style="display :none"' : ""
                }></a>
                <button class="progress-ring">
                  <svg width="35" height="35">
                  <circle class="progress-ring__circle" stroke="lightgray" stroke-width="3" fill="transparent" r="10" cx="16" cy="17"/>
                  <circle class="progress-ring__circle progress" stroke="green" stroke-width="3" fill="transparent" r="10" cx="16" cy="17" stroke-dasharray="251.2" stroke-dashoffset="251.2"/>
                  </svg>
                  <img class="icon" src="images/x-regular-24.png"/>                
                </button>
                <a href="javascript:void(0)" class="music-list_item__cipher__check"  ${
                  !this.downloaded ? 'style="display :none"' : ""
                }></a>                
                <button class="button-68 music-list_item__play"><img src="images/play-regular-24.png"/></button>
              </div>
            </div>
        `;

    this.rootElement
      .querySelector(".music-list_item__play")
      .addEventListener("click", this.play.bind(this));

    this.rootElement
      .querySelector(".music-list_item__cipher__download")
      .addEventListener("click", this.download.bind(this));

    this.rootElement
      .querySelector(".music-list_item__cipher__check")
      .addEventListener("click", this.deleteFile.bind(this));

    this.rootElement
      .querySelector(".music-list_item__cipher__link")
      .addEventListener("click", (e) => {
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
              <h2 class="modal-title">${this.title}</h2>
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

        fetch(e.target.href)
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
            console.error(
              "There was a problem with the fetch operation:",
              error
            );
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
    this.currentPlaying = "";
    this.playlistElement = document.createElement("ul");
    this.playlistElement.className = "playlist";
  }

  render(elementId, musics) {
    this.musics = this.filteredMusics = musics;
    const rootElement = document.getElementById(elementId);
    for (const music of musics) {
      music.addEventListener("music-played", (e) => {
        this.currentPlaying = music.id;
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
    const musicIndex = this.filteredMusics.findIndex(
      (music) => music.id === this.currentPlaying
    );
    this.filteredMusics[musicIndex].isPlaying = false;
    const nextIndex =
      musicIndex + 1 >= this.filteredMusics.length ? 0 : musicIndex + 1;
    this.filteredMusics[nextIndex].isPlaying = true;
    this.currentPlaying = this.filteredMusics[nextIndex].id;
    return this.filteredMusics[nextIndex];
  }

  getPreviousMusic() {
    if (this.filteredMusics.length === 0) {
      return;
    }
    const musicIndex = this.filteredMusics.findIndex(
      (music) => music.id === this.currentPlaying
    );
    this.filteredMusics && (this.filteredMusics[musicIndex].isPlaying = false);
    const previousIndex =
      musicIndex === 0 ? this.filteredMusics.length - 1 : musicIndex - 1;
    this.currentPlaying = this.filteredMusics[previousIndex].id;
    this.filteredMusics[previousIndex].isPlaying = true;
    return this.filteredMusics[previousIndex];
  }
}

export class AudioPlayer extends EventEmitter {
  constructor(rootElementId) {
    super();
    this.currentMusic = undefined;
    this.rootElement = document.getElementById(rootElementId);
    this.render();
  }

  render() {
    const previousButton = this.rootElement.querySelector(
      "#audioPlayerPreviousButton"
    );
    previousButton.addEventListener("click", this.previousTrack.bind(this));

    const nextButton = this.rootElement.querySelector("#audioPlayerNextButton");
    nextButton.addEventListener("click", this.nextTrack.bind(this));

    const playPauseButton = this.rootElement.querySelector(
      "#audioPlayerPlayPauseButton"
    );

    const audio = this.rootElement.querySelector("audio");
    playPauseButton.addEventListener("click", () => {
      if (audio.paused) {
        this.play(this.currentMusic);
      } else {
        this.pause();
      }
    });
    const closeButton = this.rootElement.querySelector(
      "#audioPlayerCloseButton"
    );
    closeButton.addEventListener("click", () => {
      this.pause();
      this.setVisible(false);
    });

    const progressBar = document.getElementById("progress-bar");
    const progress = document.getElementById("progress");
    const progressHandle = document.getElementById("progress-handle");
    audio.addEventListener("timeupdate", () => {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progress.style.width = percentage + "%";
      progressHandle.style.left = `calc(${percentage}%) - 5px`;
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

  setVisible(value) {
    if (value) {
      this.rootElement.style.visibility = "visible";
      this.rootElement.style.opacity = "1";
      this.rootElement.style.transform = "translateY(0)";
    } else {
      this.rootElement.style.visibility = "hidden";
      this.rootElement.style.opacity = "0";
      this.rootElement.style.transform = "translateY(100%)";
    }
  }

  async play(music) {
    const audio = this.rootElement.querySelector("audio");
    if (!this.currentMusic || this.currentMusic.id !== music.id) {
      this.currentMusic && (this.currentMusic.isPlaying = false);
      this.currentMusic = music;
      audio.src = await music.source;
      console.log("Source " + audio.src);
      const playingMusicTitle = this.rootElement.querySelector(
        "#playing-music__title"
      );
      playingMusicTitle.innerText = music.title;
    }

    this.tooglePlayPauseIcon(false);
    this.setVisible(true);
    this.currentMusic.isPlaying = true;
    audio.play();
  }

  pause() {
    const audio = this.rootElement.querySelector("audio");
    audio.pause();
    this.tooglePlayPauseIcon(true);
  }

  nextTrack() {
    this.dispatchEvent("next-clicked");
  }

  previousTrack() {
    if (audio.currentTime >= 4) {
      audio.currentTime = 0;
    } else {
      this.dispatchEvent("previous-clicked");
    }
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
