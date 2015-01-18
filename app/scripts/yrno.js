/* exported yrNo */

var yrNo = (function() {
  'use strict';

  var zipCodes = {
    '1000': 'Capital/Copenhagen',
    '2670': 'Zealand/Greve/',
    '2970': 'Capital/Hørsholm/',
    '2630': 'Capital/Taastrup/',
    '3000': 'Capital/Elsinore/',
    '3250': 'Capital/Smidstrup~2613357/',
    '3400': 'Capital/Hillerød/',
    '3700': 'Capital/Rønne/',
    '4000': 'Zealand/Roskilde/',
    '4180': 'Zealand/Sorø/',
    '4200': 'Zealand/Slagelse/',
    '4600': 'Zealand/Køge/',
    '4700': 'Zealand/Næstved/',
    '5000': 'South_Denmark/Odense/',
    '5700': 'South_Denmark/Svendborg/',
    '6000': 'South_Denmark/Kolding/',
    '6400': 'South_Denmark/Sønderborg/',
    '6700': 'South_Denmark/Esbjerg/',
    '7000': 'South_Denmark/Fredericia/',
    '7100': 'South_Denmark/Vejle/',
    '7700': 'North_Jutland/Thisted/',
    '7400': 'Central_Jutland/Herning/',
    '7500': 'Central_Jutland/Holstebro/',
    '7800': 'Central_Jutland/Skive/',
    '7900': 'North_Jutland/Nykøbing_Mors/',
    '9000': 'North_Jutland/Aalborg/',
    '9500': 'North_Jutland/Hobro/',
    '9700': 'North_Jutland/Brønderslev/',
    '9900': 'North_Jutland/Frederikshavn/',
    '9800': 'North_Jutland/Hjørring/',
    '8000': 'Central_Jutland/Aarhus/',
    '8620': 'Central_Jutland/Kjellerup/',
    '8700': 'Central_Jutland/Horsens/',
    '8600': 'Central_Jutland/Silkeborg/',
    '8722': 'Central_Jutland/Hedensted/',
    '8800': 'Central_Jutland/Viborg/',
    '8850': 'Central_Jutland/Bjerringbro/',
    '8900': 'Central_Jutland/Randers/',
  };

  var findNameByZipCode = function(zipCode) {
    zipCode = zipCode + ''; // stringify
    if (zipCodes[zipCode]) return zipCodes[zipCode];
    // Change last two digits to zeros
    zipCode = zipCode.replace(/.{2}$/, '00');
    if (zipCodes[zipCode]) return zipCodes[zipCode];
    else return null;
  };

  var getHourlyForecastImageUrl = function(name) {
    return 'http://www.yr.no/place/Denmark/' + name + '/meteogram.png';
  };

  return {
    getHourlyForecastImageUrl: function(zipCode) {
      var name = findNameByZipCode(zipCode);
      if (name !== null) return getHourlyForecastImageUrl(name);
      else null;
    },
    hasForecastFor: function(zipCode) {
      return findNameByZipCode(zipCode) !== null;
    }
  };
})();
