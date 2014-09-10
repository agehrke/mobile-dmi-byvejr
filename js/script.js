/*!
 * jQuery imagesLoaded plugin v2.0.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */
(function(c,n){var k="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(l){function m(){var b=c(h),a=c(g);d&&(g.length?d.reject(e,b,a):d.resolve(e));c.isFunction(l)&&l.call(f,e,b,a)}function i(b,a){b.src===k||-1!==c.inArray(b,j)||(j.push(b),a?g.push(b):h.push(b),c(b).data("imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(h),c(g)]),e.length===j.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var f=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=f.find("img").add(f.filter("img")),j=[],h=[],g=[];e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){i(b.target,"error"===b.type)}).each(function(b,a){var e=a.src,d=c(a).data("imagesLoaded");if(d&&d.src===e)i(a,d.isBroken);else if(a.complete&&a.naturalWidth!==n)i(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=k,a.src=e}):m();return d?d.promise(f):f}})(jQuery);

window.AG = window.AG || {};

// Yr.no wrapper
var yrNo = (function() {
	var zipCodes = {
		"1000" : "Capital/Copenhagen",
		"2670" : "Zealand/Greve/",
		"2970" : "Capital/Hørsholm/",
		"2630" : "Capital/Taastrup/",
		"3000" : "Capital/Elsinore/",
		"3250" : "Capital/Smidstrup~2613357/",
		"3400" : "Capital/Hillerød/",			
		"3700" : "Capital/Rønne/",
		"4000" : "Zealand/Roskilde/",						
		"4180" : "Zealand/Sorø/",
		"4200" : "Zealand/Slagelse/",			
		"4600" : "Zealand/Køge/",
		"4700" : "Zealand/Næstved/",
		"5000" : "South_Denmark/Odense/",
		"5700" : "South_Denmark/Svendborg/",
		"6000" : "South_Denmark/Kolding/",
		"6400" : "South_Denmark/Sønderborg/",
		"6700" : "South_Denmark/Esbjerg/",
		"7000" : "South_Denmark/Fredericia/",
		"7100" : "South_Denmark/Vejle/",
		"7700" : "North_Jutland/Thisted/",
		"7400" : "Central_Jutland/Herning/",
		"7500" : "Central_Jutland/Holstebro/",
		"7800" : "Central_Jutland/Skive/",
		"7900" : "North_Jutland/Nykøbing_Mors/",						
		"9000" : "North_Jutland/Aalborg/",
		"9500" : "North_Jutland/Hobro/",
		"9700" : "North_Jutland/Brønderslev/",
		"9900" : "North_Jutland/Frederikshavn/",
		"9800" : "North_Jutland/Hjørring/",
		"8000" : "Central_Jutland/Aarhus/",
		"8620" : "Central_Jutland/Kjellerup/",
		"8700" : "Central_Jutland/Horsens/",
		"8600" : "Central_Jutland/Silkeborg/",
		"8722" : "Central_Jutland/Hedensted/",
		"8800" : "Central_Jutland/Viborg/",
		"8850" : "Central_Jutland/Bjerringbro/",
		"8900" : "Central_Jutland/Randers/",
	};

	var findNameByZipCode = function(zipCode) {
		if (zipCodes[zipCode]) return zipCodes[zipCode];
		// Change last two digits to zeros
		zipCode = zipCode.replace(/.{2}$/, "00");
		if (zipCodes[zipCode]) return zipCodes[zipCode];
		else return null;
	}

	var getHourlyForecastImageUrl = function(name) {
		return "http://www.yr.no/place/Denmark/"+ name +"/meteogram.png";
	}

	return {
		'getHourlyForecastImageUrl': function(zipCode) {
			var name = findNameByZipCode(zipCode);
			if (name != null) return getHourlyForecastImageUrl(name);
			else null;
		},

		'hasForecastFor': function(zipCode) {
			return findNameByZipCode(zipCode) != null;
		}
	};
})();

