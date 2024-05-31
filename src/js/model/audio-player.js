import EventEmitter from "./event-emmiter";

export default class AudioPlayer extends EventEmitter {
  constructor(rootElementId) {
    super();
    this.currentMusic = undefined;
    this.rootElement = document.getElementById(rootElementId);
    this.render();
  }

  render() {
    this.rootElement
      .querySelector("#audioPlayerPreviousButton")
      .addEventListener("click", this.previousTrack.bind(this));

    this.rootElement
      .querySelector("#audioPlayerNextButton")
      .addEventListener("click", this.nextTrack.bind(this));

    const audio = this.rootElement.querySelector("audio");

    this.rootElement
      .querySelector("#audioPlayerPlayPauseButton")
      .addEventListener("click", () => {
        if (audio.paused) {
          this.play(this.currentMusic);
        } else {
          this.pause();
        }
      });

    this.rootElement
      .querySelector("#audioPlayerCloseButton")
      .addEventListener("click", () => {
        this.pause();
        this.visible = false;
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

    audio.addEventListener("error", () => {
      this.dispatchEvent("next-clicked");
    });

    progressBar.addEventListener("click", (e) => {
      const barWidth = progressBar.clientWidth;
      const clickPosition = e.offsetX;
      const time = (clickPosition / barWidth) * audio.duration;
      audio.currentTime = time;
    });
  }

  /**
   * @param {boolean} value
   */
  set visible(value) {
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
      const playingMusicTitle = this.rootElement.querySelector(
        "#playing-music__title"
      );
      playingMusicTitle.innerText = music.title;
    }

    this.tooglePlayPauseIcon(false);
    this.visible = true;
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
