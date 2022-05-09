// global and vars
const colorDivs = document.querySelectorAll(".color");
const colors = document.querySelector(".colors");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popupCopy = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".slider");
let initialColor;
// this is for local storage
let savedPalletes = [];

//ADD our event listener
// GENERATE
generateBtn.addEventListener("click", () => {
  randomColors();
  colors.style.animation = "generate 0.5s ease";
});
// animationend
colors.addEventListener("animationend", () => {
  colors.style.animation = "";
});

//
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
//
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popupCopy.addEventListener("transitionend", () => {
  popupCopy.classList.remove("active");
  popupCopy.children[0].classList.remove("active");
});

adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
  closeAdjustments[index].addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

// Lock button
lockButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    lockSlider(index);
  });
});

// closeAdjustments.forEach((button, index) => {
//   button.addEventListener("click", () => {
//     closeAdjustmentPanel(index);
//   });
// });

// functions

// I DIDN'T understand this
// But chroma is perfect. I completly understood that.
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  // initial colors
  initialColor = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // Add it to the array
    if (div.classList.contains("locked")) {
      initialColor.push(hexText.innerText);
      return;
    } else {
      initialColor.push(chroma(randomColor).hex());
    }

    // ADD the color to the bg
    div.style.background = randomColor;
    hexText.innerText = randomColor;

    // Check contrast and change color
    checkTextContract(randomColor, hexText);

    // intial colorize Sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".slider input");

    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });

  //Reset Inputs
  resetInputs();

  // Check for button contrast
  adjustButton.forEach((button, index) => {
    checkTextContract(initialColor[index], button);
    checkTextContract(initialColor[index], lockButton[index]);
  });
}

function checkTextContract(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // Scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  // Update INPUT colors
  saturation.style.background = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.background = `linear-gradient(to right, ${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.background = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColor[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.background = color;

  //colorize inputs
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  // change text
  textHex.innerText = color.hex();
  // check contrast
  checkTextContract(color, textHex);
  for (icon of icons) {
    checkTextContract(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll(".slider input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const color = initialColor[slider.getAttribute("data-hue")];
      const value = chroma(color).hsl()[0];
      slider.value = value;
    }
    if (slider.name === "saturation") {
      const color = initialColor[slider.getAttribute("data-sat")];
      const value = chroma(color).hsl()[1];
      slider.value = value;
    }
    if (slider.name === "brightness") {
      const color = initialColor[slider.getAttribute("data-bright")];
      const value = chroma(color).hsl()[2];
      slider.value = value;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  //Popup animation
  popupCopy.classList.add("active");
  popupCopy.children[0].classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function lockSlider(index) {
  colorDivs[index].classList.toggle("locked");
  if (colorDivs[index].classList.contains("locked")) {
    lockButton[index].innerHTML = `<i class="fa-solid fa-lock"></i>`;
  } else {
    lockButton[index].innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}

// Implement save to pallete and LOCAL storage stuff
const saveBtn = document.querySelector(".save");
const submitBtn = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

const libraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");
// event listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitBtn.addEventListener("click", savedPallete);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
}
function savedPallete(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  // generate  obj
  let paletteNr;

  const palettesObjects = JSON.parse(localStorage.getItem("palettes"));
  if (palettesObjects) {
    paletteNr = palettesObjects.length;
  } else {
    paletteNr = savedPalletes.length;
  }

  const paletteObj = { name, colors, nr: paletteNr };
  savedPalletes.push(paletteObj);

  // save to local storage
  savetoLocal(paletteObj);
  saveInput.value = "";

  //Generate the palette for library
  const palettes = document.querySelector(".palettes");

  const palette = document.createElement("div");
  palette.classList.add("custom-palette");

  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");

  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";

  // ATTACH event to the btn
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColor = [];
    savedPalletes[paletteIndex].colors.forEach((color, index) => {
      initialColor.push(color);
      colorDivs[index].style.background = color;
      const text = colorDivs[index].children[0];
      checkTextContract(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  // appent to the library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  palettes.appendChild(palette);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove("active");
  popup.classList.remove("active");
}
const palettes = document.createElement("div");
palettes.classList.add("palettes");
function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const palettesObjects = JSON.parse(localStorage.getItem("palettes"));

    savedPalletes = [...palettesObjects];

    libraryContainer.children[0].appendChild(palettes);
    palettesObjects.forEach((paletteObj) => {
      //Generate the palette for library

      const palette = document.createElement("div");
      palette.classList.add("custom-palette");

      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");

      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
      });

      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";

      // ATTACH event to the btn
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColor = [];
        palettesObjects[paletteIndex].colors.forEach((color, index) => {
          initialColor.push(color);
          colorDivs[index].style.background = color;
          const text = colorDivs[index].children[0];
          checkTextContract(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      // appent to the library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      palettes.appendChild(palette);
    });
  }
}

getLocal();
randomColors();
