const link = "https://data.vatsim.net/v3/vatsim-data.json";

const nickname = document.getElementById("nickname");
const callsign = document.getElementById("callsign");
const aircraft = document.getElementById("aircraft");
const origin = document.getElementById("origin");
const destination = document.getElementById("destination");
const groundSpd = document.getElementById("groundSpd");
const heading = document.getElementById("heading");
const alt = document.getElementById("alt");
const distTotal = document.getElementById("distTotal");
const distCovered = document.getElementById("distCovered");
const distRemaining = document.getElementById("distRemaining");
const route = document.getElementById("route");
const progress = document.getElementById("progress");
const thumb = document.getElementById("thumb");
const details = document.getElementById("details");
const loading = document.getElementById("loading");
const search = document.getElementById("query");
const searchResults = document.getElementById("searchResults");
const airportDetails = document.getElementById("airport");
const airportCode = document.getElementById("airportCode");
const airportName = document.getElementById("airportName");
const airportFlag = document.getElementById("airportFlag");
const airportDepartures = document.getElementById("airportDepartures");
const airportArrivals = document.getElementById("airportArrivals");
const airportSwitch = document.getElementById("options");
const flightCount = document.getElementById("flightCount");

fetch("https://webassets.volanta.app/volanta-flight-positions.json")
  .then((response) => response.json())
  .then((data) => console.log(data));

airportSwitch.querySelectorAll(".Option").forEach((option) => {
  option.addEventListener("click", () => {
    airportSwitch
      .querySelector(".Option.Selected")
      .classList.remove("Selected");

    option.classList.add("Selected");

    if (option.getAttribute("data-value") == "dep") {
      airportDepartures.style.display = "flex";
      airportArrivals.style.display = "none";
      flightCount.innerText = `Active flights: ${airportDepartures.children.length}`;
    } else {
      airportDepartures.style.display = "none";
      airportArrivals.style.display = "flex";
      flightCount.innerText = `Active flights: ${airportArrivals.children.length}`;
    }
  });
});

let tracking = false;
let lastPos;

const hud = document.getElementById("hud");

const track = document.getElementById("track");
track.addEventListener("click", () => {
  tracking = true;
  getData();
});

const toggleVisibility = (elements, shouldShow) => {
  elements.forEach((element) => {
    if (shouldShow) {
      element.classList.remove("Hidden");
    } else {
      element.classList.add("Hidden");
    }
  });
};

const detailsSmall = document.getElementById("detailsSmall");
const detailsSmallContent = document.getElementById("detailsSmallContent");
const expand = document.getElementById("expand");
expand.addEventListener("click", () => {
  toggleVisibility([details], true);
  toggleVisibility([detailsSmall], false);
});

let isMobile =
  navigator.maxTouchPoints || "ontouchstart" in document.documentElement;

import airports from "./data/airports.js";
import countries from "./data/countries.js";
import icons from "./assets/icons.js";

const setDetailsVisibility = (bool) => {
  if (!isMobile) {
    if (bool != null) toggleVisibility([details], true);
    else toggleVisibility([details], false);
  } else {
    if (bool != null) {
      toggleVisibility([details], false);
      toggleVisibility([detailsSmall], true);
    } else {
      toggleVisibility([details, detailsSmall], false);
    }
  }
};

