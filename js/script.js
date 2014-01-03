/*!
 * jQuery imagesLoaded plugin v2.0.1
 * http://github.com/desandro/imagesloaded
 *
 * MIT License. by Paul Irish et al.
 */
(function(c,n){var k="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";c.fn.imagesLoaded=function(l){function m(){var b=c(h),a=c(g);d&&(g.length?d.reject(e,b,a):d.resolve(e));c.isFunction(l)&&l.call(f,e,b,a)}function i(b,a){b.src===k||-1!==c.inArray(b,j)||(j.push(b),a?g.push(b):h.push(b),c(b).data("imagesLoaded",{isBroken:a,src:b.src}),o&&d.notifyWith(c(b),[a,e,c(h),c(g)]),e.length===j.length&&(setTimeout(m),e.unbind(".imagesLoaded")))}var f=this,d=c.isFunction(c.Deferred)?c.Deferred():
0,o=c.isFunction(d.notify),e=f.find("img").add(f.filter("img")),j=[],h=[],g=[];e.length?e.bind("load.imagesLoaded error.imagesLoaded",function(b){i(b.target,"error"===b.type)}).each(function(b,a){var e=a.src,d=c(a).data("imagesLoaded");if(d&&d.src===e)i(a,d.isBroken);else if(a.complete&&a.naturalWidth!==n)i(a,0===a.naturalWidth||0===a.naturalHeight);else if(a.readyState||a.complete)a.src=k,a.src=e}):m();return d?d.promise(f):f}})(jQuery);

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
	}());

function Forecast(container, imageUrlFunction) {
	var self = this;
	self.container = container;
	self.imageUrlFunction = imageUrlFunction;

	this.display = function(zipCode, callback) {
		self.container.addClass("loading").removeClass("loaded");

		var imageUrl = imageUrlFunction(zipCode);
		self.container.find(".forecast").attr("src", imageUrl);
		
		var dfd = container.imagesLoaded();
		dfd.done(function(images) {
			self.container.removeClass("loading").addClass("loaded");
			if ($.isFunction(callback)) callback();
		});
	};

	this.toggleScrollable = function() {
		self.container.toggleClass("scrollable");
	}

	this.isLoaded = function() {
		return self.container.hasClass("loaded");
	};
}

function ByvejrModel() {
	var self = this;
	self.zipCode = "";
	self.forecasts = {};

	// Create forecasts
	self.forecasts["dmi-2"] = new Forecast($(".two-day-forecast"), function(zipCode) {
									return "http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by="+ zipCode +"&mode=long";
								});
	
	self.forecasts["dmi-9"] = new Forecast($(".nine-day-forecast"), function(zipCode) {
									return "http://servlet.dmi.dk/byvejr/servlet/byvejr?by="+ zipCode +"&tabel=dag3_9";
								});

	self.forecasts["yr-2"] = new Forecast($(".two-day-forecast-yr"), yrNo.getHourlyForecastImageUrl);

	this.displayForecasts = function(zipCode, callback) {
		self.zipCode = zipCode;

		$(".byvejr").addClass("active");

		// Display DMI 2-day forecast
		self.forecasts["dmi-2"].display(zipCode, callback);
		
		// Reload previously loaded forecasts
		$.each(self.forecasts, function(i, forecast) {
			if (forecast.isLoaded()) forecast.display(zipCode);
		});

		// Get city name from zip code using Geoservicen
		$.getJSON("http://geo.oiorest.dk/postnumre/"+ zipCode +".json?callback=?", function(data) {
			$("title, h1").text(data.navn);
		});
	};

	this.getCurrentZipCodeFromUserLocation = function(callback){
		navigator.geolocation.getCurrentPosition(function(position) {
			var latLng = position.coords.latitude + "," + position.coords.longitude;
			$.getJSON("http://geo.oiorest.dk/postnumre/"+ latLng +".json?callback=?", function(data) {
				callback(data.fra);
			}, function(error) {
				console.warn("Failed to get current position", error);
			});
		});
	};

	this.showRadar = function() {
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
	};

	this.scrollToForecasts = function() {
		$('html, body').animate({scrollTop: $(".byvejr").offset().top}, 500);
	};	
};

// DOM ready
$(function() {
	var model = new ByvejrModel();

	// Handle click on radar link
	$(".radar-link").click(function() { 
		ga('send', 'event', 'Radar', 'Show', 'Link');
		model.showRadar();
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
	})
	// Toogle scrollable when clicking on forecast
	.on("click", ".forecast", function(e) {
		var name = $(e.delegateTarget).data("name");
		model.forecasts[name].toggleScrollable();
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
