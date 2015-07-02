module Byvejr {
  export class Swipeable {
    container: HTMLElement;
    pageElements: NodeListOf<HTMLElement>;
    currentPage: number;
    widthOfPage: number;

    constructor(container: HTMLElement, pageElements: NodeListOf<HTMLElement>) {
      this.container = container;
      this.pageElements = pageElements;
      this.currentPage = 0;
      this.widthOfPage = pageElements.item(0).clientWidth;

      // Register for swipe events
      this.container.addEventListener('swipeleft', this.swipeEventHandler.bind(this), false);
      this.container.addEventListener('swiperight', this.swipeEventHandler.bind(this), false);
    }

    gotoPage(pageNumber: number, raiseEvent?: boolean) {
      this.currentPage = pageNumber;
      this.container.style.transform = 'translateX(-' + pageNumber * 25 + '%)';
      this.container.style['webkitTransform'] = 'translateX(-' + pageNumber * 25 + '%)';

      if (raiseEvent) {
        var evt = document.createEvent('Event');
        evt.initEvent('pagechange', true, false);
        this.container.dispatchEvent(evt);
      }
    }

    registerPageChange(callback: (pageNumber: number) => any) {
      this.container.addEventListener('pagechange',() => {
        callback.call(this.pageElements[this.currentPage], this.currentPage);
      }, false);
    }

    private swipeEventHandler(event: Event) {
      var newPage = this.currentPage;
      if (event.type === 'swipeleft') {
        newPage++;
      } else {
        newPage--;
      }

      if (newPage >= 0 && newPage < this.pageElements.length) {
        this.gotoPage(newPage, true);
      }
    }
  }
}
