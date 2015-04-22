module YrNo {
  var zipCodes = {
    '1000': 'Capital/Copenhagen/',
    '2000': 'Capital/Frederiksberg/',
    '2500': 'Capital/Valby/',
    '2600': 'Capital/Taastrup/',
    '2670': 'Zealand/Greve/',
    '2700': 'Capital/Brønshøj/',
    '2800': 'Capital/Lyngby-Tårbæk_Kommune/',
    '2900': 'Capital/Hørsholm/',
    '3000': 'Capital/Elsinore/',
    '3100': 'Capital/Hornbæk/',
    '3250': 'Capital/Smidstrup~2613357/',
    '3300': 'Capital/Frederiksværk/',
    '3400': 'Capital/Hillerød/',
    '3500': 'Capital/Værløse/',
    '3600': 'Capital/Frederikssund/',
    '3700': 'Capital/Rønne/',
    '4000': 'Zealand/Roskilde/',
    '4100': 'Zealand/Ringsted/',
    '4180': 'Zealand/Sorø/',
    '4200': 'Zealand/Slagelse/',
    '4300': 'Zealand/Holbæk/',
    '4400': 'Zealand/Kalundborg',
    '4500': 'Zealand/Nykøbing_Sjælland/',
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

  function findNameByZipCode(zipCode: number | string) {
    if (zipCodes[zipCode.toString()]) return zipCodes[zipCode.toString()];
    // Change last two digits to zeros
    zipCode = zipCode.toString().replace(/.{2}$/, '00');
    if (zipCodes[zipCode.toString()]) return zipCodes[zipCode.toString()];
    else return null;
  }

  function getHourlyForecastImageUrlByName(name: string) {
    return 'http://www.yr.no/place/Denmark/' + name + '/meteogram.png';
  }

  export function getHourlyForecastImageUrl(zipCode: number | string) {
    var name = findNameByZipCode(zipCode);
    if (name !== null) return getHourlyForecastImageUrlByName(name);
    else null;
  }

  export function hasForecastFor(zipCode: number) {
    return findNameByZipCode(zipCode) !== null;
  }
}
