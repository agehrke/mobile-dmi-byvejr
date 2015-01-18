(function(ns) {
  'use strict';

  function DmiFacade() {

  }

  DmiFacade.prototype.searchCitiesByName = function(query) {
    var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/Data4DmiDk/getData?type=forecast&term=' + query;
    return xhrPromiseGetRequest(url).then(JSON.parse)
      .then(function(results) {
        if (results[0].id === -1) {
          return []; // Return empty result
        } else {
          return results;
        }
      });
  };

  DmiFacade.prototype.getDetailedCityForecast = function(id) {
    if (id < 9999) id = id + 45000000;

    var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/Data4DmiDk/getData?by_hour=true&id='+ id +'&country=DK';
    return xhrPromiseGetRequest(url).then(JSON.parse);
  };

  DmiFacade.prototype.getForecastImage = function(id, type) {
    // Normalize ID
    id = this.normalizeCityId(id);

    if (id < 9999) {
      if (type === 'dag1_2') return 'http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by=' + id + '&mode=long';
      else return 'http://servlet.dmi.dk/byvejr/servlet/byvejr?by=' + id + '&tabel=dag3_9';
    } else {
      return 'http://servlet.dmi.dk/byvejr/servlet/world_image?city=' + id + '&mode=' + type;
    }
  };

  DmiFacade.prototype.normalizeCityId = function(id) {
    if (typeof id !== 'number') id = parseInt(id, 10);

    // Danish ids is sometime prefixed with 4500, where the last four digits are the zipcode
    if (id > 45000000) {
      return id - 45000000;
    } else {
      return id;
    }
  }

  DmiFacade.prototype.getRadarImages = function() {
    var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/vejr/maalinger/radar-nedboer/?type=30800&tx_dmiafghanistan_afghanistan%5Baction%5D=ajaxTabbedStreamMapDataRequest&tx_dmiafghanistan_afghanistan%5Bcontroller%5D=Afghanistan&cHash=17d64301c5ef7e5f1fe1f6879b21da11&tx_dmiafghanistan_afghanistan[streamId]=3&tx_dmiafghanistan_afghanistan[numberOfImages]=18';
    return xhrPromiseGetRequest(url).then(JSON.parse);
  };

  DmiFacade.prototype.searchCitiesByPosition = function(position) {
    var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/Data4DmiDk/getData';
    var data = {
      type: 'forecast',
      country: 'DK',
      latMin: position.coords.latitude - 1,
      latMax: position.coords.latitude + 1,
      lonMin: position.coords.longitude - 1,
      lonMax: position.coords.longitude + 1,
      level: 7
    };

    // Convert data object to query string
    var dataArray = [];
    for (var prop in data) {
      dataArray.push(prop + '=' + data[prop]);
    }
    var queryString = dataArray.join('&');

    return xhrPromiseGetRequest(url + '?' + queryString).then(JSON.parse)
      .then(function(cities) {
        // Calc distance for each city
        cities.forEach(function(city) {
          city.distance = getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, city.latitude, city.longitude);
        });

        // Sort by nearest
        cities.sort(function(a, b) {
          return a.distance - b.distance;
        });

        return cities;
      });
  };

  // From: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    function deg2rad(deg) {
      return deg * (Math.PI / 180);
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  ns.DmiFacade = DmiFacade;
})(window.AG = window.AG || {});
