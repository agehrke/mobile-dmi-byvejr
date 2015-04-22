module Byvejr {
  export class Navigation {
    activeNavLink: HTMLAnchorElement = null;
    activeNavIndex: number = null;
    navLinks: NodeListOf<HTMLAnchorElement>;

    constructor(private swipeable: Swipeable, private cityIdNormalization: (cityId: number) => number) {
      this.navLinks = document.querySelectorAll<HTMLAnchorElement>('nav a');
    }

    updateActiveNavItem(hashOrPageNumber: string | number) {
      // Loop through nav links and add/remove 'active' class
      for (var i = 0; i < this.navLinks.length; i++) {
        var navLink = this.navLinks.item(i);
        if (navLink.hash === hashOrPageNumber || i === hashOrPageNumber) {
          navLink.parentElement.classList.add('active');
          this.activeNavLink = navLink;
          this.activeNavIndex = i;
        } else {
          navLink.parentElement.classList.remove('active');
        }
      }

      return this.activeNavLink;
    }

    goto(hashOrPageNumber: string | number) {
      this.updateActiveNavItem(hashOrPageNumber);
      this.swipeable.gotoPage(this.activeNavIndex);
      return this.activeNavLink;
    }

    navigateCityForecast(city: Dmi.City | string, replaceState: boolean = false) {
      var cityId: number = null;
      if (typeof city === 'object') cityId = city.id;
      else cityId = parseInt(city.toString(), 10);

      cityId = this.cityIdNormalization(cityId);
      var newUrl = window.location.pathname + '?city=' + cityId + '#vejr';

      var state = {
        city: city
      };

      if (replaceState) {
        window.history.replaceState(state, '', newUrl);
      } else {
        window.history.pushState(state, '', newUrl);
      }

      this.goto('#vejr');
    }
  }
}
