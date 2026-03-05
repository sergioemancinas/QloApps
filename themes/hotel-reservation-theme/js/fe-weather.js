(function() {
  'use strict';

  // Lauscha, Thuringia coordinates
  var LAT = 50.4833;
  var LON = 11.1667;
  var TIMEZONE = 'Europe/Berlin';

  // Configurable forecast days (Open-Meteo supports up to 16)
  var FORECAST_DAYS = 10;

  // WMO Weather codes mapping
  var weatherCodes = {
    0: { icon: '☼', en: 'Clear sky', de: 'Klarer Himmel' },
    1: { icon: '⛅', en: 'Mainly clear', de: 'Überwiegend klar' },
    2: { icon: '⛅', en: 'Partly cloudy', de: 'Teilweise bewölkt' },
    3: { icon: '☁', en: 'Overcast', de: 'Bewölkt' },
    45: { icon: '▒', en: 'Foggy', de: 'Neblig' },
    48: { icon: '▒', en: 'Icy fog', de: 'Eisnebel' },
    51: { icon: '🌧', en: 'Light drizzle', de: 'Leichter Nieselregen' },
    53: { icon: '🌧', en: 'Drizzle', de: 'Nieselregen' },
    55: { icon: '🌧', en: 'Dense drizzle', de: 'Starker Nieselregen' },
    61: { icon: '🌧', en: 'Light rain', de: 'Leichter Regen' },
    63: { icon: '🌧', en: 'Rain', de: 'Regen' },
    65: { icon: '🌧', en: 'Heavy rain', de: 'Starker Regen' },
    66: { icon: '🌧', en: 'Freezing rain', de: 'Gefrierender Regen' },
    67: { icon: '🌧', en: 'Heavy freezing rain', de: 'Starker gefrierender Regen' },
    71: { icon: '❄', en: 'Light snow', de: 'Leichter Schneefall' },
    73: { icon: '❄', en: 'Snow', de: 'Schneefall' },
    75: { icon: '❄', en: 'Heavy snow', de: 'Starker Schneefall' },
    77: { icon: '❄', en: 'Snow grains', de: 'Schneegriesel' },
    80: { icon: '🌦', en: 'Light showers', de: 'Leichte Schauer' },
    81: { icon: '🌦', en: 'Showers', de: 'Schauer' },
    82: { icon: '🌦', en: 'Heavy showers', de: 'Starke Schauer' },
    85: { icon: '🌨', en: 'Light snow showers', de: 'Leichte Schneeschauer' },
    86: { icon: '🌨', en: 'Snow showers', de: 'Schneeschauer' },
    95: { icon: '⛈', en: 'Thunderstorm', de: 'Gewitter' },
    96: { icon: '⛈', en: 'Thunderstorm with hail', de: 'Gewitter mit Hagel' },
    99: { icon: '⛈', en: 'Severe thunderstorm', de: 'Starkes Gewitter' }
  };

  // Simple, practical tips for visitors
  var weatherTips = {
    en: {
      0: 'Perfect for hiking the forest trails!',
      1: 'Great day for outdoor activities.',
      2: 'Pleasant conditions for exploring.',
      3: 'Good day to visit the glass workshops.',
      45: 'Foggy — cozy atmosphere in the village.',
      48: 'Icy fog — warm clothing recommended.',
      51: 'Light drizzle — bring a jacket.',
      53: 'Drizzle — umbrella recommended.',
      55: 'Persistent drizzle — indoor activities suggested.',
      61: 'Light rain — trails may be quiet.',
      63: 'Rainy — good day for museums.',
      65: 'Heavy rain — stay cozy indoors.',
      66: 'Freezing rain — take care on roads.',
      67: 'Icy conditions — best to stay indoors.',
      71: 'Light snow — beautiful winter scenery!',
      73: 'Snowing — magical forest views.',
      75: 'Heavy snow — winter wonderland!',
      77: 'Snow grains — dress warmly.',
      80: 'Occasional showers — pack a rain jacket.',
      81: 'Showers expected — plan for indoor breaks.',
      82: 'Heavy showers — indoor day recommended.',
      85: 'Light snow showers — scenic winter day.',
      86: 'Snow showers — cozy weather.',
      95: 'Thunderstorm — stay indoors.',
      96: 'Storm with hail — not safe outdoors.',
      99: 'Severe storm — stay safe inside.'
    },
    de: {
      0: 'Perfekt zum Wandern auf den Waldwegen!',
      1: 'Toller Tag für Outdoor-Aktivitäten.',
      2: 'Angenehme Bedingungen zum Erkunden.',
      3: 'Guter Tag für einen Besuch der Glasbläsereien.',
      45: 'Neblig — gemütliche Atmosphäre im Dorf.',
      48: 'Eisnebel — warme Kleidung empfohlen.',
      51: 'Leichter Nieselregen — Jacke mitnehmen.',
      53: 'Nieselregen — Regenschirm empfohlen.',
      55: 'Anhaltender Nieselregen — drinnen bleiben.',
      61: 'Leichter Regen — ruhige Waldwege.',
      63: 'Regnerisch — guter Tag fürs Museum.',
      65: 'Starker Regen — gemütlich drinnen bleiben.',
      66: 'Gefrierender Regen — Vorsicht auf Straßen.',
      67: 'Eisige Bedingungen — am besten drinnen bleiben.',
      71: 'Leichter Schnee — wunderschöne Winterlandschaft!',
      73: 'Schneefall — zauberhafte Waldansichten.',
      75: 'Starker Schnee — Winterwunderland!',
      77: 'Schneegriesel — warm anziehen.',
      80: 'Gelegentliche Schauer — Regenjacke einpacken.',
      81: 'Schauer erwartet — Pausen drinnen einplanen.',
      82: 'Starke Schauer — Tag drinnen empfohlen.',
      85: 'Leichte Schneeschauer — schöner Wintertag.',
      86: 'Schneeschauer — gemütliches Wetter.',
      95: 'Gewitter — drinnen bleiben.',
      96: 'Hagelsturm — nicht sicher draußen.',
      99: 'Schwerer Sturm — sicher drinnen bleiben.'
    }
  };

  var dayNames = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  };

  var monthNames = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
  };

  function getLang() {
    var lang = document.documentElement.lang || navigator.language || 'en';
    return lang.substring(0, 2).toLowerCase() === 'de' ? 'de' : 'en';
  }

  function getWeatherInfo(code) {
    return weatherCodes[code] || weatherCodes[3];
  }

  function getWeatherTip(code, lang) {
    var tips = weatherTips[lang] || weatherTips.en;
    if (tips[code]) return tips[code];
    if (code >= 95) return tips[95];
    if (code >= 85) return tips[85];
    if (code >= 80) return tips[80];
    if (code >= 71) return tips[73];
    if (code >= 61) return tips[63];
    if (code >= 51) return tips[53];
    if (code >= 45) return tips[45];
    if (code >= 1) return tips[1];
    return tips[0];
  }

  function getDayName(dateStr, lang) {
    var date = new Date(dateStr);
    var days = dayNames[lang] || dayNames.en;
    return days[date.getDay()];
  }

  function getDateLabel(dateStr, lang) {
    var date = new Date(dateStr);
    var months = monthNames[lang] || monthNames.en;
    return date.getDate() + ' ' + months[date.getMonth()];
  }

  function fetchWeather() {
    var url = 'https://api.open-meteo.com/v1/forecast?' +
      'latitude=' + LAT +
      '&longitude=' + LON +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max' +
      '&timezone=' + encodeURIComponent(TIMEZONE) +
      '&forecast_days=' + FORECAST_DAYS;

    return fetch(url).then(function(response) {
      if (!response.ok) throw new Error('Weather fetch failed');
      return response.json();
    });
  }

  function renderWeather(data) {
    var widget = document.getElementById('fe-weather-widget');
    if (!widget) return;

    var lang = getLang();
    var current = data.current;
    var daily = data.daily;
    var weatherInfo = getWeatherInfo(current.weather_code);

    // Current weather
    document.getElementById('fe-weather-icon').textContent = weatherInfo.icon;
    document.getElementById('fe-weather-temp').textContent = Math.round(current.temperature_2m);
    document.getElementById('fe-weather-feels').textContent = Math.round(current.apparent_temperature);
    document.getElementById('fe-weather-humidity').textContent = current.relative_humidity_2m;

    // Weather description
    var descEl = document.getElementById('fe-weather-desc');
    descEl.textContent = getWeatherTip(current.weather_code, lang);

    // Wind speed
    var windEl = document.getElementById('fe-weather-wind');
    if (windEl) {
      windEl.textContent = Math.round(current.wind_speed_10m);
    }

    // Forecast (skip today, show remaining days)
    var forecastContainer = document.getElementById('fe-weather-forecast');
    var forecastHtml = '';

    for (var i = 1; i < daily.time.length; i++) {
      var dayInfo = getWeatherInfo(daily.weather_code[i]);
      var maxTemp = Math.round(daily.temperature_2m_max[i]);
      var minTemp = Math.round(daily.temperature_2m_min[i]);
      var precipProb = daily.precipitation_probability_max[i] || 0;

      forecastHtml += '<div class="fe-weather-day">' +
        '<span class="fe-weather-day-name">' + getDayName(daily.time[i], lang) + '</span>' +
        '<span class="fe-weather-day-date">' + getDateLabel(daily.time[i], lang) + '</span>' +
        '<span class="fe-weather-day-icon">' + dayInfo.icon + '</span>' +
        '<span class="fe-weather-day-temps">' +
          '<span class="fe-weather-day-max">' + maxTemp + '°</span>' +
          '<span class="fe-weather-day-min">' + minTemp + '°</span>' +
        '</span>' +
        (precipProb > 20 ? '<span class="fe-weather-day-precip">' + precipProb + '%</span>' : '') +
        '</div>';
    }

    forecastContainer.innerHTML = forecastHtml;

    // Show content, hide loading
    widget.querySelector('.fe-weather-loading').style.display = 'none';
    widget.querySelector('.fe-weather-content').style.display = 'block';
    widget.querySelector('.fe-weather-error').style.display = 'none';
  }

  function showError() {
    var widget = document.getElementById('fe-weather-widget');
    if (!widget) return;

    widget.querySelector('.fe-weather-loading').style.display = 'none';
    widget.querySelector('.fe-weather-content').style.display = 'none';
    widget.querySelector('.fe-weather-error').style.display = 'block';
  }

  function init() {
    var widget = document.getElementById('fe-weather-widget');
    if (!widget) {
      return;
    }

    fetchWeather()
      .then(function(data) {
        renderWeather(data);
      })
      .catch(function() {
        showError();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
