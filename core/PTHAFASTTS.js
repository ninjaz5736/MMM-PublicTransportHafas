/* eslint-disable no-restricted-syntax */
/* global config */
// Initialize new SpeechSynthesisUtterance object
const speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function sayTime() {
  const time = new Date();
  const timeString = `Es ist ${time.getHours()} Uhr ${time.getMinutes()},\n`;
  speech.text = timeString;
  speechSynthesis.speak(speech);
  speech.text = "";
}

function sayDepartures() {
  // Time
  sayTime();

  // Set the text property with the value of the textarea
  const pthWrappers = document.getElementsByClassName("mmm-pth-wrapper");

  for (const pthWrapper of pthWrappers) {
    // Station
    const station = pthWrapper.getElementsByTagName("header")[0];
    speech.text = `${speech.text}\n. Haltestelle ${station.innerText}.\n`;

    const pthTable = pthWrapper.getElementsByClassName("mmm-pth-table")[0];

    // Line
    const lines = pthTable.getElementsByClassName("mmm-pth-sign");
    for (const line of lines) {
      line.innerText = `Linie ${line.innerText}`;
    }

    // Direction
    const directions = pthTable.getElementsByClassName(
      "mmm-pth-direction-cell"
    );
    for (const direction of directions) {
      direction.innerText = `in Richtung ${direction.innerText}`;
    }

    // Platform
    const platforms = pthTable.getElementsByClassName("mmm-pth-platform-cell");
    // eslint-disable-next-line no-restricted-syntax
    for (const platform of platforms) {
      if (platform.innerText !== "") {
        platform.innerText = `Steig ${platform.innerText}`;
      }
    }

    const rows = pthTable.getElementsByTagName("tr");
    // eslint-disable-next-line no-restricted-syntax
    for (const row of rows) {
      speech.text = `${speech.text + row.innerText.replaceAll("\n", " ")},\n`;
      speech.text = speech.text.replaceAll("str.", "straße");
      speech.text = speech.text.replaceAll("Str.", "Straße");
      speech.text = speech.text.replaceAll("STR.", "Straße");
    }

    speech.text = speech.text.replaceAll("\t", " ").replaceAll("  ", " ");
  }

  console.log(speech.text);

  // Start Speaking
  speechSynthesis.speak(speech);
}

const speechHello = new SpeechSynthesisUtterance();
speechHello.lang = config.language;

speechHello.addEventListener("end", () => {
  speechSynthesis.cancel();
  sayTime();
  sayDepartures();
});

function sayHello() {
  const hello = "Guten Tag!";
  speechHello.text = hello;
  speechSynthesis.speak(speechHello);
}

sayHello();
