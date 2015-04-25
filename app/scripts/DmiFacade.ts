/// <reference path="./libs/xhr-promise.ts"/>

module Dmi {

  export interface RadarImage {
    src: string;
  }

  export interface City {
    id: number;
    latitude: number;
    longitude: number;
    label: string;
  }

  export interface DetailedCity extends City {
    id: number;
    latitude: number;
    longitude: number;
    distance: number;
    link_name?: string;
    name?: string;
  }

  export interface CitySearchResult extends City {
    label: string;
    country_code: string;
    country: string;
  }

  export class Facade {
    searchCitiesByName(query: string): Promise<CitySearchResult[]> {
      var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/Data4DmiDk/getData?type=forecast&term=' + query;
      return Byvejr.xhrPromiseGetRequest(url).then(JSON.parse)
        .then(results => {
        if (results[0].id === -1) {
          return []; // Return empty result
        } else {
          return results;
        }
      });
    }

    getDetailedCityForecast(id: number): Promise<DetailedCity> {
      if (id < 9999) id = id + 45000000;

      var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/Data4DmiDk/getData?by_hour=true&id=' + id + '&country=DK';
      return Byvejr.xhrPromiseGetRequest(url).then(JSON.parse);
    }

    getForecastImage(id: number | string, type: string) {
      // Normalize ID
      id = this.normalizeCityId(id);

      if (id < 9999) {
        if (type === 'dag1_2') return 'http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by=' + id + '&mode=long';
        else return 'http://servlet.dmi.dk/byvejr/servlet/byvejr?by=' + id + '&tabel=dag3_9';
      } else {
        return 'http://servlet.dmi.dk/byvejr/servlet/world_image?city=' + id + '&mode=' + type;
      }
    }

    getPollenForecastImage(id: number | string) {
      return 'http://servlet.dmi.dk/byvejr/servlet/pollen_dag1?by=' + id;
    }

    normalizeCityId(id: number | string) {
      var idAsNumber: number;
      if (typeof id === 'string') {
        idAsNumber = parseInt(id.toString(), 10);
      } else {
        idAsNumber = id;
      }

      // Danish ids is sometime prefixed with 4500, where the last four digits are the zipcode
      if (idAsNumber > 45000000) {
        return idAsNumber - 45000000;
      } else {
        return idAsNumber;
      }
    }

    getRadarImages(): Promise<RadarImage[]> {
      var url = 'https://cors-anywhere.herokuapp.com/www.dmi.dk/vejr/maalinger/radar-nedboer/?type=30800&tx_dmiafghanistan_afghanistan%5Baction%5D=ajaxTabbedStreamMapDataRequest&tx_dmiafghanistan_afghanistan%5Bcontroller%5D=Afghanistan&cHash=17d64301c5ef7e5f1fe1f6879b21da11&tx_dmiafghanistan_afghanistan[streamId]=3&tx_dmiafghanistan_afghanistan[numberOfImages]=18';
      return Byvejr.xhrPromiseGetRequest(url).then(JSON.parse);
    }

    searchCitiesByPosition(position: Position) {
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
      var dataArray: string[] = [];
      for (var prop in data) {
        dataArray.push(prop + '=' + encodeURIComponent(data[prop]));
      }
      var queryString = dataArray.join('&');

      return Byvejr.xhrPromiseGetRequest(url + '?' + queryString).then(JSON.parse)
        .then((cities: DetailedCity[]) => {
        // Calc distance for each city
        cities.forEach(city => {
          city.distance = this.getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, city.latitude, city.longitude);
        });

        // Sort by nearest
        cities.sort(function (a, b) {
          return a.distance - b.distance;
        });

        return cities;
      });
    }

    // From: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
    private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
      function deg2rad(deg: number) {
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
  }
}
