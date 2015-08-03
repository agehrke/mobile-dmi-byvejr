/// <reference path="./libs/highcharts.d.ts"/>

module Byvejr {
  export class Forecast implements IForecast {
    constructor(protected image: HTMLImageElement,
      protected imageUrlFunction: (identifier: number) => string) {
    }

    display(identifier: number) {
      var imageUrl = this.imageUrlFunction(identifier);
      if (typeof imageUrl !== 'undefined') {
        this.image.src = imageUrl;
        this.image.parentElement.classList.remove('unavailable');
      } else {
        // Empty image
        this.image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        this.image.parentElement.classList.add('unavailable');
      }
    }

    toggleScrollable() {
      this.image.parentElement.classList.toggle('scrollable');
    }
  }

  export class LazyLoadedForecast extends Forecast {
    private loaded = false;
    constructor(image: HTMLImageElement, imageUrlFunction: (identifier: number) => string) {
      super(image, imageUrlFunction);
    }

    display(identifier: number) {
      if (this.loaded) {
        super.display(identifier);
      }
    }

    load(identifier: number) {
      this.markAsLoaded();
      this.display(identifier);
    }

    private markAsLoaded() {
      this.loaded = true;
      this.image.parentElement.classList.add('loaded');
    }
  }

  export interface IForecast {
    display(identifier: number);
    toggleScrollable();
  }

  export class DmiChartForecast implements IForecast {
    private chart = null;
    constructor(protected chartElement: Element) {
    }

    display(identifier: number) {
      this.buildChartData(identifier).then(data => {
        if (data['chart']) data.chart['renderTo'] = this.chartElement;
        this.chart = new Highcharts.Chart(data);
      });
    }

    toggleScrollable() {
      this.chartElement.parentElement.classList.toggle('scrollable');
      window.setTimeout(function() {
        this.chart.reflow();
      }.bind(this), 500);
    }

    private buildChartData(identifier: number) {
      return xhrPromiseGetRequest('http://crossorigin.me/http://www.dmi.dk/Data4DmiDk/getData?by_hour=true&id=4500' + identifier + '&country=DK')
      .then(JSON.parse).then(data => {
          var weatherData = data.weather_data.day1
            .concat(data.weather_data.day2)
            .concat(data.weather_data.day3);

          var labels = weatherData.map(function (i) {
            return i.time_text.replace('kl. ', '').replace(':00', '');
          });

          var temps = weatherData.map(function (i) {
            return i.temp;
          });

          var precips = weatherData.map(function (i) {
            return parseFloat(i.precip.replace(',', '.'));
          });

          var plotLines = this.findPlotLineValues(labels).map(function (v) {
            return { color: '#CCC', width: 1, dashStyle: 'dot', value: v };
          });

          return {
            title: {
              text: ''
            },
            chart: {
              backgroundColor: 'rgba(0,0,0,0)',
              spacing: [20,0,15,0]
            },
            xAxis: [{
              categories: labels,
              tickInterval: 3,
              plotLines: plotLines
            }],
            yAxis: [{
              min: 5,
              max: 25,
              tickInterval: 5,
              startOnTick: true,
              endOnTick: true,
              allowDecimals: false,
              title: {
                text: 'Temp.',
                align: 'high',
                offset: -1,
                rotation: 0,
                y: -10
              }
            }, {
                min: 0,
                max: 4,
                tickInterval: 1,
                startOnTick: true,
                endOnTick: true,
                allowDecimals: false,
                title: {
                  text: 'Regn (mm)',
                  align: 'high',
                  offset: 15,
                  rotation: 0,
                  y: -10
                },
                opposite: true
              }],
            plotOptions: {
              series: {
                enableMouseTracking: false,
                pointPadding: 0,
                groupPadding: 0,
                borderWidth: 0,
              }
            },
            series: [{
              type: 'column',
              name: 'Nedbør',
              data: precips,
              yAxis: 1
            }, {
                type: 'spline',
                name: 'Temp',
                data: temps,
                marker: {
                  enabled: false
                }
              }]
          };
        });
    }

    private findPlotLineValues(labels: Array<string>) {
      return labels.map(function (v, i) {
        return v === '00' ? i : -1;
      }).filter(function (v) {
        return v !== -1 && v !== 0;
      });
    }
  }
}