const updateContent = (data) => {
  nickname.innerText = data["name"].slice(0, -5);
  callsign.innerText = data["callsign"];
  aircraft.innerText = data["flight_plan"]
    ? data["flight_plan"]["aircraft_short"]
    : "N/A";
  origin.innerText = data["flight_plan"]
    ? data["flight_plan"]["departure"]
    : "N/A";
  destination.innerText = data["flight_plan"]
    ? data["flight_plan"]["arrival"]
    : "N/A";
  groundSpd.innerText = data["groundspeed"] + " kn";
  heading.innerText = data["heading"] + "°";
  alt.innerText = data["altitude"] + " ft";
  route.innerText = data["flight_plan"] ? data["flight_plan"]["route"] : "N/A";

  let originAirport, destinationAirport;
  let coveredDist, remainingDist;

  if (isMobile) {
    const content = `
        <div class="Row">
          <span class="Name">${data["name"].slice(0, -5)}</span>
          <span class="Callsign">${data["callsign"]}</span>
        </div>
        <div class="Row">
          <div class="Departure">
            <label>FROM</label>
            <span class="Waypoint">${
              data["flight_plan"] ? data["flight_plan"]["departure"] : "N/A"
            }</span>
          </div>
          <div class="Arrival">
            <label>TO</label>
            <span class="Waypoint">${
              data["flight_plan"] ? data["flight_plan"]["arrival"] : "N/A"
            }</span>
          </div>
        </div>
    `;

    detailsSmallContent.innerHTML = content;
  }

  try {
    originAirport = airports[data["flight_plan"]["departure"]];
    coveredDist =
      map.distance(
        L.latLng(originAirport["lat"], originAirport["lon"]),
        L.latLng(data["latitude"], data["longitude"])
      ) * 0.000539956803;
    distCovered.innerText = Math.round(coveredDist) + " nm";
  } catch (e) {
    distCovered.innerText = "N/A";
  }
  try {
    destinationAirport = airports[data["flight_plan"]["arrival"]];
    remainingDist =
      map.distance(
        L.latLng(data["latitude"], data["longitude"]),
        L.latLng(destinationAirport["lat"], destinationAirport["lon"])
      ) * 0.000539956803;
    distRemaining.innerText = Math.round(remainingDist) + " nm";
  } catch (error) {
    distRemaining.innerText = "N/A";
  }
  const totalDist = coveredDist + remainingDist;
  if (originAirport && destinationAirport)
    distTotal.innerText = Math.round(totalDist) + " nm";
  else distTotal.innerText = "N/A";

  if (totalDist && coveredDist) {
    const percent = (coveredDist / totalDist) * 100;
    progress.style.width = percent + "%";
    thumb.style.left = percent + "%";
  } else {
    progress.style.width = "0%";
    thumb.style.left = "0%";
  }
};

let stats = {};

const markers = [];
let globalAirports = [];
let airportMarkers = [];
let map;
let data = [];

const playerCount = document.getElementById("onlinePlayers");
const playerCount2 = document.getElementById("onlinePlayers2");

const initializeApp = () => {
  init();
  getData();
  setInterval(getData, 15 * 1000);
};

window.onload = initializeApp;

let active, departure, arrival;

let updating = false;

let loop = setInterval(() => {
  getData();
}, 15 * 1000);

const displayAirportDetails = (airport) => {
  airportSwitch.children[0].click();
  toggleVisibility([airportDetails], true);
  const flights = getAirportFlights(airport["icao"], true);

  const flag = airport["country"];
  const code = airport["icao"];
  const name = airport["name"];

  airportFlag.src = `https://raw.githubusercontent.com/swantzter/square-flags/master/png/1x1/256/${flag.toLowerCase()}.png`;
  airportCode.innerText = code;
  airportName.innerText = name;

  airportDepartures.innerHTML = "";
  airportArrivals.innerHTML = "";

  flightCount.innerText = `Active flights: ${flights["departures"].length}`;

  let keys = Object.keys(flights);

  for (let i = 0; i < keys.length; i++) {
    flights[keys[i]].forEach((flight) => {
      let aircraft;
      let dep = "N/A",
        arr = "N/A";
      if (flight["flight_plan"]) {
        dep = flight["flight_plan"]["departure"];
        arr = flight["flight_plan"]["arrival"];
        aircraft = flight["flight_plan"]["aircraft_short"];
      }
      const el = document.createElement("div");
      el.addEventListener("click", () => {
        const pos = L.latLng(flight["latitude"], flight["longitude"]);
        map.setView(pos, map.getZoom());
        if (markers[flight["cid"]]) {
          markers[flight["cid"]]["marker"].fire("click");
          markers[flight["cid"]]["marker"].closeTooltip();
        } else {
          active = L.marker(pos, {
            id: flight["cid"],
          });
        }
      });
      el.classList.add("AirportDetails_Item");
      const content = `
        <div class="AirportDetails_Item_Row">
          <div class="AirportDetails_Item_Name">${flight["name"].slice(
            0,
            -5
          )}</div>
          <div class="AirportDetails_Item_Flight">${flight["callsign"]}</div>
          <div class="AirportDetails_Item_Aircraft">${aircraft}</div>
        </div>
        <div class="AirportDetails_Item_Row">
          <div class="AirportDetails_Item_Destination">
            Going ${i == 0 ? "to" : "from"} <span>${i == 0 ? arr : dep}</span>
          </div>
        </div>
      `;
      el.innerHTML = content;
      if (i == 0) airportDepartures.appendChild(el);
      else airportArrivals.appendChild(el);
    });
  }
};

