/// <reference path="./yrno.ts"/>
/// <reference path="./DmiFacade.ts"/>
/// <reference path="./Radar.ts"/>
/// <reference path="./Forecast.ts"/>

module Byvejr {
  export class ByvejrModel {
    cityId: number = null;
    forecasts: { [index: string]: Forecast; } = {};
    dmiFacade: Dmi.Facade;
    radar: Dmi.Radar;
    byvejrElement: HTMLElement;

    constructor(dmiFacade: Dmi.Facade) {
      this.dmiFacade = dmiFacade;

      // Create forecasts
      this.forecasts['dmi-2'] = new Forecast(document.querySelector<HTMLImageElement>('.two-day-forecast img'), id => {
        return this.dmiFacade.getForecastImage(id, 'dag1_2');
      });

      this.forecasts['dmi-9'] = new Forecast(document.querySelector<HTMLImageElement>('.nine-day-forecast img'), id => {
        return this.dmiFacade.getForecastImage(id, 'dag3_9');
      });

      this.forecasts['yr-2'] = new Forecast(document.querySelector<HTMLImageElement>('.two-day-forecast-yr img'), YrNo.getHourlyForecastImageUrl);

      this.radar = new Dmi.Radar(this.dmiFacade, document.querySelector<HTMLImageElement>('.radar-img-container img'));
      this.byvejrElement = document.querySelector<HTMLElement>('.byvejr');
    }

    displayForecasts(city: any) {
      if (typeof city !== 'string') {
        var title = city.label || city.link_name || city.name;
        title = title.replace(', Danmark', '');
        this.setTitle(title);
      }

      this.cityId = this.getCityIdFromCity(city);

      // Display forecasts
      for (var name in this.forecasts) {
        this.forecasts[name].display(this.cityId.toString());
      }

      this.byvejrElement.classList.add('loaded');
    }

    /**
     * Display forecasts from user location.
     */
    displayFromUserLocation(): Promise<Dmi.DetailedCity> {
      // Get position
      var currentPosition = new Promise<Position>(function (resolve, reject) {
        if (!('geolocation' in navigator)) {
          reject('Din mobil understøtter ikke udtræk af din position. Søg manuelt efter vejrudsigt.');
        }

        navigator.geolocation.getCurrentPosition(function (position) {
          resolve(position);
        }, function (error) {
            console.warn('Failed to retrieve location', error);
            reject(error);
          });
      });

      // Search for cities near position
      return currentPosition
        .then((pos) => {
        return this.dmiFacade.searchCitiesByPosition(pos);
      })
        .then(cities => {
        var nearest = cities[0];
        if (nearest) {
          this.displayForecasts(nearest);

          // Return found city
          return nearest;
        } else {
          return Promise.reject('Ingen vejrudsigt nær din position. Søg manuelt efter vejrudsigt.');
        }
      },(error) => {
          return Promise.reject('Kunne ikke finde vejrudsigt ud fra din position. Søg manuelt efter vejrudsigt.');
        });
    }

    /**
     * Display nedbørs radar.
     */
    showRadar() {
      this.radar.load().then(() => {
        document.querySelector('.radar').classList.remove('loading');
        this.radar.start();
      });
    }

    setTitle(title: string) {
      var nodes = document.querySelectorAll('title, h1');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].textContent = title;
      }
    }

    getCityIdFromCity(city: Dmi.City | string) {
      var id = (typeof city === 'string') ? parseInt(city, 10) : city.id;
      return this.dmiFacade.normalizeCityId(id);
    }
  }
}
