import EventEmitter from "./event-emmiter";
import * as db from "../util/db";
import { fetchCollectionData } from "../util/request"

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

export default class Music extends EventEmitter {
  downloaded = false;
  #_source = "";

  constructor(title, source, theme, tone, cipher, id, date) {
    super();
    this.title = title;
    this.#_source = source;
    this.theme = theme;
    this.tone = tone;
    this.cipher = cipher;
    this.id = id;
    this.date = date;
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

      return db
        .getMP3FromDB(this.id)
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

  static async fetchMusics() {
    const musicList = await fetchCollectionData();    
    const downloadedMusicIds = await db.getDownloadedIds();

    for(let i = 0; i < musicList.length; i++) {
        musicList[i].downloaded = downloadedMusicIds.includes(musicList[i].id);
    }

    return musicList;
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

    db.downloadMP3WithProgress(this.#_source, (loaded, total) => {
      const percentComplete = Math.round((loaded / total) * 100);
      const totalProgress = 251.2; // The circumference of the circle
      const dashOffset =
        totalProgress - (totalProgress * percentComplete) / 100;
      progressCircle.style.strokeDashoffset = dashOffset;
    }).then((response) => {
      response.blob().then((blob) => {
        db.saveMP3ToDB(blob, this.id)
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
    db.deleteRecord(this.id)
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
              <h3 class="music-list_item__title">${this.title} (${this.tone})</h3>
              <div class="music-list_item__details">
                <h5 class="music-list_item__details__tone">Data: ${
                  this.date
                }</h5>
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
                  <a class="button-68 music-list_item__play"></a>
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
        cipherElement.querySelector(".close").addEventListener("click", () => {
          cipherElement.style.display = "none";
        });

        cipherElement
          .querySelector("#increaseSize")
          .addEventListener("click", changeTextSize);
        cipherElement
          .querySelector("#decreaseSize")
          .addEventListener("click", changeTextSize);

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
