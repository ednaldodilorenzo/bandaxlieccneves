import EventEmitter from "./event-emmiter";

export default class PlayList extends EventEmitter {
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