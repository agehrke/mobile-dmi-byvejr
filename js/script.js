$(function() {
	$(".zipcode-form").submit(function() {
		var zipcode = $(".zipcode").val();
		$(".byvejr").addClass("active");
		$(".two-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr_dag1?by="+ zipcode+"&mode=long");
		$(".two-day-forecast").attr("src", "http://servlet.dmi.dk/byvejr/servlet/byvejr?by="+ zipcode+"&tabel=dag3_9");
		return false;
	});
});