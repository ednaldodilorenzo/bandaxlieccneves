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

export default class Music {
  constructor(title, source, theme, tone, cipher) {
    this.title = title;
    this.source = source;
    this.theme = theme;
    this.tone = tone;
    this.cipher = cipher;
  }

  render() {
    const rootElement = document.createElement("li");
    rootElement.innerHTML = `
          <h4>${this.title}</h4>
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
