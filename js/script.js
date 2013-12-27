/*!
 * jQuery imagesLoaded plugin v2.0.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */
(function(c,n){var k="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(l){function m(){var b=c(h),a=c(g);d&&(g.length?d.reject(e,b,a):d.resolve(e));c.isFunction(l)&&l.call(f,e,b,a)}function i(b,a){b.src===k||-1!==c.inArray(b,j)||(j.push(b),a?g.push(b):h.push(b),c.data(b,"imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(h),c(g)]),e.length===j.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var f=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=f.find("img").add(f.filter("img")),j=[],h=[],g=[];e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){i(b.target,"error"===b.type)}).each(function(b,a){var e=a.src,d=c.data(a,"imagesLoaded");if(d&&d.src===e)i(a,d.isBroken);else if(a.complete&&a.naturalWidth!==n)i(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=k,a.src=e}):m();return d?d.promise(f):f}})(jQuery);

// DOM ready
$(function() {
	var displayForecasts = function(zipCode, callback) {
		$(".byvejr").addClass("active loading");
		$(".two-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by="+ zipCode +"&mode=long");
		$(".nine-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr?by="+ zipCode +"&tabel=dag3_9");
		
		// Capture load of forecast images
		var dfd = $(".byvejr").imagesLoaded();
		dfd.done(function(images) {
			$(".byvejr").removeClass("loading");
			if ($.isFunction(callback)) callback();
		});
		
		// Get city name from zip code using Geoservicen
		$.getJSON("http://geo.oiorest.dk/postnumre/"+ zipCode +".json?callback=?", function(data) {
			$("title, h1").text(data.navn);
		});
	}
	
	var scrollToForecasts = function() {
		$('html, body').animate({scrollTop: $(".byvejr").offset().top}, 500);
	}
	
	var showRadar = function() {
		$(".radar").addClass("active");
		$('html, body').animate({scrollTop: $(".radar").offset().top}, 500);		
		$.getJSON("http://query.yahooapis.com/v1/public/yql/agehrke/nedboers-radar2?format=json&callback=?", function(data) {		
			var items = data.query.results.json;
			if (items && items.length) {
				var img = $(".radar img");
				var currentIndex = 0;
				var interval = window.setInterval(function() {
					img.attr("src", "http://www.dmi.dk" + items[currentIndex].src);
					currentIndex++;
					if (currentIndex >= items.length) currentIndex = 0;
				}, 600);
			} else {
				// No data
				alert("Kunne ikke hente radar-billeder fra DMI. Prøv igen senere.");
			}
		});
	}
	
	var getCurrentZipCodeFromUserLocation = function(callback){
		navigator.geolocation.getCurrentPosition(function(position) {
			var latLng = position.coords.latitude + "," + position.coords.longitude;
			$.getJSON("http://geo.oiorest.dk/postnumre/"+ latLng +".json?callback=?", function(data) {
				callback(data.fra);
			}, function(error) {
				console.warn("Failed to get current position", error);
			});
		});
	};
	
	// Handle click on radar link
	$(".radar-link").click(function() { 
		ga('send', 'event', 'Radar', 'Show', 'Link');
		showRadar();
	});

	// Handle form submit of zip code
	$(".zipcode-form").submit(function() {
		var zipCode = $(".zipcode").val();
		displayForecasts(zipCode, scrollToForecasts);
		window.location.hash = zipCode;
		ga('send', 'event', 'Forecast', 'Show', 'Form submit', zipCode);
		return false;
	});
	
	// Check location hash for zip code etc
	if (window.location.hash) {
		if (window.location.hash == "#radar") {
			ga('send', 'event', 'Radar', 'Show', 'Direct link');
			showRadar();
		} else if (window.location.hash == "#min-position") {
			if ("geolocation" in navigator) {
				getCurrentZipCodeFromUserLocation(function(zipCode) {
					$(".zipcode").val(zipCode);
					displayForecasts(zipCode, scrollToForecasts);
				});
			} else {
				$("title, h1").text("Fejl i udtræk af position").addClass("error");
				$("<p class=\"error\">Din mobil understøtter ikke udtræk af din position</p>").insertBefore(".zipcode-selector");
			}
		}
		else {
			var zipCode = window.location.hash.replace("#", "");
			$(".zipcode").val(zipCode);
			displayForecasts(zipCode, scrollToForecasts);
			ga('send', 'event', 'Forecast', 'Show', 'Direct link', zipCode);
		}
	}
});
