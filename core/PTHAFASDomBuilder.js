/* global PTHAFASTableBodyBuilder */
// eslint-disable-next-line no-unused-vars
class PTHAFASDomBuilder {
  constructor(config) {
    this.config = config;

    this.headingSymbols = {
      time: "fa fa-clock-o",
      line: "fa fa-bus",
      direction: "fa fa-exchange",
      platform: "fa fa-map-marker"
    };
  }

  getSimpleDom(message) {
    const wrapper = this.getWrapper();
    wrapper.appendChild(this.getDiv(message));

    return wrapper;
  }

  getDom(departures, headings, noDeparturesMessage) {
    const wrapper = this.getWrapper();
    const departuresTable = this.getDeparturesTable(
      departures,
      headings,
      noDeparturesMessage
    );
    wrapper.appendChild(departuresTable);

    return wrapper;
  }

  getWrapper() {
    const wrapper = document.createElement("div");
    wrapper.className = "mmm-pth-wrapper";
    wrapper.appendChild(
      this.createHeadingElement(
        this.config.headerPrefix,
        this.config.stationName,
        this.config.headerAppendix
      )
    );

    return wrapper;
  }

  getDiv(message, cssClasses = "small light dimmed") {
    this.messageDiv = document.createElement("div");
    this.messageDiv.className = cssClasses;
    this.messageDiv.innerHTML = message;

    return this.messageDiv;
  }

  // Create the module header. Prepend headerPrefix if given.
  createHeadingElement(headerPrefix, stationName, headerAppendix) {
    this.headingElement = document.createElement("header");
    this.heading = stationName;

    if (headerPrefix !== "") {
      this.heading = `${headerPrefix} ${this.heading}`;
    }

    if (headerAppendix !== "") {
      this.heading += ` ${headerAppendix}`;
    }

    this.headingElement.innerText = this.heading;

    return this.headingElement;
  }

  getDeparturesTable(departures, headings, noDepartureMessage) {
    const table = document.createElement("table");
    table.className = "mmm-pth-table small";

    if (this.config.showTableHeaders) {
      const tableHeader = this.getDeparturesTableHeader(headings);
      table.appendChild(tableHeader);
    }

    const tableBodyBuilder = new PTHAFASTableBodyBuilder(this.config);
    const tableBody = tableBodyBuilder.getDeparturesTableBody(
      departures,
      noDepartureMessage
    );
    table.appendChild(tableBody);

    return table;
  }

  getDeparturesTableHeader(headings) {
    const tHead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headerRow.className = "bold dimmed";

    this.config.tableHeaderOrder.forEach((key) => {
      const values = this.getHeadingValues(key, headings);
      headerRow.appendChild(this.getHeaderCell(values));
    });

    tHead.appendChild(headerRow);

    return tHead;
  }

  getHeadingValues(key, headings) {
    const result = {
      text: headings[key],
      symbol: this.headingSymbols[key],
      cssClass: ""
    };

    if (key === "line" || key === "direction" || key === "platform") {
      result.cssClass = "mmm-pth-text-center";
    }

    return result;
  }

  getHeaderCell(values) {
    const cell = document.createElement("td");
    cell.className = values.cssClass;

    if (this.config.showTableHeadersAsSymbols) {
      const content = document.createElement("i");
      content.className = values.symbol;
      cell.appendChild(content);
    } else {
      cell.innerText = values.text;
    }

    return cell;
  }
}
