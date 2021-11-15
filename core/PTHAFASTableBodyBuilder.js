"use strict";

class PTHAFASTableBodyBuilder {
  constructor(config) {
    this.config = config;
  }


  getDeparturesTableBody(departures, noDepartureMessage) {
    let tBody = document.createElement("tbody");
    tBody.className = "light";

    if (departures.length === 0) {
      let row = this.getDeparturesTableNoDeparturesRow(noDepartureMessage);
      tBody.appendChild(row);

      return tBody;
    }

    let reachableCount = departures.length;
    let unreachableCount = departures.filter(departure => !departure.isReachable).length;

    departures.forEach((departure, index) => {
      let row = this.getDeparturesTableRow(departure, index, reachableCount, unreachableCount);
      tBody.appendChild(row);

      let nextDeparture = departures[index + 1];
      this.insertRulerIfNecessary(tBody, departure, nextDeparture, noDepartureMessage);
    });

    return tBody;
  }


  insertRulerIfNecessary(tBody, departure, nextDeparture, noDepartureMessage) {
    if (nextDeparture && !departure.isReachable && nextDeparture.isReachable) {
      tBody.appendChild(this.getRulerRow());
    }

    if (!departure.isReachable && !nextDeparture) {
      tBody.appendChild(this.getRulerRow());
      tBody.appendChild(this.getDeparturesTableNoDeparturesRow(noDepartureMessage));
    }
  }


  getTableCell(content, cssClass = "") {
    let cell = document.createElement("td");
    cell.className = cssClass;

    if (typeof content === "string") {
      cell.innerHTML = content;
    } else {
      cell.appendChild(content);
    }

    return cell;
  }


  getDeparturesTableNoDeparturesRow(noDepartureMessage) {
    let row = document.createElement("tr");
    row.className = "dimmed";

    let cell = document.createElement("td");
    cell.colSpan = 3;
    cell.innerHTML = noDepartureMessage;

    row.appendChild(cell);

    return row;
  }


  getDeparturesTableRow(departure, index, departuresCount, unreachableCount) {
    let row = document.createElement("tr");
    row.className = "bright";

    if (departure.isReachable) {
      row.style.opacity = this.getRowOpacity(index - unreachableCount, departuresCount);
    } else {
      row.style.opacity = this.getUnreachableRowOpacity(index, unreachableCount);
    }

    this.config.tableHeaderOrder.forEach((key) => {
      let cell = this.getCell(key, departure);
      row.appendChild(cell);
    });

    return row;
  }


  getCell(key, departure) {
    let cell;

    switch (key) {
      case "time":
        let time = departure.when;
        let delay = departure.delay;
        cell = this.getTimeCell(time, delay);
        break;

      case "line":
        let line = departure.line.name;
        cell = this.getLineCell(line);
        break;

      case "direction":
        let direction = departure.direction;
        cell = this.getDirectionCell(direction);
        break;

      case "platform":
        let platform = departure.platform;
        cell = this.getPlatformCell(platform);
        break;
    }

    return cell;
  }


  getTimeCell(departure, delay) {
    let time = this.getDisplayDepartureTime(departure, delay);

    let cell = document.createElement("td");

    if (moment(departure).isValid()) {
      cell.className = "pthTimeCell";
      cell.appendChild(document.createTextNode(time));

      if (this.config.showAbsoluteTime) {
        cell.appendChild(this.getDelaySpan(delay));
      }
    } else {
      cell.className = "pthTimeCanceled";
      cell.appendChild(document.createTextNode("Fällt aus"));
    }

    return cell;
  }


  getDelaySpan(delay) {
    let delaySpan = document.createElement("span");
    delaySpan.innerHTML = this.getDelay(delay);

    let cssClass = "dimmed";

    // +n === +n --> Test, if n is numeric
    if (this.config.useColorForRealtimeInfo && (+delay === +delay)) {
      cssClass = delay > 0 ? "pthHasDelay" : "pthIsTooEarly";
    }

    delaySpan.className = "pthDelay " + cssClass;

    return delaySpan;
  }

  // +n === +n --> Test, if n is numeric
  getDelay(delay) {
    if (+delay === +delay) {
      let sign = delay < 0 ? "-" : "+";
      return "&nbsp;" + sign + delay / 60 + "&nbsp;";
    } else {
      return "&nbsp; +? &nbsp;";
    }
  }


  getDisplayDepartureTime(when, delay) {
    if (this.config.showAbsoluteTime) {
      let time = moment(when).subtract(delay, "seconds");
      return time.format("LT");

    } else {
      let time = moment(when);
      return time.fromNow();
    }
  }



  getLineId(lineName) {
    let lineId = lineName;
    if (lineName.search(" ") == -1) {
      let lineNameWithoutSpaces = lineName.replace(/\s/g, "");
      let firstNumberPosition = lineNameWithoutSpaces.search(/\d/);
      lineId = lineNameWithoutSpaces;

      if (firstNumberPosition > 0) {
        lineId = lineNameWithoutSpaces.slice(firstNumberPosition);
      }
    } else {
      lineId = lineName.split(" ")[1];
    }

    return lineId;
  }