const init = () => {
  // !!! ---------------------

  // !!! ---------------------

  map = L.map("map", {
    center: [50.378472, 14.970598],
    zoom: 6,
    minZoom: 3,
    // worldCopyJump: true,
    zoomControl: false,
    layers: [
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
      ),
    ],
  });
  const southWest = L.latLng(-90, -Infinity),
    northEast = L.latLng(90, Infinity),
    bounds = L.latLngBounds(southWest, northEast);
  map.setMaxBounds(bounds);

  Object.values(airports).forEach((airport) => {
    const pos = L.latLng(airport["lat"], airport["lon"]);
    const marker = L.marker(pos, {
      id: airport["icao"],
      icon: icons["airport"],
      airport,
      forceZIndex: 100,
    });

    if (!isMobile) {
      const content = `
      <div class="Main Airport">
        <div class="Row">
          <span class="Name">${airport["icao"]}${
        airport["iata"] ? "/" + airport["iata"] : ""
      }</span>
          <span class="Callsign">N/A</span>
        </div>
        <div class="Row">
          <label>${airport["name"]}</label>
        </div>
        </div>
      <span class="Expand">CLICK TO EXPAND</span>
    `;

      marker.bindTooltip(content, {
        // sticky: true,
        direction: "top",
        className: "Tooltip",
        offset: [0, -32],
        opacity: 1,
      });
    }

    marker.addEventListener("mouseover", () => {
      marker.setOpacity(1);
    });

    marker.addEventListener("mouseout", () => {
      marker.setOpacity(0.25);
    });

    marker.addEventListener("click", () => {
      toggleVisibility([searchResults], false);
      displayAirportDetails(airport);
    });

    globalAirports.push(marker);
  });

  // !!! ---------------------

  // dubaiMarker.addTo(map);
  // londonMarker.addTo(map);

  // var latlngs = [
  //   [london["lat"], london["lon"]],
  //   [dubai["lat"], dubai["lon"]],
  // ];

  // var polyline = L.polyline(latlngs, {
  //   color: "#67FFED",
  //   weight: 2,
  //   dashArray: 20,
  // }).addTo(map);
  // map.fitBounds(polyline.getBounds());

  // !!! ---------------------

  const handleMoveEnd = () => {
    getData();
  };

  const handleClick = () => {
    if (active && active._icon) active._icon.classList.remove("active");
    resetActiveMarker();
    resetAirportMarkers();
    setDetailsVisibility(active);
    toggleVisibility([searchResults, airportDetails], false);
  };

  const resetActiveMarker = () => {
    if (active) active.setForceZIndex(200);
    active = null;
    tracking = null;
    toggleVisibility([hud], true);
  };

  const resetAirportMarkers = () => {
    if (departure) {
      departure.remove();
      departure = null;
      airportMarkers = [];
    }
    if (arrival) {
      arrival.remove();
      arrival = null;
      airportMarkers = [];
    }
  };
  map.addEventListener("moveend", handleMoveEnd);
  map.addEventListener("click", handleClick);

  search.addEventListener("keydown", (e) => {
    if (e.keyCode == 13 && search.value.length > 0) {
      toggleVisibility([searchResults], true);
      toggleVisibility([details, detailsSmall, airportDetails], false);
      if (active && active._icon) active._icon.classList.remove("active");
      active = null;
      const query = search.value;
      const results = Object.values(airports).filter(
        (airport) =>
          airport.icao.toLowerCase().startsWith(query.toLowerCase()) &&
          getAirportFlights(airport.icao).length > 0
      );
      searchResults.innerHTML = "";
      if (results.length != 0) {
        results.forEach((airport) => {
          airport.flights = getAirportFlights(airport.icao);
        });

        results.sort((a, b) => b.flights.length - a.flights.length);
        results.forEach((result) => {
          const el = document.createElement("div");
          el.classList.add("ResultRow");
          el.addEventListener("click", () => {
            map.setView(L.latLng(result["lat"], result["lon"]), 8);
            toggleVisibility([searchResults], false);
            search.value = "";
            displayAirportDetails(result);
          });
          const elContent = `
          <div class="Img">
            <img
              src="https://raw.githubusercontent.com/swantzter/square-flags/master/png/1x1/256/${result.country.toLowerCase()}.png"
              width="42"
            />
          </div>
          <div class="Data">
            <span class="DataTitle">${result.icao}</span>
            <span class="DataDesc">${result.name}</span>
          </div>
          <div class="AirportFlights">${result.flights.length} flights</div>
        `;
          el.innerHTML = elContent;
          searchResults.appendChild(el);
        });
      } else searchResults.innerHTML = "<label>No results</label>";
    }
  });
};

