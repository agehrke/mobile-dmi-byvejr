module Byvejr {
  export class Forecast {
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
}
