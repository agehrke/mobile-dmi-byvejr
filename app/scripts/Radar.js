(function(ns) {
  'use strict';

  function Radar(dmiFacade, img) {
    this.dmiFacade = dmiFacade;
    this.img = img;
    this.images = null;
    this.interval = null;
    this.currentImageIndex = 0;
  }

  Radar.prototype.load = function() {
    if (this.images) return Promise.resolve();

    return this.dmiFacade.getRadarImages()
      .then(function(items) {
        this.images = items;
      }.bind(this));
  };

  Radar.prototype.start = function() {
    if (!this.images || this.isRunning()) return;

    this.img.parentNode.classList.remove('ended');
    this.interval = window.setInterval(function() {
      this.img.src = 'http://www.dmi.dk' + this.images[this.currentImageIndex].src;
      this.currentImageIndex++;
      if (this.currentImageIndex >= this.images.length) {
        this.currentImageIndex = 0;
        this.img.parentNode.classList.add('ended');
        this.stop();
      }
    }.bind(this), 400);
  };

  Radar.prototype.stop = function() {
    if (!this.interval) return;

    window.clearInterval(this.interval);
    this.interval = null;
  };

  Radar.prototype.isRunning = function() {
    return this.interval !== null;
  };

  ns.Radar = Radar;
})(window.AG = window.AG || {});
