/* eslint-disable no-restricted-syntax */
/* global config Log */
// Initialize new SpeechSynthesisUtterance object
const speech = new SpeechSynthesisUtterance();

// Set speech Language
speech.lang = config.language;

function getTimeAnnouncementString() {
  const time = new Date();
  const timeString = `Es ist ${time.getHours()} Uhr ${time.getMinutes()} .\n`;
  return timeString;
}

function speak(text) {
  speechSynthesis.cancel();
  speech.text = text;
  Log.log(text);
  speechSynthesis.speak(speech);
}

function getDesparturesString() {
  let announcementText;

  // Time
  announcementText = getTimeAnnouncementString();

  // Set the text property with the value of the textarea
  const pthWrappers = document.getElementsByClassName("mmm-pth-wrapper");

  for (const pthWrapper of pthWrappers) {
    const pthWrapperClone = pthWrapper.cloneNode(true);

    // Station
    const station = pthWrapperClone.getElementsByTagName("header")[0];
    announcementText += `\nHaltestelle ${station.innerText}.\n`;

    const pthTable = pthWrapperClone.getElementsByClassName("mmm-pth-table")[0];
    const thead = pthWrapperClone.querySelector("thead");
    if (thead !== null) {
      thead.remove();
    }

    // Line
    const lines = pthTable.getElementsByClassName("mmm-pth-sign");
    for (const line of lines) {
      const isLineWithoutPrefix = /^[0-9]$/.test(line.innerText[0]);
      if (isLineWithoutPrefix) {
        line.innerText = `Linie ${line.innerText} `;
      }
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

    if (rows.length > 0) {
      let departureCounter = 0;
      let allDesparturesString = "";

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
      announcementText += `Es gibt ${departureCounter} Abfahrten.\n`;
      announcementText += allDesparturesString
        .replaceAll("\t", " ")
        .replaceAll("  ", " ");
    }
  }

  // Start Speaking
  return announcementText;
}

function getGreetingString() {
  const time = new Date();
  const hour = time.getHours();
  let greetingsString;
  if (hour > 18) {
    greetingsString = "Guten Abend. ";
  } else if (hour < 10) {
    greetingsString = "Guten Morgen. ";
  } else {
    greetingsString = "Guten Tag. ";
  }
  return greetingsString;
}

if (true) {
  setTimeout(() => {
    let firstTextToSpeech = getGreetingString();
    firstTextToSpeech += getTimeAnnouncementString();
    speak(firstTextToSpeech);
  }, 10000);

  document.addEventListener("keydown", (event) => {
    if (event.key === "d") {
      speak(getDesparturesString());
    }
    if (event.key === "s") {
      speak("Ansage angehalten");
    }
  });
}
