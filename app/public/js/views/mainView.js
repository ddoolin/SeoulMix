$(document).ready(function () {

	var seoulmix = window.SeoulMix,
		mc = new seoulmix.mainController(),
		mapOptions,
		map,
		infoWindow,
		populateMap;

	mc.createMarker();

	// Set the cloudinary config
	$.cloudinary.config({
		"api_key": "389689266184749",
		"cloud_name": "seoulmix"
	});

	// Options to pass to the map instance
	mapOptions = {
		center: new google.maps.LatLng(37.525, 127.000),
		zoom: 12,
		streetViewControl: false,
		panControl: false	,
		mapTypeControl: false,
		zoomControlOptions: {
			position: google.maps.ControlPosition.LEFT_CENTER
		},
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	// Instantiate the map and pass options
	map = new google.maps.Map(document.getElementById("map_canvas"),
		mapOptions);

	// Set the map to our global object...we're going to need it.
	window.SeoulMix.map = map;

	$.ajax({
		url: "/api/events",
		type: "GET",
		success: function (data, textStatus, jqXHR) {
			for (var i = 0; i < data.length; i++) {
				populateMap(data[i]);
			}
		}
	});

	populateMap = function (data) {
		var event = data,
			latLng,
			marker,
			content;

		latLng = new google.maps.LatLng(event.location.lat, event.location.lng);
		marker = new google.maps.Marker({
			map: map,
			position: latLng,
			animation: google.maps.Animation.DROP,
			title: event.name
		});

		mc.createInfoWindow(false, marker, event);
	};
});
