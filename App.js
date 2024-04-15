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

let tracking = false;
let lastPos;

const hud = document.getElementById("hud");

const track = document.getElementById("track");
track.addEventListener("click", () => {
  tracking = true;
  getData();
});

const detailsSmall = document.getElementById("detailsSmall");
const detailsSmallContent = document.getElementById("detailsSmallContent");
const expand = document.getElementById("expand");
expand.addEventListener("click", () => {
  detailsSmall.classList.add("Hidden");
  details.classList.remove("Hidden");
});

let isMobile =
  navigator.maxTouchPoints || "ontouchstart" in document.documentElement;

import airports from "../data/airports.js";
import icons from "../assets/icons.js";

const setDetailsVisibility = (bool) => {
  if (!isMobile) {
    if (bool != null) details.classList.remove("Hidden");
    else details.classList.add("Hidden");
  } else {
    if (bool != null) {
      details.classList.add("Hidden");
      detailsSmall.classList.remove("Hidden");
    } else {
      details.classList.add("Hidden");
      detailsSmall.classList.add("Hidden");
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
let airportMarkers = [];
let map;
let data = [];

const playerCount = document.getElementById("onlinePlayers");
const playerCount2 = document.getElementById("onlinePlayers2");

window.onload = function () {
  init();
  getData();
};

let active, departure, arrival;

let updating = false;

let loop = setInterval(() => {
  getData();
}, 15 * 1000);

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

  map.addEventListener("moveend", () => {
    // markers.length == 0 ? addMarkers() : updateMarkers();
    getData();
  });

  map.addEventListener("click", () => {
    if (active && active._icon) active._icon.classList.remove("active");
    active = null;
    tracking = null;
    hud.classList.remove("Hidden");
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
    setDetailsVisibility(active);
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
      loading.classList.remove("Hidden");
      const response = await fetch(link);
      const json = await response.json();
      data = json;
      markers.length == 0 ? addMarkers() : updateMarkers();
      updateUI();
      updating = false;
      loading.classList.add("Hidden");

      if (active)
        updateContent(
          data.pilots.find((pilot) => pilot["cid"] === active.options.id)
        );
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      updating = false;
      loading.classList.add("hidden");
    }
    console.log(stats);
    if (tracking && active) {
      const position = active.getLatLng();
      if (
        !lastPos ||
        (lastPos["lat"] != position["lat"] && lastPos["lng"] != position["lng"])
      ) {
        lastPos = position;
        hud.classList.add("Hidden");
        detailsSmall.classList.add("Hidden");
        details.classList.add("Hidden");
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
  });
  if (!markers[id]) {
    marker.addTo(map);
    if (active && id === active.options.id) {
      active = marker;
      active._icon.classList.add("active");
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
        sticky: true,
        direction: "top",
        className: "Tooltip",
        offset: [0, -4],
        opacity: 1,
      });
    }
    marker.addEventListener("click", () => {
      if (active && active._icon) active._icon.classList.remove("active");

      const position = marker.getLatLng();

      active = marker;

      if (tracking) {
        tracking = null;

        hud.classList.remove("Hidden");
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
  }
};

const addMarkers = () => {
  const pilots = data["pilots"];
  pilots.forEach((pilot) => {
    const lat = pilot["latitude"];
    const long = pilot["longitude"];
    const inBounds = fitsBounds(L.latLng(lat, long));
    if (inBounds[0]) {
      createMarker(pilot, inBounds[1]);
    }
  });
};

const getIndex = (id) => {
  markers.forEach((marker, index) => {
    const pilotId = marker["data"]["cid"];
    if (pilotId == id) {
      return index;
    }
  });
};

const cleanArray = (arr) => {
  return arr.filter((element) => {
    return element !== null;
  });
};

const updateMarkers = () => {
  const pilots = data["pilots"];
  if (pilots) {
    // ! Update Position Of All Previously Visible Markers
    pilots.forEach((pilot) => {
      const id = pilot["cid"];
      const lat = pilot["latitude"];
      const long = pilot["longitude"];
      const heading = pilot["heading"];

      if (markers[id]) {
        const marker = markers[id].marker;
        marker.setLatLng(fitsBounds(L.latLng(lat, long))[1]);
        marker.setRotationAngle(heading);
        markers[id].data = pilot;
      }
    });
    // ! Remove No Longer Visible Markers
    markers.forEach((marker) => {
      if (marker) {
        const lat = marker["data"]["latitude"];
        const long = marker["data"]["longitude"];

        if (!fitsBounds(L.latLng(lat, long))[0]) {
          const mapMarker = marker["marker"];
          mapMarker.remove();
          markers[marker["data"]["cid"]] = null;
        }
      }
    });
    // ! Add Markers That Will Be Visible
    addMarkers();
  }

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
