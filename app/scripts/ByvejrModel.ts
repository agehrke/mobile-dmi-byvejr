/// <reference path="./yrno.ts"/>
/// <reference path="./DmiFacade.ts"/>
/// <reference path="./Radar.ts"/>
/// <reference path="./Forecast.ts"/>

module Byvejr {
  export class ByvejrModel {
    cityId: number = null;
    forecasts: { [index: string]: IForecast; } = {};
    dmiFacade: Dmi.Facade;
    radar: Dmi.Radar;
    byvejrElement: HTMLElement;

    constructor(dmiFacade: Dmi.Facade) {
      this.dmiFacade = dmiFacade;

      // Create forecasts
      this.forecasts['dmi-2'] = new DmiChartForecast(document.querySelector('.two-day-forecast .forecast'));

      this.forecasts['dmi-9'] = new Forecast(document.querySelector<HTMLImageElement>('.nine-day-forecast img'), id => {
        return this.dmiFacade.getForecastImage(id, 'dag3_9');
      });

      this.forecasts['yr-2'] = new Forecast(document.querySelector<HTMLImageElement>('.two-day-forecast-yr img'), YrNo.getHourlyForecastImageUrl);

      this.forecasts['pollen'] = new LazyLoadedForecast(document.querySelector<HTMLImageElement>('.pollen-forecast img'), id => {
        return this.dmiFacade.getPollenForecastImage(id);
      });

      this.forecasts['water-temp'] = new LazyLoadedForecast(document.querySelector<HTMLImageElement>('.water-temp img'), id => {
        return 'http://www.dmi.dk/fileadmin/Images/VU/badevand_overlay.gif';
      });

      this.forecasts['beach-forecast'] = new LazyLoadedForecast(document.querySelector<HTMLImageElement>('.beach-forecast img'), id => {
        return 'http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by=' + id + '&tabel=dag1&mode=long';
      });

      this.forecasts['wave-forecast'] = new LazyLoadedForecast(document.querySelector<HTMLImageElement>('.wave-forecast img'), id => {
        return 'http://servlet.dmi.dk/byvejr/servlet/byvejr?by='+ id +'&tabel=dag1&param=bolger';
      });

      this.radar = new Dmi.Radar(this.dmiFacade, document.querySelector<HTMLImageElement>('.radar-img-container img'));
      this.byvejrElement = document.querySelector<HTMLElement>('.byvejr');

      // Strandvejr
      document.querySelector('.beach-selector').addEventListener('change', e => {
        var beachId = document.querySelector<HTMLInputElement>('.beach-selector').value;

        if (beachId) {
          (<LazyLoadedForecast>this.forecasts['beach-forecast']).load(parseInt(beachId, 10));
          (<LazyLoadedForecast>this.forecasts['wave-forecast']).load(parseInt(beachId, 10));
        }
      });
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
        this.forecasts[name].display(this.cityId);
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

    showBeachWeather() {
      (<LazyLoadedForecast>this.forecasts['water-temp']).load(1);
      document.querySelector<HTMLImageElement>('.water-temp-isoterm').src = 'images/isoterm.png'; // Lazy load image
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