const displayAirports = () => {
  globalAirports.forEach((airport) => {
    const pos = L.latLng(
      airport["options"]["airport"]["lat"],
      airport["options"]["airport"]["lon"]
    );
    const inBounds = fitsBounds(pos);
    if (inBounds[0] && map.getZoom() >= 8) {
      if (
        !airport["_map"] &&
        getAirportFlights(airport["options"]["airport"]["icao"]).length > 0
      ) {
        airport.setLatLng(inBounds[1]);
        airport.addTo(map);
        airport.setOpacity(0.25);
      }
    } else {
      airport.remove();
    }
  });
};

const getData = async () => {
  stats = {};
  clearInterval(loop);
  loop = setInterval(() => {
    getData();
  }, 10000);

  if (!updating) {
    updating = true;

    try {
      displayAirports();
      toggleVisibility([loading], true);
      const response = await fetch(link);
      const json = await response.json();
      data = json;
      markers.length == 0 ? addMarkers() : updateMarkers();
      updateUI();
      updating = false;
      toggleVisibility([loading], false);

      if (active)
        updateContent(
          data.pilots.find((pilot) => pilot["cid"] === active.options.id)
        );
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      updating = false;
      toggleVisibility([loading], false);
    }
    console.log(stats);
    if (tracking && active) {
      const position = active.getLatLng();
      if (
        !lastPos ||
        (lastPos["lat"] != position["lat"] && lastPos["lng"] != position["lng"])
      ) {
        lastPos = position;
        toggleVisibility([hud, details, detailsSmall], false);
        map.flyTo(position);
      }
    }
  }
};

const updateUI = () => {
  playerCount.innerHTML = `${data["general"]["unique_users"]}`;
  playerCount2.innerHTML = `${data["general"]["unique_users"]}`;
};