(function(ns) {
	function Forecast(container, imageUrlFunction) {
		this.container = container;
		this.imageUrlFunction = imageUrlFunction;	
	}

	Forecast.prototype.display = function(zipCode, callback) {
		this.container.addClass("loading").removeClass("loaded");

		var imageUrl = this.imageUrlFunction(zipCode);
		this.container.find(".forecast").attr("src", imageUrl);
		
		var dfd = this.container.imagesLoaded();
		dfd.done($.proxy(function(images) {
			this.container.removeClass("loading").addClass("loaded");
			if ($.isFunction(callback)) callback();
		}, this));
	}
	Forecast.prototype.toggleScrollable = function() {
		this.container.toggleClass("scrollable");
	}
	Forecast.prototype.isLoaded = function() {
		return this.container.hasClass("loaded");
	}

	function Radar(container, img) {
		this.container = container;
		this.img = img;
		this.images = null;
		this.interval = null;
		this.currentImageIndex = 0;
	}

	Radar.prototype.load = function(callback) {
		this.container.removeClass("ended");
		$.getJSON("http://agehrkepipes.azure-mobile.net/api/Weather/Radar", $.proxy(function(data) {		
			var items = data;
			if (items && items.length) {
				this.images = items;
				callback();
			}			
			else {
				// No data
				callback({error: true, msg: "Kunne ikke hente radar-billeder fra DMI. Prøv igen senere."});
			}
		}, this));
	}

	Radar.prototype.start = function() {		
		if (!this.images) return;

		this.container.removeClass("ended");
		this.interval = window.setInterval($.proxy(function() {
			this.img.attr("src", "http://www.dmi.dk" + this.images[this.currentImageIndex].src);
			this.currentImageIndex++;
			if (this.currentImageIndex >= this.images.length) {						
				this.currentImageIndex = 0;				
				this.container.addClass("ended");
				this.stop();
			}
		}, this), 400);
	}
	
	Radar.prototype.stop = function() {
		if (!this.interval) return;

		window.clearInterval(this.interval);
		this.interval = null;
	}

	function ByvejrModel() {
		this.zipCode = "";
		this.forecasts = {};

		// Create forecasts
		this.forecasts["dmi-2"] = new Forecast($(".two-day-forecast"), function(zipCode) {
										return "http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by="+ zipCode +"&mode=long";
									});
		
		this.forecasts["dmi-9"] = new Forecast($(".nine-day-forecast"), function(zipCode) {
										return "http://servlet.dmi.dk/byvejr/servlet/byvejr?by="+ zipCode +"&tabel=dag3_9";
									});

		this.forecasts["yr-2"] = new Forecast($(".two-day-forecast-yr"), yrNo.getHourlyForecastImageUrl);

		this.radar = new Radar($(".radar-img-container"), $(".radar-img-container img"));
	}

	ByvejrModel.prototype.displayForecasts = function(zipCode, callback) {
		this.zipCode = zipCode;

		$(".byvejr").addClass("active");

		// Display DMI 2-day forecast
		this.forecasts["dmi-2"].display(zipCode, callback);
		
		// Reload previously loaded forecasts
		$.each(this.forecasts, function(i, forecast) {
			if (forecast.isLoaded()) forecast.display(zipCode);
		});

		// Get city name from zip code using Geoservicen
		$.getJSON("http://geo.oiorest.dk/postnumre/"+ zipCode +".json?callback=?", function(data) {
			$("title, h1").text(data.navn);
		});
	}

	ByvejrModel.prototype.getCurrentZipCodeFromUserLocation = function(callback){
		navigator.geolocation.getCurrentPosition(function(position) {
			var latLng = position.coords.latitude + "," + position.coords.longitude;
			$.getJSON("http://geo.oiorest.dk/postnumre/"+ latLng +".json?callback=?", function(data) {
				callback(data.fra);
			}, function(error) {
				console.warn("Failed to get current position", error);
			});
		});
	}

	ByvejrModel.prototype.showRadar = function() {
		$(".radar").addClass("active", "loading");
		$('html, body').animate({scrollTop: $(".radar").offset().top}, 500);
		this.radar.load($.proxy(function(error) {
			if (error) {
				alert(error.msg);
			} else {
				this.radar.start();
			}
		}, this));
	}

	ByvejrModel.prototype.scrollToForecasts = function() {
		$('html, body').animate({scrollTop: $(".byvejr").offset().top}, 500);
	}

	// Export to namespace
	ns.ByvejrModel = ByvejrModel;
	ns.Forecast = Forecast;
})(window.AG);

// DOM ready
$(function() {
	// Redirect to by.vejr.info
	if (window.location.host == "agehrke.github.io") {
		window.location.replace("http://by.vejr.info/#redirected");
	} else if (window.location.hash == '#redirected') {
		$(".redirect-note").show();
		window.location.hash = '';
	}

	var model = new AG.ByvejrModel();

	// Handle click on radar link
	$(".radar .activator").click(function() { 
		ga('send', 'event', 'Radar', 'Show', 'Link');
		model.showRadar();
	});

	$(".radar .restart").click(function() {
		model.radar.start();
	});

	// Handle form submit of zip code
	$(".zipcode-form").submit(function() {
		var zipCode = $(".zipcode").val();
		model.displayForecasts(zipCode, model.scrollToForecasts);
		
		window.location.hash = zipCode;
		ga('send', 'event', 'Forecast', 'Show', 'Form submit', zipCode);
		return false;
	});


	$(".forecast-container")
	// Display forecast when clicking activator
	.on("click", ".activator", function(e) {
		var name = $(e.delegateTarget).data("name");
		model.forecasts[name].display(model.zipCode);
		ga('send', 'event', 'Forecast', 'Show', name, model.zipCode);
	})
	// Toogle scrollable when clicking on forecast
	.on("click", ".forecast", function(e) {
		var name = $(e.delegateTarget).data("name");
		model.forecasts[name].toggleScrollable();
		ga('send', 'event', 'Forecast', 'Toggle zoom', name);
	});
	
	
	// Check location hash for zip code etc
	if (window.location.hash) {
		if (window.location.hash == "#radar") {
			ga('send', 'event', 'Radar', 'Show', 'Direct link');
			model.showRadar();
		} else if (window.location.hash == "#min-position") {
			if ("geolocation" in navigator) {
				model.getCurrentZipCodeFromUserLocation(function(zipCode) {
					$(".zipcode").val(zipCode);
					model.displayForecasts(zipCode, model.scrollToForecasts);
				});
			} else {
				$("title, h1").text("Fejl i udtræk af position").addClass("error");
				$("<p class=\"error\">Din mobil understøtter ikke udtræk af din position</p>").insertBefore(".zipcode-selector");
			}
		}
		else {
			var zipCode = window.location.hash.replace("#", "");
			$(".zipcode").val(zipCode);

			model.displayForecasts(zipCode, model.scrollToForecasts);
			ga('send', 'event', 'Forecast', 'Show', 'Direct link', zipCode);
		}
	}
});
