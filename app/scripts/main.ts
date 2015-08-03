/// <reference path="./ByvejrModel"/>
/// <reference path="./Swipeable"/>
/// <reference path="./Navigation"/>
/// <reference path="./dom-extensions.d.ts"/>

// Extend window object with globals
interface Window {
  ga: any; // Google Analytics
}

module Byvejr {

  // DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Redirect to vejr.info if using Github domain
    if (window.location.host === 'agehrke.github.io') {
      window.location.replace('http://vejr.info/redirected.html');
    }

    // Create model and DMI facade
    var dmiFacade = new Dmi.Facade();
    var model = new ByvejrModel(dmiFacade);

    // No-op Google Analytics function
    if (!('ga' in window)) {
      window.ga = function () { };
    }

    var pageContainerElement = document.querySelector<HTMLElement>('.pages');
    var pageElements = pageContainerElement.querySelectorAll<HTMLElement>('.page');

    var swipeable = new Swipeable(pageContainerElement, pageElements);
    var navigation = new Navigation(swipeable, dmiFacade.normalizeCityId);

    // Register for page change
    swipeable.registerPageChange(function (pageNumber) {
      var navItem = navigation.updateActiveNavItem(pageNumber);

      if (pageNumber === 0) {
        model.showRadar();
      } else if (pageNumber === 3) {
        model.showBeachWeather();
      }

      if (navItem) {
        window.ga('send', 'event', 'Swipe', 'Swipe', navItem.textContent.trim());
      }
    });

    // Start/stop radar
    document.querySelector('.radar-img-container').addEventListener('click', function () {
      if (model.radar.isRunning()) {
        this.classList.add('paused');
        model.radar.pause();
      } else {
        this.classList.remove('paused');
        model.radar.start();
      }
    });

    // Zoomable forecasts
    var forecasts = document.querySelectorAll('.forecast, .chart');
    for (var i = 0; i < forecasts.length; i++) {
      forecasts[i].addEventListener('click', function () {
        var name = this.parentNode.dataset.name;
        model.forecasts[name].toggleScrollable();
        window.ga('send', 'event', 'Forecast', 'Toggle zoom', name);
      });
    }

    // Disable touch move events on forecast containers when scrollable
    var forecastContainers = document.querySelectorAll<HTMLElement>('.forecast-container');
    for (var i = 0; i < forecastContainers.length; i++) {
      forecastContainers[i].addEventListener('touchmove', function (e) {
        var target = <HTMLElement> e.currentTarget;
        if (target.classList.contains('scrollable')) {
          e.stopPropagation();
        }
      }, false);
    }

    var forecastContainers = document.querySelectorAll<HTMLElement>('.forecast-container.lazy-load');
    for (var i = 0; i < forecastContainers.length; i++) {
      var container = forecastContainers[i];
      forecastContainers[i].addEventListener('click', function (e) {
        var target = <HTMLElement> e.currentTarget;
        var name = target.dataset['name'];
        (<LazyLoadedForecast> model.forecasts[name]).load(model.cityId);
      }, false);
    }

    // Handle form submit of search code
    document.querySelector('.search-form').addEventListener('submit', handleSearchFormSubmit);

    // Handle click on "Find vejrudsigt ud fra min position" button
    var btns = document.querySelectorAll('.lookup-position');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', lookupPositionButtonClicked, false);
    }

    // Changes active navigation item and swipeable content on popstate
    window.addEventListener('popstate', function (e) {
      var hash = window.location.hash;
      navigation.goto(hash);

      if (hash === '#radar') {
        model.showRadar();
      } else if (hash === '#strandvejr') {
        model.showBeachWeather();
      }

      if (e.state && e.state.city) {
        model.displayForecasts(e.state.city);
      }
    }, false);

    // Needed for IE support as IE does not send popstate event for changes in url hash
    window.addEventListener('hashchange', function (e) {
      var hash = window.location.hash;
      navigation.goto(hash);

      if (hash === '#radar') {
        model.showRadar();
      }
    });

    // Check query string for "city=1223"
    var cityQueryStringMatch = window.location.search.match(/city=([0-9]+)/i);
    if (cityQueryStringMatch) {
      var cityId = parseInt(cityQueryStringMatch[1], 10);

      displayForecastFromCityId(cityId);
    } else if (window.location.hash) {
      if (window.location.hash === '#radar') {
        window.ga('send', 'event', 'Radar', 'Show', 'Direct link');
        navigation.goto('#radar');
        model.showRadar();
      } else if (window.location.hash === '#vejr') {
        lookupPositionButtonClicked();
      } else if (window.location.hash === '#soeg') {
        navigation.goto('#soeg');
      } else {
        var zipCode = parseInt(window.location.hash.replace('#', ''), 10);
        if (zipCode) {
          displayForecastFromCityId(zipCode);
        }
      }
    } else {
      lookupPositionButtonClicked();
    }

    // Function definitions
    function displayForecastFromCityId(cityId) {
      return model.dmiFacade.getDetailedCityForecast(cityId)
        .then(city => {
        model.displayForecasts(city);
        navigation.navigateCityForecast(city, true);

        window.ga('send', 'event', 'Forecast', 'Direct link', city.name);
      },
        () => {
          alert('Kunne ikke finde vejrudsigt for valgt by. Søg efter ny by.');
        });
    }

    function lookupPositionButtonClicked() {
      navigation.goto('#vejr');

      document.querySelector('.byvejr').classList.add('loading');

      // Display forecast
      model.displayFromUserLocation()
        .then(city => {

        // Remove loading,
        document.querySelector('.byvejr').classList.remove('loading');

        navigation.navigateCityForecast(city, true);
        window.ga('send', 'event', 'Forecast', 'My Location', city.link_name);
      })
        .catch(error => {
        document.querySelector('.byvejr').classList.remove('loading');

        if (typeof error === 'string') {
          alert(error);
        } else {
          alert('Kunne ikke finde din position.');
        }
      });
    }

    function handleSearchFormSubmit(e: Event) {
      // Get first input element of form (the text input)
      var name = this.elements[0].value;

      window.ga('send', 'event', 'Forecast', 'Search performed', name);

      // Search for cities using DMI
      model.dmiFacade.searchCitiesByName(name)
        .then(results => {
        if (results.length === 1) {
          model.displayForecasts(results[0]);
          navigation.navigateCityForecast(results[0]);

          window.ga('send', 'event', 'Forecast', 'Found by search', results[0].label);

          // Clear existing results
          var ul = document.querySelector('.results ul');
          while (ul.firstChild) ul.removeChild(ul.firstChild);

          return;
        }

        // Display multiple results
        var ul = document.querySelector('.results ul');

        // Clear existing results
        while (ul.firstChild) ul.removeChild(ul.firstChild);

        if (results.length === 0) {
          var li = document.createElement('li');
          li.textContent = 'Ingen resultater';
          ul.appendChild(li);
        }

        // Create li element for each result
        results.forEach(function (result) {
          var li = document.createElement('li');
          var link = document.createElement('a');
          link.textContent = result.label;
          link.href = '?city=' + result.id + '#vejr';

          // Handle click on li element
          link.addEventListener('click', function () {
            model.displayForecasts(result);
            navigation.navigateCityForecast(result);

            window.ga('send', 'event', 'Forecast', 'Found by search', result.label);
          }, false);

          // Add to DOM
          li.appendChild(link);
          ul.appendChild(li);
        });
      });

      // Prevent default submit action
      e.preventDefault();
    }
  });
}
