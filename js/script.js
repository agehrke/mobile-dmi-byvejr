$(function() {		
	var displayForecasts = function(zipCode) {
		$(".byvejr").addClass("active");
		$(".two-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by="+ zipCode+"&mode=long");
		$(".nine-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr?by="+ zipCode+"&tabel=dag3_9");
		
		$.getJSON("http://geo.oiorest.dk/postnumre/"+ zipCode +".json?callback=?", function(data) {
			$("title, h1").text("DMI Byvejr - " + data.navn);
		});
	}
	
	if (window.location.hash) {
		var zipCode = window.location.hash.replace("#", "");
		$(".zipcode").val(zipCode);
		displayForecasts(zipCode);		
	}

	$(".zipcode-form").submit(function() {
		var zipCode = $(".zipcode").val();
		displayForecasts(zipCode);
		window.location.hash = zipCode;		
		return false;
	});
});