  getLineCell(lineName) {
    let line;

    if (this.config.showOnlyLineNumbers) {

      line = this.getLineId(lineName);
    } else {
      line = lineName;
    }

    let lineDiv = document.createElement("div");
    lineDiv.innerHTML = line;
    lineDiv.className = this.getLineCssClass(lineName) + " pthTextCenter";

    return this.getTableCell(lineDiv);
  }


  getLineCssClass(lineName) {
    if (this.config.showColoredLineSymbols) {
      return this.getColoredCssClass(lineName);
    } else {
      return "pthSign pthBWLineSign";
    }
  }


  /**
   * Get product of a line name
   * 
   * Some HAFAS interfaces output line names with a space after the product name and
   * some do not. As an example: `RB50` <->` RB 50`.
   * This function returns the product name. In the two examples already mentioned
   * (`RB50` and` RB 50`) the string `RB` would be returned. If there is no product name
   * (if the line name starts with a digit), `undefined` is returned.
   *
   * @param  {String} lineName    The line name as it was delivered by the HAFAS API.
   * @return {String} product     The product ('RB', 'S', 'U', ...).
   */
  getProduct(lineName) {
    let product = lineName;
    if (lineName.search(" ") == -1) {
      let lineNameWithoutSpaces = lineName.replace(/\s/g, "");
      let firstNumberPosition = lineNameWithoutSpaces.search(/\d/);
      product = lineNameWithoutSpaces;

      if (firstNumberPosition > 0) {
        product = lineNameWithoutSpaces.slice(0, firstNumberPosition);
      }
    } else {
      product = lineName.split(" ")[0];
    }

    return product;
  }


  /**
   * Get css class names
   * 
   * Class names are returned depending on the line name. This enables CSS styles
   * to be defined on the basis of various properties.
   *
   * @param  {String} lineName     The linename as it was delivered by the HAFAS API.
   * @return {String} classNames   Series of class names
   */
  getColoredCssClass(lineName) {
    let classNames = "pthSign";
    let product = this.getProduct(lineName);
    let dbProducts = ["IC", "ICE", "RE", "RB", "S"];
    let ignoreShowOnlyLineNumbers = ["IC", "ICE", "RE", "RB", "S", "U"];

    if (dbProducts.includes(product)) {
      classNames += " pthDbStandard";
    }
    if (ignoreShowOnlyLineNumbers.includes(product) && this.config.showOnlyLineNumbers) {
      classNames += " " + product.toLowerCase() + "WithProductName";
    }
    classNames += " " + product.toLowerCase();
    classNames += " " + lineName.replace(/\s/g, "").toLowerCase();

    return classNames;
  }


  getDirectionCell(direction) {
    let truncatePosition = 26;
    let content = this.getProcessedDirection(direction);
    let className = "pthDirectionCell";

    if (this.config.marqueeLongDirections && content.length > truncatePosition) {
      content = document.createElement("span");
      content.innerHTML = this.getProcessedDirection(direction);
      className += " pthMarquee";
    }

    if (!this.config.showAbsoluteTime) {
      className += " pthTextLeft";
    }

    return this.getTableCell(content, className);
  }


  getProcessedDirection(direction) {
    let replacements = this.config.replaceInDirections;
    let processed = direction;

    Object.keys(replacements).forEach((key) => {
      processed = processed.replace(new RegExp(key, "g"), replacements[key]);
    });

    return processed;
  }


  getPlatformCell(platform) {
    let className = "pthPlatformCell pthTextCenter";
    if (platform == null) {
      platform = "";
    }
    return this.getTableCell(platform, className);
  }

  getRowOpacity(index, departuresCount) {
    if (!this.config.fadeReachableDepartures) {
      return 1.0;
    }

    let threshold = departuresCount * this.config.fadePointForReachableDepartures;
    let opacity = 1;
    let startOpacity = 0.8;
    let endOpacity = 0.2;
    let opacityDiff = (startOpacity - endOpacity) / (departuresCount - threshold);

    if (index > threshold) {
      let fadingIndex = index - threshold;
      let currentOpacity = fadingIndex * opacityDiff;
      opacity = startOpacity - currentOpacity;
    }

    return opacity;
  }


  getUnreachableRowOpacity(index, count) {
    if (!this.config.fadeUnreachableDepartures) {
      return 1.0;
    }

    let startOpacity = 0.3;
    let endOpacity = 0.6;
    let opacityDiff = (endOpacity - startOpacity) / count;

    if (index + 1 === count) {
      return endOpacity;
    } else {
      return startOpacity + opacityDiff * index;
    }
  }


  getRulerRow() {
    let row = document.createElement("tr");
    let cell = document.createElement("td");

    cell.colSpan = 3;
    cell.className = "pthRulerCell";
    row.appendChild(cell);

    return row;
  }
}
