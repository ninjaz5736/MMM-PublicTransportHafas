/* eslint-disable no-console */
const createClient = require("hafas-client");
const readline = require("readline");

let profileName = "";
let profile = "";

const productMap = {
  bus: "Bus",
  ferry: "Fähre",
  national: "Fernverkehr",
  nationalExpress: "Fernverkehr",
  regional: "Regionalverkehr",
  suburban: "S-Bahn",
  subway: "U-Bahn",
  taxi: "Taxi",
  tram: "Tram"
};

/**
 * Get proper names for the product keys.
 *
 * @param {object} products An object with the available transport products as a keys.
 * @returns {string} A list of transport products as a string.
 */
function refineProducts(products) {
  const result = "Verkehrsmittel: ";

  if (!products) {
    return `${result} keine`;
  }

  const availableProducts = Object.keys(products).filter(
    (key) => products[key]
  );
  const availableProductsReadable = arrayUnique(
    availableProducts.map((product) => productMap[product])
  );

  return result + availableProductsReadable.join(", ");
}

/**
 * Output the information about the station on the console.
 *
 * @param {object} station The station it's about.
 */
function printStationInfo(station) {
  if (station.id && station.name) {
    console.info(
      `> Haltestelle: '${station.name}'\n  ID: ${
        station.id
      }\n  ${refineProducts(station.products)}\n`
    );
  }
}

/**
 * Create an array without values that occur multiple times.
 *
 * @param {array} array An array that could have duplicate values.
 * @returns {array} An array without duplicate values.
 */
function arrayUnique(array) {
  return [...new Set(array)];
}

if (process.argv.length === 3) {
  profileName = process.argv[2];
  console.info(`Using hafas-client profile: ${profileName}`);
} else {
  console.info("Using default hafas-client profile: 'db'");
  profileName = "db";
}

try {
  profile = require(`hafas-client/p/${profileName}`);
} catch (err) {
  console.error(`\n${err.message}\n Did you choose the right profile name? \n`);
}

if (profile !== "") {
  const client = createClient(profile, "MMM-PublicTransportHafas");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(
    "Geben Sie eine Adresse oder einen Stationsnamen ein: ",
    (answer) => {
      rl.close();

      const opt = {
        results: 10,
        stations: true,
        adresses: false,
        poi: false
      };

      client
        .locations(answer, opt)
        .then((response) => {
          console.info(`\nGefundene Haltestellen für '${answer}':\n`);

          response.forEach((station) => {
            printStationInfo(station);
          });

          process.exit(0);
        })
        .catch(console.error);
    }
  );
}
