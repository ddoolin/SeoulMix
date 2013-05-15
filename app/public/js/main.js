
$(document).ready(function() {

	// Initializing and populating the map --

	// Doesn't work with Korea...can't style maps -- all features disappear

	// var mapStyles = [{
	// 	featureType: "all",
	// 	elementType: "all",
	// 	stylers: [
	// 		{visibility: "on"},
	// 		{saturation: -100},
	// 		{gamma: 1.94}
	// 	]
	// }];

	// Options to pass to the map instance
	var mapOptions = {
		center: new google.maps.LatLng(37.525, 127.000),
		zoom: 12,
		streetViewControl: false,
		panControl: false,
		mapTypeControl: false,
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// Instantiate the map and pass options
	var map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions),
		geocoder = new google.maps.Geocoder(),
		location,
		coordArray = [];

	$.ajax({
		url: "/api/events",
		type: "GET",
		success: function (data, textStatus, jqXHR) {
			for (var i = 0; i < data.length; i++) {
				populateMap(data[i].location.lat, data[i].location.lng);
			}
		}
	});

	var populateMap = function (lat, lng) {
		var latLng = new google.maps.LatLng(lat, lng);
		var marker = new google.maps.Marker({
			map: map,
			position: latLng,
			animation: google.maps.Animation.DROP
		});
	}
});
