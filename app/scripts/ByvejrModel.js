/* global AG */

(function(ns) {
  'use strict';

  function ByvejrModel(dmiFacade, yrNo) {
    this.cityId = null;
    this.forecasts = {};
    this.dmiFacade = dmiFacade;

    // Create forecasts
    this.forecasts['dmi-2'] = new AG.Forecast(document.querySelector('.two-day-forecast img'), function(id) {
      return this.dmiFacade.getForecastImage(id, 'dag1_2');
    }.bind(this));

    this.forecasts['dmi-9'] = new AG.Forecast(document.querySelector('.nine-day-forecast img'), function(id) {
      return this.dmiFacade.getForecastImage(id, 'dag3_9');
    }.bind(this));

    this.forecasts['yr-2'] = new AG.Forecast(document.querySelector('.two-day-forecast-yr img'), yrNo.getHourlyForecastImageUrl);

    this.radar = new AG.Radar(this.dmiFacade, document.querySelector('.radar-img-container img'));
  }

  ByvejrModel.prototype.displayForecasts = function(city) {
    if (typeof city === 'object') {
      var title = city.label || city.link_name || city.name;
      title = title.replace(', Danmark', '');
      this.setTitle(title);
    }

    this.cityId = this.getCityIdFromCity(city);

    // Display forecasts
    for (var name in this.forecasts) {
      this.forecasts[name].display(this.cityId);
    }

    document.querySelector('.byvejr').classList.add('loaded');
  };

  ByvejrModel.prototype.displayFromUserLocation = function() {
    // Get position
    var currentPosition = new Promise(function(resolve, reject) {
      if (!('geolocation' in navigator)) {
        reject('Din mobil understøtter ikke udtræk af din position. Søg manuelt efter vejrudsigt.');
      }

      navigator.geolocation.getCurrentPosition(function(position) {
        resolve(position);
      }, function(error) {
        console.warn('Failed to retrieve location', error);
        reject(error);
      });
    });

    // Search for cities near position
    return currentPosition.then(this.dmiFacade.searchCitiesByPosition)
    .then(function(cities) {
      var nearest = cities[0];
      if (nearest) {
        this.displayForecasts(nearest);

        // Return found city
        return nearest;
      } else {
        return Promise.reject('Ingen vejrudsigt nær din position. Søg manuelt efter vejrudsigt.');
      }
    }.bind(this))
    .catch(function() {
      Promise.reject('Kunne ikke finde vejrudsigt ud fra din position. Søg manuelt efter vejrudsigt.');
    });
  };

  ByvejrModel.prototype.showRadar = function() {
    this.radar.load().then(this.radar.start.bind(this.radar));
  };

  ByvejrModel.prototype.setTitle = function(title) {
    var nodes = document.querySelectorAll('title, h1');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = title;
    }
  };

  ByvejrModel.prototype.getCityIdFromCity = function(city) {
    if (typeof city === 'object') return city.id;
    else return parseInt(city, 10);
  };

  // Export to namespace
  ns.ByvejrModel = ByvejrModel;
})(window.AG = window.AG || {});
