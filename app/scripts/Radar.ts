/// <reference path="DmiFacade.ts" />

module Dmi {
  export class Radar {
    private interval: number;
    private images: RadarImage[];
    private currentImageIndex: number;
    constructor(private dmiFacade: Facade, private imgElement: HTMLImageElement) {
      this.currentImageIndex = 0;
    }

    /**
     * Load radar images from DMI.
     */
    load(): Promise<any> {
      if (this.isLoaded()) return Promise.resolve();

      return this.dmiFacade.getRadarImages()
        .then(items => {
        this.images = items;
      });
    }

    isLoaded() {
      return this.images != null;
    }

    start() {
      this.imgElement.parentElement.classList.remove('paused');
      this.imgElement.parentElement.classList.remove('ended');

      if (!this.isLoaded() || this.isRunning()) return;

      // Loop through images using setInterval
      this.interval = window.setInterval(() => {
        this.imgElement.src = this.dmiFacade.corsProxy('http://www.dmi.dk' + this.images[this.currentImageIndex].src);
        this.currentImageIndex++;
        if (this.currentImageIndex >= this.images.length) {
          this.currentImageIndex = 0;
          this.imgElement.parentElement.classList.add('ended');

          window.clearInterval(this.interval);
          this.interval = null;
        }
      }, 400);
    }

    pause() {
      this.imgElement.parentElement.classList.add('paused');

      if (this.interval) {
        window.clearInterval(this.interval);
        this.interval = null;
      }
    }

    isRunning() {
      return this.interval;
    }
  }
}
