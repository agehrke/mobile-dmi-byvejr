(function(ns) {
  'use strict';

  function Swipeable(container, pageElements) {
    this.container = container;
    this.pageElements = pageElements;
    this.currentPage = 0;
    this.widthOfPage = pageElements[0].clientWidth;

    // Set width of container and
    this.container.style.width = (this.pageElements.length * this.widthOfPage) + 'px';

    // Override width of pages
    for (var i = 0; i < this.pageElements.length; i++) {
      this.pageElements[i].style.width = this.widthOfPage + 'px';
    }

    // Register for swipe events
    this.container.addEventListener('swipeleft', this._swipeEventHandler.bind(this), false);
    this.container.addEventListener('swiperight', this._swipeEventHandler.bind(this), false);
  }

  Swipeable.prototype.gotoPage = function(pageNumber, raiseEvent) {
    this.currentPage = pageNumber;
    var pixels = pageNumber * this.widthOfPage;
    this.container.style.transform = 'translateX(-' + pixels + 'px)';
    this.container.style.webkitTransform = 'translateX(-' + pixels + 'px)';

    if (raiseEvent) {
      var evt = document.createEvent('Event');
      evt.initEvent('pagechange', true, false);
      this.container.dispatchEvent(evt);
    }
  };

  Swipeable.prototype._swipeEventHandler = function(event) {
    var newPage = this.currentPage;
    if (event.type === 'swipeleft') {
      newPage++;
    } else {
      newPage--;
    }

    if (newPage >= 0 && newPage < this.pageElements.length) {
      this.gotoPage(newPage, true);
    }
  };

  Swipeable.prototype.registerPageChange = function(callback) {
    this.container.addEventListener('pagechange', function() {
      callback.call(this.pageElements[this.currentPage], this.currentPage);
    }.bind(this), false);
  };

  ns.Swipeable = Swipeable;
})(window.AG = window.AG || {});
