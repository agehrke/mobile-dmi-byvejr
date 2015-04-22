module Byvejr {
  export class Forecast {
    constructor(private image: HTMLImageElement,
      private imageUrlFunction: (identifier: string) => string) {
    }

    display(identifier: string) {
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
}
