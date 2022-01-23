const createClient = require("hafas-client");
const readline = require("readline");
const arrayUnique = require("array-unique");

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

function refineProducts(products) {
  const result = "Verkehrsmittel: ";

  if (!products) {
    return result + "keine";
  }

  const availableProducts = Object.keys(products).filter(
    (key) => products[key]
  );
  const availableProductsReadable = arrayUnique(
    availableProducts.map((product) => productMap[product])
  );

  return result + availableProductsReadable.join(", ");
}

function printStationInfo(element) {
  const id = element.id;
  const name = element.name;
  const products = element.products;

  if (id && name) {
    console.info(
      "> Haltestelle: '" +
        name +
        "'\n  ID: " +
        id +
        "\n  " +
        refineProducts(products) +
        "\n"
    );
  }
}

if (process.argv.length === 3) {
  profileName = process.argv[2];
  console.info("Using hafas-client profile: " + profileName);
} else {
  console.info("Using default hafas-client profile: 'db'");
  profileName = "db";
}

try {
  profile = require("hafas-client/p/" + profileName);
} catch (err) {
  console.error(
    "\n" + err.message + "\n Did you choose the right profile name? \n"
  );
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
          console.info("\nGefundene Haltestellen für '" + answer + "':\n");

          response.forEach((element) => {
            printStationInfo(element);
          });

          process.exit(0);
        })
        .catch(console.error);
    }
  );
}