const createMarker = (pilot, pos) => {
  const id = pilot["cid"];
  const heading = pilot["heading"];
  const name = pilot["name"];
  const callsign = pilot["callsign"];
  let aircraft;
  let dep = "N/A",
    arr = "N/A";
  if (pilot["flight_plan"]) {
    dep = pilot["flight_plan"]["departure"];
    arr = pilot["flight_plan"]["arrival"];
    aircraft = pilot["flight_plan"]["aircraft_short"];
  }

  if (stats[aircraft]) stats[aircraft]++;
  else stats[aircraft] = 1;

  let markerIcon = icons["default"];

  if (aircraft) {
    if (icons[aircraft]) {
      markerIcon = icons[aircraft];
    } else if (aircraft.startsWith("B7") || aircraft.startsWith("A3")) {
      aircraft = aircraft.slice(0, -1);
      if (icons[aircraft]) {
        markerIcon = icons[aircraft];
      }
    }
  }

  const marker = L.marker(pos, {
    id,
    icon: markerIcon,
    rotationAngle: heading,
    rotationOrigin: "center center",
    forceZIndex: 200,
  });
  if (!markers[id]) {
    marker.addEventListener("click", () => {
      if (active && active._icon) active._icon.classList.remove("active");

      const position = marker.getLatLng();

      toggleVisibility([searchResults, airportDetails], false);

      active = marker;
      active.setForceZIndex(250);

      if (tracking) {
        tracking = null;

        toggleVisibility([hud], true);
      }

      const flp = pilot["flight_plan"];

      if (flp) {
        if (departure) {
          departure.remove();
          departure = null;
          airportMarkers = [];
        }
        if (arrival) {
          arrival.remove();
          arrival = null;
          airportMarkers = [];
        }
        const depAirport = airports[flp["departure"]];
        const arrAirport = airports[flp["arrival"]];

        if (depAirport) {
          let depLon = depAirport["lon"];
          const [depFlag, depPos] = fitsBounds({
            lat: depAirport["lat"],
            lng: depLon,
          });

          if (depFlag) {
            depLon = depPos.lng;
          }

          departure = L.marker([depAirport["lat"], depLon], {
            id: flp["departure"],
            icon: icons["departure"],
            forceZIndex: 300,
          });

          airportMarkers.push(departure);

          departure.addTo(map);
        }
        if (arrAirport) {
          let arrLon = arrAirport["lon"];

          const [arrFlag, arrPos] = fitsBounds({
            lat: arrAirport["lat"],
            lng: arrLon,
          });
          if (arrFlag) {
            arrLon = arrPos.lng;
          }
          arrival = L.marker([arrAirport["lat"], arrLon], {
            id: flp["arrival"],
            icon: icons["arrival"],
            forceZIndex: 300,
          });

          airportMarkers.push(arrival);
          arrival.addTo(map);
        }
      }

      setDetailsVisibility(active);
      updateContent(pilot);
      active._icon.classList.add("active");
      // TODO:
      // map.flyTo(position);
    });
    marker.addTo(map);
    if (active && id === active.options.id) {
      active = marker;
      active._icon.classList.add("active");
      marker.fire("click");
    }
    if (pilot["transponder"] == "7600" || pilot["transponder"] == "7700") {
      marker._icon.classList.add("sq");
    }
    const obj = {
      data: pilot,
      marker,
    };
    markers[id] = obj;

    if (!isMobile) {
      const content = `
        <div class="Main">
          <div class="Row">
            <span class="Name">${name.slice(0, -5)}</span>
            <span class="Callsign">${callsign}</span>
          </div>
          <div class="Row">
            <div class="Departure">
              <label>FROM</label>
              <span class="Waypoint">${dep}</span>
            </div>
            <div class="Arrival">
              <label>TO</label>
              <span class="Waypoint">${arr}</span>
            </div>
          </div>
          </div>
        <span class="Expand">CLICK TO EXPAND</span>
      `;

      marker.bindTooltip(content, {
        // sticky: true,
        direction: "top",
        className: "Tooltip",
        offset: [0, -8],
        opacity: 1,
      });
    }
  }
};

const matchesFilter = (data, filter) => {
  return true;
};

