(function(ns) {
  'use strict';

  function Forecast(image, imageUrlFunction) {
    this.image = image;
    this.imageUrlFunction = imageUrlFunction;
  }

  Forecast.prototype.display = function(identifier) {
    var imageUrl = this.imageUrlFunction(identifier);
    if (typeof imageUrl !== 'undefined') {
      this.image.src = imageUrl;
    } else {
      // Empty image
      this.image.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    }
  };

  Forecast.prototype.toggleScrollable = function() {
    this.image.parentNode.classList.toggle('scrollable');
  };

  ns.Forecast = Forecast;
})(window.AG = window.AG || {});
