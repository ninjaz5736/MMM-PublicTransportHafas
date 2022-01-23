const NodeHelper = require("node_helper");
const Log = require("logger");
const HafasFetcher = require("./core/HafasFetcher");

module.exports = NodeHelper.create({
  start() {
    this.departuresFetchers = [];
  },

  socketNotificationReceived(notification, payload) {
    switch (notification) {
      case "CREATE_FETCHER":
        this.createFetcher(payload);
        break;

      case "FETCH_DEPARTURES":
        this.fetchDepartures(payload);
        break;
    }
  },

  createFetcher(config) {
    let fetcher;

    if (typeof this.departuresFetchers[config.identifier] === "undefined") {
      fetcher = new HafasFetcher(config);
      this.departuresFetchers[config.identifier] = fetcher;
      Log.info(
        `Transportation fetcher for station with id '${fetcher.getStationID()}' created.`
      );

      this.sendFetcherLoaded(fetcher);
    } else {
      fetcher = this.departuresFetchers[config.identifier];
      Log.info(
        `Using existing transportation fetcher for station id '${fetcher.getStationID()}'.`
      );

      this.sendFetcherLoaded(fetcher);
    }
  },

  sendFetcherLoaded(fetcher) {
    this.sendSocketNotification("FETCHER_INITIALIZED", {
      identifier: fetcher.getIdentifier()
    });
  },

  fetchDepartures(identifier) {
    const fetcher = this.departuresFetchers[identifier];

    if (typeof fetcher !== "undefined") {
      fetcher
        .fetchDepartures()
        .then((fetchedDepartures) => {
          const payload = {
            identifier: fetcher.getIdentifier(),
            departures: fetchedDepartures
          };

          this.sendSocketNotification("DEPARTURES_FETCHED", payload);
        })
        .catch((error) => {
          const payload = {
            identifier: fetcher.getIdentifier(),
            error
          };

          this.sendSocketNotification("FETCH_ERROR", payload);
        });
    } else {
      Log.log(
        "MMM-PublicTransportHafas: fetcher is undefined. If this occurs only sporadically, it is not a problem."
      );
    }
  }
});
