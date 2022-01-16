"use strict";

// Initialize new SpeechSynthesisUtterance object
let speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function sayDepartures() {
  // Time
  sayTime();

  // Set the text property with the value of the textarea
  let pthWrappers = document.getElementsByClassName("pthWrapper");

  for (let pthWrapper of pthWrappers) {
    // Station
    let station = pthWrapper.getElementsByTagName("header")[0];
    speech.text = speech.text + "\n. Haltestelle " + station.innerText + ".\n";

    let pthTable = pthWrapper.getElementsByClassName("pthTable")[0];

    // Line
    let lines = pthTable.getElementsByClassName("pthSign");
    for (let line of lines) {
      line.innerText = "Linie " + line.innerText;
    }

    // Direction
    let directions = pthTable.getElementsByClassName("pthDirectionCell");
    for (let direction of directions) {
      direction.innerText = "in Richtung " + direction.innerText;
    }

    // Platform
    let platforms = pthTable.getElementsByClassName("pthPlatformCell");
    for (let platform of platforms) {
      if (platform.innerText !== "") {
        platform.innerText = "Steig " + platform.innerText;
      }
    }

    let rows = pthTable.getElementsByTagName("tr");
    for (let row of rows) {
      speech.text = speech.text + row.innerText.replaceAll("\n", " ") + ",\n";
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

let speechHello = new SpeechSynthesisUtterance();
speechHello.lang = config.language;

speechHello.addEventListener("end", function (event) {
  sayTime();
});

function sayHello() {
  let hello = "Guten Tag!";
  speechHello.text = hello;
  speechSynthesis.speak(speechHello);
}

function sayTime() {
  let time = new Date();
  let timeString =
    "Es ist " + time.getHours() + " Uhr " + time.getMinutes() + ",\n";
  speech.text = timeString;
  speechSynthesis.speak(speech);
  speech.text = "";
}

sayHello();
