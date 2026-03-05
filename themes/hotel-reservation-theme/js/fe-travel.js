(function() {
  "use strict";

  var initialized = false;
  var requestCounter = 0;
  var DESTINATION_ID = "8012171";

  var ORIGINS = {
    erfurt: { name: "Erfurt Hbf", id: "8010101" },
    nuremberg: { name: "Nürnberg Hbf", id: "8000284" },
    berlin: { name: "Berlin Hbf", id: "8011160" },
    munich: { name: "München Hbf", id: "8000261" },
    frankfurt: { name: "Frankfurt (Main) Hbf", id: "8000105" }
  };

  var i18n = {
    en: {
      loading: "Loading connections...",
      error: "Could not load connections",
      direct: "Direct",
      change: "change",
      changes: "changes",
      fallback: "Plan your journey on",
      noConnections: "No connections found"
    },
    de: {
      loading: "Verbindungen werden geladen...",
      error: "Verbindungen konnten nicht geladen werden",
      direct: "Direkt",
      change: "Umstieg",
      changes: "Umstiege",
      fallback: "Planen Sie Ihre Reise auf",
      noConnections: "Keine Verbindungen gefunden"
    }
  };

  function getLang() {
    var lang = document.documentElement.lang || navigator.language || "en";
    return lang.substring(0, 2).toLowerCase() === "de" ? "de" : "en";
  }

  function t(key) {
    var lang = getLang();
    return i18n[lang][key] || i18n.en[key] || key;
  }

  function formatTime(dateStr) {
    var date = new Date(dateStr);
    return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0");
  }

  function formatDuration(minutes) {
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return hours + "h " + mins.toString().padStart(2, "0") + "m";
  }

  function calculateDuration(departure, arrival) {
    return Math.round((new Date(arrival) - new Date(departure)) / 60000);
  }

  function getProducts(journey) {
    var products = [];
    if (journey.legs) {
      journey.legs.forEach(function(leg) {
        if (leg.line && leg.line.productName && products.indexOf(leg.line.productName) === -1) {
          products.push(leg.line.productName);
        }
      });
    }
    return products;
  }

  function fetchConnectionsXHR(url) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = 8000;
      xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (err) {
            reject(err);
          }
          return;
        }
        reject(new Error("API error"));
      };
      xhr.onerror = function() {
        reject(new Error("API error"));
      };
      xhr.ontimeout = function() {
        reject(new Error("Timeout"));
      };
      xhr.send();
    }).then(function(data) {
      if (data.error) throw new Error(data.error);
      return data.journeys || [];
    });
  }

  function fetchConnections(originId) {
    var url = "/api-proxy.php?from=" + encodeURIComponent(originId) + "&to=" + encodeURIComponent(DESTINATION_ID);
    if (typeof window.fetch !== "function") {
      return fetchConnectionsXHR(url);
    }

    var controller = null;
    var timeoutId = null;
    if (typeof AbortController !== "undefined") {
      controller = new AbortController();
      timeoutId = setTimeout(function() {
        controller.abort();
      }, 8000);
    }

    var options = { cache: "no-store" };
    if (controller) {
      options.signal = controller.signal;
    }

    return fetch(url, options)
      .then(function(response) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!response.ok) throw new Error("API error");
        return response.json();
      }, function(err) {
        if (timeoutId) clearTimeout(timeoutId);
        throw err;
      })
      .then(function(data) {
        if (data.error) throw new Error(data.error);
        return data.journeys || [];
      });
  }

  function renderConnections(journeys, container) {
    if (!journeys || journeys.length === 0) {
      container.innerHTML = '<div class="train-error">' + t("noConnections") + '</div>';
      return;
    }

    var html = "";
    journeys.forEach(function(journey) {
      var legs = journey.legs || [];
      var firstLeg = legs[0] || {};
      var lastLeg = legs[legs.length - 1] || {};
      var departure = firstLeg.departure || firstLeg.plannedDeparture;
      var arrival = lastLeg.arrival || lastLeg.plannedArrival;
      if (!departure || !arrival) return;

      var duration = calculateDuration(departure, arrival);
      var changes = legs.filter(function(leg) { return leg.line; }).length - 1;
      var products = getProducts(journey);
      var changesText = changes === 0 ? t("direct") : changes + " " + (changes === 1 ? t("change") : t("changes"));
      var changesClass = changes === 0 ? "train-changes direct" : "train-changes";

      html += '<div class="train-connection">' +
        '<div class="train-times"><span class="departure">' + formatTime(departure) + '</span><span class="arrow">→</span><span class="arrival">' + formatTime(arrival) + '</span></div>' +
        '<div class="train-duration">' + formatDuration(duration) + '</div>' +
        '<div class="' + changesClass + '">' + changesText + '</div>' +
        '<div class="train-products">' + products.map(function(p) { return '<span>' + p + '</span>'; }).join("") + '</div>' +
      '</div>';
    });

    container.innerHTML = html;
  }

  function renderFallback(container, originName) {
    var dbUrl = "https://reiseauskunft.bahn.de/bin/query.exe/dn?S=" + encodeURIComponent(originName) + "&Z=Lauscha%20(Th%C3%BCr)&start=1";
    container.innerHTML = '<div class="train-fallback"><p>' + t("error") + '</p><p><a href="' + dbUrl + '" target="_blank" rel="noopener">' + t("fallback") + ' bahn.de →</a></p></div>';
  }

  function loadConnections(originKey) {
    var origin = ORIGINS[originKey];
    if (!origin) return;

    var container = document.getElementById("train-results");
    if (!container) return;

    container.innerHTML = '<div class="train-result-loading"><div class="spinner"></div><span>' + t("loading") + '</span></div>';

    var requestId = ++requestCounter;
    var timeoutId = setTimeout(function() {
      if (requestId !== requestCounter) return;
      renderFallback(container, origin.name);
    }, 9000);

    fetchConnections(origin.id)
      .then(function(journeys) {
        if (requestId !== requestCounter) return;
        clearTimeout(timeoutId);
        renderConnections(journeys, container);
      })
      .catch(function(err) {
        if (requestId !== requestCounter) return;
        clearTimeout(timeoutId);
        console.error("Train connections error:", err);
        renderFallback(container, origin.name);
      });
  }

  function init() {
    if (initialized) return;
    
    var select = document.getElementById("train-route-select");
    var container = document.getElementById("train-results");
    if (!select || !container) return;

    initialized = true;

    select.addEventListener("change", function() {
      loadConnections(this.value);
    });

    loadConnections(select.value || "erfurt");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
