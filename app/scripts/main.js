/* global ga, AG, yrNo */

// Define namespace
window.AG = window.AG || {};

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Redirect to by.vejr.info
  if (window.location.host === 'agehrke.github.io') {
    window.location.replace('http://by.vejr.info/#redirected');
  }

  // Create model and DMI facade
  var model = new AG.ByvejrModel(new AG.DmiFacade(), yrNo);

  // No-op Google Analytics function
  if (typeof ga === 'undefined') {
    window.ga = function() {};
  }

  var pageContainerElement = document.querySelector('.pages');
  var pageElements = pageContainerElement.querySelectorAll('.page');

  var swipeable = new AG.Swipeable(pageContainerElement, pageElements);

  // Register for page change
  swipeable.registerPageChange(function(pageNumber) {
    var navItem = navigation.updateActiveNavItem(pageNumber);

    if (pageNumber === 0) {
      model.showRadar();
    }

    if (navItem) {
      ga('send', 'event', 'Swipe', 'Swipe', navItem.textContent.trim());
    }
  });

  var navigation = (function() {
    var activeNavLink = null,
      activeNavIndex = null;
    var navLinks = document.querySelectorAll('nav a');

    function updateActiveNavItem(hashOrPageNumber) {
      for (var i = 0; i < navLinks.length; i++) {
        if (navLinks[i].hash === hashOrPageNumber || i === hashOrPageNumber) {
          navLinks[i].parentNode.classList.add('active');
          activeNavLink = navLinks[i];
          activeNavIndex = i;
        } else {
          navLinks[i].parentNode.classList.remove('active');
        }
      }

      return activeNavLink;
    }

    function goto(hashOrPageNumber) {
      updateActiveNavItem(hashOrPageNumber);
      swipeable.gotoPage(activeNavIndex);
      return activeNavLink;
    }

    function navigateCityForecast(city, replaceState) {
      var cityId = null;
      if (typeof city === 'object') cityId = city.id;
      else cityId = parseInt(city, 10);

      cityId = model.dmiFacade.normalizeCityId(cityId);
      var state = {
        city: city
      };
      var newUrl = window.location.pathname + '?city=' + cityId + '#vejr';

      if (replaceState) {
        window.history.replaceState(state, '', newUrl);
      } else {
        window.history.pushState(state, '', newUrl);
      }

      goto('#vejr');
    }

    return {
      goto: goto,
      navigateCityForecast: navigateCityForecast,
      updateActiveNavItem: updateActiveNavItem
    };
  })();

  // Start/stop radar
  document.querySelector('.radar-img').addEventListener('click', function() {
    if (model.radar.isRunning()) model.radar.stop();
    else model.radar.start();
  });

  // Zoomable forecasts
  var forecasts = document.querySelectorAll('.forecast');
  for (var i = 0; i < forecasts.length; i++) {
    forecasts[i].addEventListener('click', function() {
      var name = this.parentNode.dataset.name;
      model.forecasts[name].toggleScrollable();
      ga('send', 'event', 'Forecast', 'Toggle zoom', name);
    });
  }

  // Disable touch move events on forecast containers when scrollable
  var forecastContainers = document.querySelectorAll('.forecast-container');
  for (var i = 0; i < forecastContainers.length; i++) {
    forecastContainers[i].addEventListener('touchmove', function(e) {
      if (e.currentTarget.classList.contains('scrollable')) {
        e.stopPropagation();
      }
    }, false);
  }

  // Handle form submit of search code
  document.querySelector('.search-form').addEventListener('submit', function(e) {

    // Get first input element of form (the text input)
    var name = this.elements[0].value;

    // Search for cities using DMI
    model.dmiFacade.searchCitiesByName(name)
      .then(function(results) {
        if (results.length === 1) {
          model.displayForecasts(results[0]);
          navigation.navigateCityForecast(results[0]);

          ga('send', 'event', 'Forecast', 'Form submit', results[0].label);

          // Clear existing results
          var ul = document.querySelector('.results ul');
          while (ul.firstChild) ul.removeChild(ul.firstChild);

          return;
        }

        // Display multiple results
        var ul = document.querySelector('.results ul');

        // Clear existing results
        while (ul.firstChild) ul.removeChild(ul.firstChild);

        results.forEach(function(result) {
          var li = document.createElement('li');
          var link = document.createElement('a');
          link.textContent = result.label;
          link.href = '?city=' + result.id + '#vejr';

          // Handle click on li element
          link.addEventListener('click', function() {
            model.displayForecasts(result);
            navigation.navigateCityForecast(result);

            ga('send', 'event', 'Forecast', 'Form submit', result.label);
          }, false);

          // Add to DOM
          li.appendChild(link);
          ul.appendChild(li);
        });
      });

    // Prevent default submit action
    e.preventDefault();
  });

  // Handle click on "Find vejrudsigt ud fra min position" button
  var btns = document.querySelectorAll('.lookup-position');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', lookupPositionButtonClicked, false);
  }

  function lookupPositionButtonClicked() {
    navigation.goto('#vejr');

    document.querySelector('.byvejr').classList.add('loading');
    model.displayFromUserLocation()
      .then(function(city) {
        document.querySelector('.byvejr').classList.remove('loading');

        navigation.navigateCityForecast(city.id, true);
        ga('send', 'event', 'Forecast', 'My Location', city.link_name);
      })
      .catch(function(error) {
        document.querySelector('.byvejr').classList.remove('loading');

        if (typeof error === 'string') {
          alert(error);
        } else {
          alert('Kunne ikke finde din position.');
        }
      });
  }

  // Changes active navigation item and swipeable content on popstate
  window.addEventListener('popstate', function(e) {
    var hash = window.location.hash;
    navigation.goto(hash);

    if (hash === '#radar') {
      model.showRadar();
    }

    if (e.state && e.state.city) {
      model.displayForecasts(e.state.city);
    }
  }, false);

  function displayForecastFromCityId(cityId) {
    return model.dmiFacade.getDetailedCityForecast(cityId)
      .then(function(city) {
        model.displayForecasts(city);
        navigation.navigateCityForecast(city, true);

        ga('send', 'event', 'Forecast', 'Direct link', city.name);
      })
      .catch(function() {
        alert('Kunne ikke finde vejrudsigt for valgt by. Søg efter ny by.');
      });
  }

  // Check query string for "city=1223"
  var cityQueryStringMatch = window.location.search.match(/city=([0-9]+)/i);
  if (cityQueryStringMatch) {
    var cityId = parseInt(cityQueryStringMatch[1], 10);

    displayForecastFromCityId(cityId);
  } else if (window.location.hash) {
    if (window.location.hash === '#radar') {
      ga('send', 'event', 'Radar', 'Show', 'Direct link');
      navigation.goto('#radar');
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

});