const addMarkers = () => {
  const pilots = data["pilots"];
  pilots.forEach((pilot) => {
    const lat = pilot["latitude"];
    const long = pilot["longitude"];
    const inBounds = fitsBounds(L.latLng(lat, long));
    if (inBounds[0] && matchesFilter(pilot, "")) {
      createMarker(pilot, inBounds[1]);
    }
  });
};

const getAirportFlights = (icao, separate = false) => {
  const flights = [];
  const separated = {
    departures: [],
    arrivals: [],
  };

  data["pilots"].forEach((pilot) => {
    const flightPlan = pilot["flight_plan"];
    if (flightPlan) {
      if (!separate) {
        if (flightPlan["departure"] == icao || flightPlan["arrival"] == icao)
          flights.push(pilot);
      } else {
        if (flightPlan["departure"] == icao)
          separated["departures"].push(pilot);
        else if (flightPlan["arrival"] == icao)
          separated["arrivals"].push(pilot);
      }
    }
  });
  return separate == false ? flights : separated;
};

const updateVisibleMarkers = (pilots) => {
  pilots.forEach((pilot) => {
    const { cid: id, latitude: lat, longitude: long, heading } = pilot;
    if (markers[id]) {
      const marker = markers[id].marker;
      marker.setLatLng(fitsBounds(L.latLng(lat, long))[1]);
      marker.setRotationAngle(heading);
      markers[id].data = pilot;
    }
  });
};

const removeInvisibleMarkers = () => {
  markers.forEach((marker) => {
    if (marker) {
      const { latitude: lat, longitude: long } = marker["data"];
      if (!fitsBounds(L.latLng(lat, long))[0]) {
        marker["marker"].remove();
        markers[marker["data"]["cid"]] = null;
      }
    }
  });
};

const updateAirportMarkers = () => {
  airportMarkers.forEach((marker) => {
    const originalPosition = L.latLng([
      airports[marker.options.id].lat,
      airports[marker.options.id].lon,
    ]);
    const [flag, newPosition] = fitsBounds({
      lat: originalPosition.lat,
      lng: originalPosition.lng,
    });
    if (flag) {
      marker.setLatLng(newPosition);
    }
  });
};

const updateAirportTooltips = () => {
  globalAirports.forEach((airport) => {
    const airportData = airport["options"]["airport"];
    const content = `
      <div class="Main Airport">
        <div class="Row">
          <span class="Name">${airportData["icao"]}${
      airportData["iata"] ? "/" + airportData["iata"] : ""
    }</span>
          <span class="Callsign">${
            getAirportFlights(airportData["icao"]).length
          } flights</span>
        </div>
        <div class="Row">
          <label>${airportData["name"]}</label>
        </div>
        </div>
      <span class="Expand">CLICK TO EXPAND</span>
    `;

    airport.setTooltipContent(content);
  });
};

const updateMarkers = () => {
  const pilots = data["pilots"];
  if (pilots) {
    updateVisibleMarkers(pilots);
    removeInvisibleMarkers();
    addMarkers();
    if (!isMobile) updateAirportTooltips();
  }

  updateAirportMarkers();
};

const fitsBounds = (pos) => {
  const visibleBounds = map.getBounds();
  const west = visibleBounds.getWest();
  const east = visibleBounds.getEast();

  let flag = visibleBounds.contains(pos);

  const initialPos = L.latLng([pos.lat, pos.lng]);

  if (!flag) {
    if (west < -180) {
      const d = parseInt((west - 180) / 360);
      pos.lng += 360 * d;
      flag = visibleBounds.contains(pos);
      if (d < -1 && !flag) {
        pos = initialPos;
        pos.lng += 360 * (d + 1);
        flag = visibleBounds.contains(pos);
      }
    } else if (east > 180) {
      const d = parseInt((east + 180) / 360);
      pos.lng += 360 * d;
      flag = visibleBounds.contains(pos);
      if (d > 1 && !flag) {
        pos = initialPos;
        pos.lng += 360 * (d - 1);
        flag = visibleBounds.contains(pos);
      }
    }
  }

  return [flag, pos];
};
