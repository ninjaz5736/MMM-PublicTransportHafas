/* eslint-disable no-restricted-syntax */
/* global config Log */
// Initialize new SpeechSynthesisUtterance object
const speechHello = new SpeechSynthesisUtterance();

// Set speech Language
speechHello.lang = config.language;

function getTimeAnnouncementString() {
  const time = new Date();
  const timeString = `Es ist ${time.getHours()} Uhr ${time.getMinutes()}.\n`;
  return timeString;
}

function speak(text) {
  speechSynthesis.cancel();
  speechHello.text = text;
  Log.log(text);
  speechSynthesis.speak(speechHello);
}

function getDesparturesString() {
  let allDesparturesString;

  // Time
  allDesparturesString = getTimeAnnouncementString();

  // Set the text property with the value of the textarea
  const pthWrappers = document.getElementsByClassName("mmm-pth-wrapper");

  for (const pthWrapper of pthWrappers) {
    const pthWrapperClone = pthWrapper.cloneNode(true);

    // Station
    const station = pthWrapperClone.getElementsByTagName("header")[0];
    allDesparturesString += `\nHaltestelle ${station.innerText}.\n`;

    const pthTable = pthWrapperClone.getElementsByClassName("mmm-pth-table")[0];
    const thead = pthWrapperClone.querySelector("thead");
    if (thead !== null) {
      thead.remove();
    }

    // Line
    const lines = pthTable.getElementsByClassName("mmm-pth-sign");
    for (const line of lines) {
      line.innerText = `Linie ${line.innerText} `;
    }

    // Direction
    const directions = pthTable.getElementsByClassName(
      "mmm-pth-direction-cell"
    );
    for (const direction of directions) {
      direction.innerText = `in Richtung ${direction.innerText} `;
    }

    // Platform
    const platforms = pthTable.getElementsByClassName("mmm-pth-platform-cell");

    for (const platform of platforms) {
      if (platform.innerText !== "") {
        platform.innerText = ` von Steig ${platform.innerText}`;
      }
    }

    const rows = pthTable.getElementsByTagName("tr");
    allDesparturesString += `Es gibt ${rows.length} Abfahrten.\n`;

    if (rows.length > 0) {
      let departureCounter = 0;

      for (const row of rows) {
        let departureString;
        if (row.innerText.indexOf("⚠️") > -1) {
          departureString = row.innerText.split("⚠️")[1];
        } else {
          departureCounter += 1;
          departureString = `Abfahrt ${departureCounter}: ${row.innerText}`;
        }
        departureString = departureString
          .replaceAll("\n", " ")
          .replaceAll("str.", "straße")
          .replaceAll("Str.", "Straße")
          .replaceAll("STR.", "Straße");
        allDesparturesString += `${departureString}.\n`;
      }

      allDesparturesString = allDesparturesString
        .replaceAll("\t", " ")
        .replaceAll("  ", " ");
    }
  }

  // Start Speaking
  return allDesparturesString;
}

function getGreetingString() {
  const time = new Date();
  const hour = time.getHours();
  let greetingsString;
  if (hour > 18) {
    greetingsString = "Guten Abend. ";
  } else if (hour > 0 < 10) {
    greetingsString = "Guten Morgen. ";
  } else if (hour > 10 < 18) {
    greetingsString = "Guten Tag. ";
  }
  return greetingsString;
}

setTimeout(() => {
  let firstTextToSpeech = getGreetingString();
  firstTextToSpeech += getDesparturesString();
  speak(firstTextToSpeech);
}, 5000);
